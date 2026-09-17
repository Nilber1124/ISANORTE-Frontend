import { isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';

import { CategoryResponse } from '../../../data/models/category/category-response.model';
import { ProductResponse } from '../../../data/models/product/product-response.model';
import { CategoryApiService } from '../../../data/services/category-api.service';
import { ProductApiService } from '../../../data/services/product-api.service';

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

  private requestInFlight = false;

  readonly products = this._products.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly selectedCategory = this._selectedCategory.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();

  readonly filteredProducts = computed(() => {
    const selectedCategory = this._selectedCategory();
    const searchTerm = this.normalizeText(this._searchTerm());

    return this._products().filter((product) => {
      const belongsToCategory =
        selectedCategory === null ||
        product.categorias?.some((category) => category.id === selectedCategory) === true;

      if (!belongsToCategory || searchTerm.length === 0) {
        return belongsToCategory;
      }

      const searchableText = this.normalizeText(
        [product.nombre, product.sku, product.resumen ?? '', product.descripcion].join(' '),
      );

      return searchableText.includes(searchTerm);
    });
  });

  readonly hasActiveFilters = computed(
    () => this._selectedCategory() !== null || this.normalizeText(this._searchTerm()).length > 0,
  );

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
        },
        error: () => {
          this._error.set(
            'No pudimos cargar el catálogo. Comprueba tu conexión e inténtalo nuevamente.',
          );
        },
      });
  }

  setSelectedCategory(categoryId: string | null): void {
    this._selectedCategory.set(categoryId?.trim() || null);
  }

  setSearchTerm(searchTerm: string): void {
    this._searchTerm.set(searchTerm);
  }

  clearFilters(): void {
    this._selectedCategory.set(null);
    this._searchTerm.set('');
  }

  private normalizeText(value: string): string {
    return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es');
  }
}
