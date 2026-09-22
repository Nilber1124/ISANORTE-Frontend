import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';

import { CategoryResponse } from '../../../data/models/category/category-response.model';
import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { ProductResponse } from '../../../data/models/product/product-response.model';
import { CategoryApiService } from '../../../data/services/category-api.service';
import { ProductApiService } from '../../../data/services/product-api.service';

export type CatalogSortOption = 'featured' | 'price-asc' | 'price-desc' | 'name-asc';

@Injectable()
export class CatalogFacade {
  private readonly productApi = inject(ProductApiService);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _products = signal<ProductResponse[]>([]);
  private readonly _categories = signal<CategoryResponse[]>([]);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);
  private readonly _selectedCategory = signal<string | null>(null);
  private readonly _searchTerm = signal('');
  private readonly _sortOption = signal<CatalogSortOption>('featured');
  private readonly _onlyDiscount = signal(false);
  private readonly _onlyInStock = signal(false);

  private requestInFlight = false;

  readonly products = this._products.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly selectedCategory = this._selectedCategory.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly sortOption = this._sortOption.asReadonly();
  readonly onlyDiscount = this._onlyDiscount.asReadonly();
  readonly onlyInStock = this._onlyInStock.asReadonly();

  readonly categoryCounts = computed(() => {
    const counts = new Map<string, number>();
    for (const product of this._products()) {
      for (const category of product.categorias ?? []) {
        counts.set(category.id, (counts.get(category.id) ?? 0) + 1);
      }
    }
    return counts;
  });

  readonly filteredProducts = computed(() => {
    const selectedCategory = this._selectedCategory();
    const searchTerm = this.normalizeText(this._searchTerm());
    const onlyDiscount = this._onlyDiscount();
    const onlyInStock = this._onlyInStock();
    const sort = this._sortOption();

    const filtered = this._products().filter((product) => {
      const belongsToCategory =
        selectedCategory === null ||
        product.categorias?.some(
          (category) =>
            category.id === selectedCategory ||
            category.slug === selectedCategory ||
            this.normalizeText(category.nombre) === this.normalizeText(selectedCategory),
        ) === true;

      if (!belongsToCategory) return false;

      if (onlyDiscount) {
        const hasDiscount =
          product.descuentoPorcentaje !== null &&
          product.descuentoPorcentaje !== undefined &&
          product.descuentoPorcentaje > 0;
        if (!hasDiscount) return false;
      }

      if (onlyInStock) {
        if (product.disponibilidad !== ProductAvailability.DISPONIBLE) return false;
      }

      if (searchTerm.length === 0) return true;

      const searchableText = this.normalizeText(
        [
          product.nombre,
          product.sku,
          product.resumen ?? '',
          product.descripcion,
          ...(product.categorias ?? []).map((category) => category.nombre),
        ].join(' '),
      );

      return searchableText.includes(searchTerm);
    });

    return [...filtered].sort((a, b) => {
      switch (sort) {
        case 'price-asc': {
          const pA = a.precioBase ?? Number.POSITIVE_INFINITY;
          const pB = b.precioBase ?? Number.POSITIVE_INFINITY;
          return pA - pB || a.nombre.localeCompare(b.nombre, 'es');
        }
        case 'price-desc': {
          const pA = a.precioBase ?? -1;
          const pB = b.precioBase ?? -1;
          return pB - pA || a.nombre.localeCompare(b.nombre, 'es');
        }
        case 'name-asc':
          return a.nombre.localeCompare(b.nombre, 'es');
        case 'featured':
        default: {
          const featA = a.destacado === true ? 1 : 0;
          const featB = b.destacado === true ? 1 : 0;
          return featB - featA || a.nombre.localeCompare(b.nombre, 'es');
        }
      }
    });
  });

  readonly hasActiveFilters = computed(
    () =>
      this._selectedCategory() !== null ||
      this.normalizeText(this._searchTerm()).length > 0 ||
      this._onlyDiscount() ||
      this._onlyInStock() ||
      this._sortOption() !== 'featured',
  );

  getCategoryCount(categoryId: string): number {
    return this.categoryCounts().get(categoryId) ?? 0;
  }

  load(): void {
    if (!isPlatformBrowser(this.platformId) || this.requestInFlight) {
      return;
    }

    this.requestInFlight = true;
    this._loading.set(true);
    this._error.set(null);

    forkJoin({
      products: this.productApi.getPublished(),
      categories: this.categoryApi.getActive(),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.requestInFlight = false;
          this._loading.set(false);
        }),
      )
      .subscribe({
        next: ({ products, categories }) => {
          this._products.set(products);
          this._categories.set(categories);
          const current = this._selectedCategory();
          if (current) {
            const match = categories.find(
              (category) =>
                category.id === current ||
                category.slug === current ||
                this.normalizeText(category.nombre) === this.normalizeText(current),
            );
            if (match) {
              this._selectedCategory.set(match.id);
            }
          }
        },
        error: () => {
          this._error.set(
            'No pudimos cargar el catálogo. Comprueba tu conexión e inténtalo nuevamente.',
          );
        },
      });
  }

  setSelectedCategory(categoryIdOrSlug: string | null): void {
    if (!categoryIdOrSlug) {
      this._selectedCategory.set(null);
      return;
    }
    const trimmed = categoryIdOrSlug.trim();
    const match = this._categories().find(
      (category) =>
        category.id === trimmed ||
        category.slug === trimmed ||
        this.normalizeText(category.nombre) === this.normalizeText(trimmed),
    );
    this._selectedCategory.set(match ? match.id : trimmed);
  }

  setSearchTerm(searchTerm: string): void {
    this._searchTerm.set(searchTerm);
  }

  setSortOption(option: CatalogSortOption): void {
    this._sortOption.set(option);
  }

  toggleOnlyDiscount(): void {
    this._onlyDiscount.update((current) => !current);
  }

  toggleOnlyInStock(): void {
    this._onlyInStock.update((current) => !current);
  }

  clearFilters(): void {
    this._selectedCategory.set(null);
    this._searchTerm.set('');
    this._onlyDiscount.set(false);
    this._onlyInStock.set(false);
    this._sortOption.set('featured');
  }

  private normalizeText(value: string): string {
    return value
      .trim()
      .replace(/\s+/g, ' ')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLocaleLowerCase('es');
  }
}
