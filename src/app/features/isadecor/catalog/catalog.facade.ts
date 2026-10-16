import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { catchError, debounceTime, distinctUntilChanged, map, of, scan, switchMap, tap } from 'rxjs';

import { ISADECOR_UNIT_SLUG, PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import {
  CatalogBackendOrder,
  PublicProductCardResponse,
  PublicProductCatalogCategoryResponse,
} from '../../../data/models/public-content/public-product-catalog.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';

export type CatalogSortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

const SORT_OPTION_TO_BACKEND_ORDER: Record<CatalogSortOption, CatalogBackendOrder> = {
  featured: 'DESTACADOS',
  'price-asc': 'PRECIO_ASC',
  'price-desc': 'PRECIO_DESC',
  'name-asc': 'NOMBRE_ASC',
};

const DEFAULT_PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 300;

interface CatalogQueryKey {
  categoria: string | null;
  q: string;
  orden: CatalogSortOption;
  soloDescuento: boolean;
  soloDisponible: boolean;
  soloDestacados: boolean;
  page: number;
  size: number;
  retryTick: number;
}

@Injectable()
export class CatalogFacade {
  readonly siteKey: string = PUBLIC_SITE_KEY;
  readonly unitSlug: string = ISADECOR_UNIT_SLUG;

  private readonly publicApi = inject(PublicContentApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _pageItems = signal<PublicProductCardResponse[]>([]);
  private readonly _categories = signal<PublicProductCatalogCategoryResponse[]>([]);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);
  private readonly _selectedCategory = signal<string | null>(null);
  private readonly _searchInput = signal('');
  private readonly _sortOption = signal<CatalogSortOption>('featured');
  private readonly _onlyDiscount = signal(false);
  private readonly _onlyInStock = signal(false);
  private readonly _onlyFeatured = signal(false);
  private readonly _page = signal(0);
  private readonly _pageSize = signal(DEFAULT_PAGE_SIZE);
  private readonly _totalItems = signal(0);
  private readonly _totalPages = signal(0);
  private readonly _retryTick = signal(0);

  private started = false;

  readonly products = this._pageItems.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly selectedCategory = this._selectedCategory.asReadonly();
  readonly searchTerm = this._searchInput.asReadonly();
  readonly sortOption = this._sortOption.asReadonly();
  readonly onlyDiscount = this._onlyDiscount.asReadonly();
  readonly onlyInStock = this._onlyInStock.asReadonly();
  readonly currentPage = this._page.asReadonly();
  readonly totalItems = this._totalItems.asReadonly();
  readonly totalPages = this._totalPages.asReadonly();

  readonly hasActiveFilters = computed(
    () =>
      this._selectedCategory() !== null ||
      this.normalizeText(this._searchInput()).length > 0 ||
      this._onlyDiscount() ||
      this._onlyInStock() ||
      this._sortOption() !== 'featured',
  );

  /** Término de búsqueda aplicado (debounced): el que realmente dispara la petición al backend. */
  private readonly debouncedSearch = toSignal(
    toObservable(this._searchInput).pipe(debounceTime(SEARCH_DEBOUNCE_MS), distinctUntilChanged()),
    { initialValue: '' },
  );

  /**
   * Combina filtros/orden/paginación en una clave reactiva y dispara el fetch al backend.
   * El `scan` corrige la página a 0 en el mismo paso en que cambia la búsqueda debounced
   * (en vez de hacerlo en un efecto aparte), evitando una doble petición: una con la página
   * vieja y otra con la página corregida. `distinctUntilChanged` descarta además la emisión
   * redundante que produce el propio ajuste de `_page` dentro del `scan`.
   */
  private readonly catalog$ = toObservable(
    computed<CatalogQueryKey>(() => ({
      categoria: this._selectedCategory(),
      q: this.debouncedSearch(),
      orden: this._sortOption(),
      soloDescuento: this._onlyDiscount(),
      soloDisponible: this._onlyInStock(),
      soloDestacados: this._onlyFeatured(),
      page: this._page(),
      size: this._pageSize(),
      retryTick: this._retryTick(),
    })),
  ).pipe(
    scan<CatalogQueryKey, CatalogQueryKey>((previous, query) => {
      const page = query.q !== previous.q ? 0 : query.page;
      if (page !== this._page()) {
        this._page.set(page);
      }
      return { ...query, page };
    }, {
      categoria: null, q: '', orden: 'featured', soloDescuento: false, soloDisponible: false,
      soloDestacados: false, page: 0, size: DEFAULT_PAGE_SIZE, retryTick: 0,
    }),
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    tap(() => {
      this._loading.set(true);
      this._error.set(null);
    }),
    switchMap((query) =>
      this.publicApi
        .getProductCatalog(this.siteKey, this.unitSlug, {
          page: query.page,
          size: query.size,
          categoria: query.categoria,
          q: query.q,
          soloDescuento: query.soloDescuento,
          soloDisponible: query.soloDisponible,
          soloDestacados: query.soloDestacados,
          orden: SORT_OPTION_TO_BACKEND_ORDER[query.orden],
        })
        .pipe(
          map((catalog) => ({ ok: true as const, catalog })),
          catchError(() => of({ ok: false as const })),
        ),
    ),
  );

  getCategoryCount(categorySlug: string): number {
    return this._categories().find((category) => category.slug === categorySlug)?.cantidad ?? 0;
  }

  /** Arranca la carga reactiva del catálogo. Llamadas posteriores reintentan la última petición. */
  load(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    if (this.started) {
      this._retryTick.update((tick) => tick + 1);
      return;
    }
    this.started = true;

    this.catalog$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result) => {
      if (result.ok) {
        this._pageItems.set(result.catalog.productos.contenido);
        this._categories.set(result.catalog.categorias);
        this._totalItems.set(result.catalog.productos.totalElementos);
        this._totalPages.set(result.catalog.productos.totalPaginas);
      } else {
        this._error.set(
          'No pudimos cargar el catálogo. Comprueba tu conexión e inténtalo nuevamente.',
        );
      }
      this._loading.set(false);
    });
  }

  setSelectedCategory(categoryIdOrSlug: string | null): void {
    if (!categoryIdOrSlug) {
      this._selectedCategory.set(null);
      this._page.set(0);
      return;
    }
    const trimmed = categoryIdOrSlug.trim();
    const match = this._categories().find(
      (category) =>
        category.slug === trimmed ||
        this.normalizeText(category.nombre) === this.normalizeText(trimmed),
    );
    this._selectedCategory.set(match ? match.slug : trimmed);
    this._page.set(0);
  }

  setSearchTerm(searchTerm: string): void {
    this._searchInput.set(searchTerm);
  }

  setSortOption(option: CatalogSortOption): void {
    this._sortOption.set(option);
    this._page.set(0);
  }

  toggleOnlyDiscount(): void {
    this._onlyDiscount.update((current) => !current);
    this._page.set(0);
  }

  toggleOnlyInStock(): void {
    this._onlyInStock.update((current) => !current);
    this._page.set(0);
  }

  /** Restringe el catálogo a productos destacados. Usado por vistas tipo "home" que reutilizan este facade. */
  setOnlyFeatured(onlyFeatured: boolean): void {
    this._onlyFeatured.set(onlyFeatured);
    this._page.set(0);
  }

  setPage(page: number): void {
    const clamped = Math.max(0, Math.min(page, Math.max(this._totalPages() - 1, 0)));
    this._page.set(clamped);
  }

  clearFilters(): void {
    this._selectedCategory.set(null);
    this._searchInput.set('');
    this._onlyDiscount.set(false);
    this._onlyInStock.set(false);
    this._sortOption.set('featured');
    this._page.set(0);
  }

  private normalizeText(value: string): string {
    return value
      .trim()
      .replace(/\s+/g, ' ')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLocaleLowerCase('es');
  }
}
