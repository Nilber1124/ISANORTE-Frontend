import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { catchError, distinctUntilChanged, map, of, Subject, timer, switchMap, tap } from 'rxjs';

import { ISADECOR_UNIT_SLUG, PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import {
  CatalogBackendOrder,
  CatalogExtraFilters,
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

interface CatalogQueryKey extends CatalogExtraFilters {
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
  private readonly _appliedSearch = signal('');
  private readonly searchChanges = new Subject<{ text: string; immediate: boolean }>();
  private readonly _sortOption = signal<CatalogSortOption>('featured');
  private readonly _onlyDiscount = signal(false);
  private readonly _onlyInStock = signal(false);
  private readonly _onlyFeatured = signal(false);
  private readonly _extra = signal<CatalogExtraFilters>({});
  readonly extra = this._extra.asReadonly();
  readonly priceRange = signal<{ min: number | null; max: number | null }>({
    min: null,
    max: null,
  });
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
  readonly onlyFeatured = this._onlyFeatured.asReadonly();
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
      this._onlyFeatured() ||
      Object.values(this.extra()).some((value) => value != null) ||
      this._sortOption() !== 'featured',
  );

  private readonly catalog$ = toObservable(
    computed<CatalogQueryKey>(() => ({
      modalidad: this.extra().modalidad ?? null,
      acabado: this.extra().acabado ?? null,
      facilInstalacion: this.extra().facilInstalacion ?? null,
      precioMin: this.extra().precioMin ?? null,
      precioMax: this.extra().precioMax ?? null,
      categoria: this._selectedCategory(),
      q: this._appliedSearch(),
      orden: this._sortOption(),
      soloDescuento: this._onlyDiscount(),
      soloDisponible: this._onlyInStock(),
      soloDestacados: this._onlyFeatured(),
      page: this._page(),
      size: this._pageSize(),
      retryTick: this._retryTick(),
    })),
  ).pipe(
    distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b)),
    tap(() => {
      this._loading.set(true);
      this._error.set(null);
    }),
    switchMap((query) =>
      this.publicApi
        .getProductCatalog(this.siteKey, this.unitSlug, {
          ...(query.modalidad && { modalidad: query.modalidad }),
          ...(query.facilInstalacion != null && { facilInstalacion: query.facilInstalacion }),
          ...(query.precioMin != null && { precioMin: query.precioMin }),
          ...(query.precioMax != null && { precioMax: query.precioMax }),
          ...(query.acabado && { acabado: query.acabado }),
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

  constructor() {
    this.searchChanges
      .pipe(
        switchMap(({ text, immediate }) =>
          immediate ? of(text) : timer(SEARCH_DEBOUNCE_MS).pipe(map(() => text)),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((text) => {
        if (this._appliedSearch() !== text) {
          this._appliedSearch.set(text);
          this._page.set(0);
        }
      });
  }

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
        this.priceRange.set({
          min: result.catalog.precioMinimo ?? null,
          max: result.catalog.precioMaximo ?? null,
        });
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

  setSearchTerm(searchTerm: string, immediate = false): void {
    this._searchInput.set(searchTerm);
    this.searchChanges.next({ text: searchTerm.trim(), immediate });
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

  setExtraFilters(filters: CatalogExtraFilters): void {
    this._extra.set(filters);
    this._page.set(0);
  }

  setAvailabilityFilters(discount: boolean, available: boolean): void {
    this._onlyDiscount.set(discount);
    this._onlyInStock.set(available);
    this._page.set(0);
  }

  clearFilters(): void {
    this._extra.set({});
    this._onlyFeatured.set(false);
    this._selectedCategory.set(null);
    this.setSearchTerm('', true);
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
