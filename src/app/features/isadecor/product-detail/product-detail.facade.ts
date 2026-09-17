import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import {
  ProductDocumentResponse,
  ProductResponse,
  ProductSpecificationResponse,
  ProductVariantResponse,
} from '../../../data/models/product/product-response.model';
import { ProductApiService } from '../../../data/services/product-api.service';

export interface ProductSpecificationGroup {
  name: string;
  specifications: readonly ProductSpecificationResponse[];
}

@Injectable()
export class ProductDetailFacade {
  private readonly productApi = inject(ProductApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _product = signal<ProductResponse | null>(null);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);
  private readonly _notFound = signal(false);

  readonly product = this._product.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly notFound = this._notFound.asReadonly();

  readonly variants = computed<readonly ProductVariantResponse[]>(() =>
    this.sortByOrder(this._product()?.variantes ?? []),
  );

  readonly specificationGroups = computed<readonly ProductSpecificationGroup[]>(() => {
    const groups = new Map<string, ProductSpecificationResponse[]>();

    for (const specification of this.sortByOrder(this._product()?.especificaciones ?? [])) {
      const groupName = specification.grupo?.trim() || 'Especificaciones generales';
      const group = groups.get(groupName) ?? [];
      group.push(specification);
      groups.set(groupName, group);
    }

    return Array.from(groups, ([name, specifications]) => ({ name, specifications }));
  });

  readonly documents = computed<readonly ProductDocumentResponse[]>(() =>
    (this._product()?.documentos ?? []).filter((document) => this.hasSafeUrl(document.url)),
  );

  load(slug: string): void {
    const normalizedSlug = slug.trim();

    this._product.set(null);
    this._error.set(null);
    this._notFound.set(false);

    if (normalizedSlug.length === 0) {
      this._loading.set(false);
      this._notFound.set(true);
      this._error.set('No se indicó un producto válido.');
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this._loading.set(true);

    this.productApi
      .getPublishedBySlug(normalizedSlug)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (product) => this._product.set(product),
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 404) {
            this._notFound.set(true);
            this._error.set('El producto no existe o no está disponible públicamente.');
            return;
          }

          this._error.set(
            'No pudimos cargar el producto. Comprueba tu conexión e inténtalo nuevamente.',
          );
        },
      });
  }

  private sortByOrder<T extends { orden: number | null }>(items: readonly T[]): T[] {
    return [...items].sort(
      (first, second) =>
        (first.orden ?? Number.MAX_SAFE_INTEGER) - (second.orden ?? Number.MAX_SAFE_INTEGER),
    );
  }

  private hasSafeUrl(value: string): boolean {
    const normalizedUrl = value.trim();

    if (normalizedUrl.length === 0) {
      return false;
    }

    try {
      const url = new URL(normalizedUrl, 'https://isadecor.local');
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
