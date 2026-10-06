import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { Subject, finalize, takeUntil } from 'rxjs';
import { ISADECOR_UNIT_SLUG, PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { SeoRobots } from '../../../data/models/content/page-seo.model';
import {
  PublicPageSeoDefaults,
  applyPublicPageSeo,
  clearPublicPageSeo,
} from '../../../shared/utils/public-page-seo.util';

import {
  PublicProductDetailResponse,
  PublicProductDocumentResponse,
  PublicProductSpecificationResponse,
  PublicProductVariantResponse,
} from '../../../data/models/public-content/public-product-detail.model';

export interface ProductSpecificationGroup {
  name: string;
  specifications: readonly PublicProductSpecificationResponse[];
}

@Injectable()
export class ProductDetailFacade {
  readonly siteKey: string = PUBLIC_SITE_KEY;
  readonly unitSlug: string = ISADECOR_UNIT_SLUG;

  private readonly publicApi = inject(PublicContentApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT, { optional: true });
  private readonly platformId = inject(PLATFORM_ID);
  private readonly seoDefaults: PublicPageSeoDefaults = {
    title: 'Producto | ISADECOR',
    description: 'Conoce los productos de ISADECOR para tus espacios.',
  };

  private readonly _product = signal<PublicProductDetailResponse | null>(null);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);
  private readonly _notFound = signal(false);

  readonly product = this._product.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly notFound = this._notFound.asReadonly();

  constructor() {
    this.destroyRef.onDestroy(() => clearPublicPageSeo(this.title, this.meta));
  }

  readonly variants = computed<readonly PublicProductVariantResponse[]>(() =>
    this.sortByOrder(this._product()?.variantes ?? []),
  );

  readonly specificationGroups = computed<readonly ProductSpecificationGroup[]>(() => {
    const groups = new Map<string, PublicProductSpecificationResponse[]>();

    for (const specification of this.sortByOrder(this._product()?.especificaciones ?? [])) {
      const groupName = specification.grupo?.trim() || 'Especificaciones generales';
      const group = groups.get(groupName) ?? [];
      group.push(specification);
      groups.set(groupName, group);
    }

    return Array.from(groups, ([name, specifications]) => ({ name, specifications }));
  });

  readonly documents = computed<readonly PublicProductDocumentResponse[]>(() =>
    (this._product()?.documentos ?? []).filter((document) => this.hasSafeUrl(document.url)),
  );

  private currentSlug: string | null = null;
  private requestInFlight = false;

  load(slug: string, unitSlug: string = this.unitSlug): void {
    const normalizedSlug = slug.trim();

    if (normalizedSlug.length === 0) {
      this.currentSlug = null;
      this._product.set(null);
      this._loading.set(false);
      this._notFound.set(true);
      this._error.set('No se indicó un producto válido.');
      applyPublicPageSeo(this.title, this.meta, null, this.seoDefaults, this.document);
      return;
    }

    if (
      this.currentSlug === normalizedSlug &&
      (this.requestInFlight || (this._product() !== null && !this._error() && !this._notFound()))
    ) {
      return;
    }

    this.currentSlug = normalizedSlug;
    this._product.set(null);
    this._error.set(null);
    this._notFound.set(false);
    this._loading.set(true);
    this.requestInFlight = true;

    this.publicApi
      .getProductDetail(this.siteKey, unitSlug, normalizedSlug)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.requestInFlight = false;
          this._loading.set(false);
        }),
      )
      .subscribe({
        next: (product) => {
          this._product.set(product);
          const seoTitle = product.tituloSeo?.trim();
          const seoDescription = product.descripcionSeo?.trim();
          const defaultTitle = product.nombre?.trim() || this.seoDefaults.title;
          const defaultDescription = product.descripcion?.trim() || this.seoDefaults.description;
          const imageUrl = product.imagenes.find((image) => image.esPrincipal)?.url ?? product.imagenes[0]?.url;

          applyPublicPageSeo(
            this.title,
            this.meta,
            {
              seo: {
                title: seoTitle || defaultTitle,
                description: seoDescription || defaultDescription,
                ogImageUrl: imageUrl,
                robots: SeoRobots.INDEX_FOLLOW,
              },
            },
            this.seoDefaults,
            this.document,
          );
        },
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 404) {
            this._notFound.set(true);
            this._error.set('El producto no existe o no está disponible públicamente.');
            applyPublicPageSeo(
              this.title,
              this.meta,
              {
                seo: {
                  title: 'Producto no encontrado | ISADECOR',
                  description: 'El producto solicitado no está disponible en ISADECOR.',
                  ogImageUrl: null,
                  robots: SeoRobots.NOINDEX_NOFOLLOW,
                },
              },
              this.seoDefaults,
              this.document,
            );
            return;
          }

          this._error.set(
            'No pudimos cargar el producto. Comprueba tu conexión e inténtalo nuevamente.',
          );
          applyPublicPageSeo(this.title, this.meta, null, this.seoDefaults, this.document);
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
