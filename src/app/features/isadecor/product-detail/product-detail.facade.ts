import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { Subject, catchError, finalize, forkJoin, of, takeUntil } from 'rxjs';
import { ISADECOR_UNIT_SLUG, PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { SeoRobots } from '../../../data/models/content/page-seo.model';
import { ProductPriceComparisonResponse } from '../../../data/models/product/product-price-comparison-response.model';
import { ProductCompetitorComparisonResponse } from '../../../data/models/product/product-competitor-comparison-response.model';
import {
  CreateProductReviewRequest,
  ProductReviewOrder,
  ProductReviewResponse,
  RecommendedProductResponse,
  ReviewSummaryResponse,
} from '../../../data/models/product/product-review.model';
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
  private readonly comparisonCancelled = new Subject<void>();
  private readonly competitorComparisonCancelled = new Subject<void>();
  private readonly detailCancelled = new Subject<void>();
  private readonly _comparisonLoading = signal(false);
  private readonly _comparisonResult = signal<ProductPriceComparisonResponse | null>(null);
  private readonly _comparisonError = signal<string | null>(null);
  readonly comparisonLoading = this._comparisonLoading.asReadonly();
  readonly comparisonResult = this._comparisonResult.asReadonly();
  readonly comparisonError = this._comparisonError.asReadonly();
  private readonly _competitorComparisonLoading = signal(false);
  private readonly _competitorComparisonResult = signal<ProductCompetitorComparisonResponse | null>(null);
  private readonly _competitorComparisonError = signal<string | null>(null);
  readonly competitorComparisonLoading = this._competitorComparisonLoading.asReadonly();
  readonly competitorComparisonResult = this._competitorComparisonResult.asReadonly();
  readonly competitorComparisonError = this._competitorComparisonError.asReadonly();
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
  private readonly _recommendedProducts = signal<readonly RecommendedProductResponse[]>([]);
  private readonly _reviews = signal<readonly ProductReviewResponse[]>([]);
  private readonly _reviewSummary = signal<ReviewSummaryResponse | null>(null);
  private readonly _communityLoading = signal(false);
  private readonly _communityError = signal<string | null>(null);
  private readonly _reviewOrder = signal<ProductReviewOrder>('RECIENTES');
  private readonly _reviewFilter = signal<number | null>(null);
  private readonly _reviewSubmitting = signal(false);
  private readonly _reviewSubmissionError = signal<string | null>(null);
  private readonly _reviewSubmitted = signal(false);
  private readonly _reviewAuthenticationRequired = signal(false);

  readonly product = this._product.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly notFound = this._notFound.asReadonly();
  readonly recommendedProducts = this._recommendedProducts.asReadonly();
  readonly reviews = this._reviews.asReadonly();
  readonly reviewSummary = this._reviewSummary.asReadonly();
  readonly communityLoading = this._communityLoading.asReadonly();
  readonly communityError = this._communityError.asReadonly();
  readonly reviewOrder = this._reviewOrder.asReadonly();
  readonly reviewFilter = this._reviewFilter.asReadonly();
  readonly reviewSubmitting = this._reviewSubmitting.asReadonly();
  readonly reviewSubmissionError = this._reviewSubmissionError.asReadonly();
  readonly reviewSubmitted = this._reviewSubmitted.asReadonly();
  readonly reviewAuthenticationRequired = this._reviewAuthenticationRequired.asReadonly();
  readonly visibleReviews = computed(() => {
    const rating = this._reviewFilter();
    return rating === null
      ? this._reviews()
      : this._reviews().filter((review) => review.calificacion === rating);
  });

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
      this.comparisonCancelled.next();
      this.competitorComparisonCancelled.next();
      this.detailCancelled.next();
      this.clearComparison();
      this._competitorComparisonResult.set(null);
      this._competitorComparisonError.set(null);
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
    this.detailCancelled.next();
    this.comparisonCancelled.next();
    this.competitorComparisonCancelled.next();
    this.clearComparison();
    this._competitorComparisonResult.set(null);
    this._competitorComparisonError.set(null);

    this._product.set(null);
    this._recommendedProducts.set([]);
    this._reviews.set([]);
    this._reviewSummary.set(null);
    this._communityError.set(null);
    this._reviewFilter.set(null);
    this._error.set(null);
    this._notFound.set(false);
    this._loading.set(true);
    this.requestInFlight = true;

    this.publicApi
      .getProductDetail(this.siteKey, unitSlug, normalizedSlug)
      .pipe(
        takeUntil(this.detailCancelled),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.requestInFlight = false;
          this._loading.set(false);
        }),
      )
      .subscribe({
        next: (product) => {
          this._product.set(product);
          this.loadCommunity(normalizedSlug, unitSlug);
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

  setReviewOrder(order: ProductReviewOrder): void {
    if (this._reviewOrder() === order) return;
    this._reviewOrder.set(order);
    if (this.currentSlug) {
      this.loadReviews(this.currentSlug, this.unitSlug);
    }
  }

  toggleReviewFilter(rating: number): void {
    this._reviewFilter.update((current) => current === rating ? null : rating);
  }

  submitReview(request: CreateProductReviewRequest): void {
    if (!this.currentSlug || this._reviewSubmitting()) return;
    this._reviewSubmitting.set(true);
    this._reviewSubmissionError.set(null);
    this._reviewSubmitted.set(false);
    this._reviewAuthenticationRequired.set(false);
    this.publicApi.createProductReview(this.siteKey, this.unitSlug, this.currentSlug, request)
      .pipe(takeUntil(this.detailCancelled), takeUntilDestroyed(this.destroyRef), finalize(() => this._reviewSubmitting.set(false)))
      .subscribe({
        next: () => {
          this._reviewSubmitted.set(true);
          this.loadReviews(this.currentSlug!, this.unitSlug);
          this.publicApi.getProductReviewSummary(this.siteKey, this.unitSlug, this.currentSlug!)
            .pipe(takeUntil(this.detailCancelled), takeUntilDestroyed(this.destroyRef))
            .subscribe((summary) => this._reviewSummary.set(summary));
        },
        error: (error: unknown) => {
          const status = error instanceof HttpErrorResponse ? error.status : 0;
          if (status === 401 || status === 403) this._reviewAuthenticationRequired.set(true);
          this._reviewSubmissionError.set(status === 401 || status === 403
            ? 'Tu sesión venció. Inicia sesión nuevamente para conservar y publicar tu opinión.'
            : status === 409 ? 'Ya publicaste una reseña para este producto.'
              : status === 400 ? 'Revisa la calificación y el comentario.'
                : 'No pudimos publicar tu reseña. Inténtalo nuevamente.');
        },
      });
  }

  clearReviewSubmissionState(): void {
    this._reviewSubmissionError.set(null);
    this._reviewSubmitted.set(false);
    this._reviewAuthenticationRequired.set(false);
  }

  markReviewUseful(reviewId: string): void {
    this.publicApi.markReviewUseful(reviewId)
      .pipe(takeUntil(this.detailCancelled), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => this._reviews.update((reviews) =>
          reviews.map((review) => review.id === updated.id ? updated : review)),
      });
  }

  clearComparison(): void {
    if (this._comparisonLoading()) return;
    this._comparisonResult.set(null);
    this._comparisonError.set(null);
  }

  comparePrice(urlExterna: string, unitSlug: string = this.unitSlug): void {
    const product = this._product();
    if (!isPlatformBrowser(this.platformId) || !product || this._comparisonLoading()) return;
    this.clearComparison();
    this._comparisonLoading.set(true);
    this.publicApi
      .compareProductPrice(this.siteKey, unitSlug, product.slug, { urlExterna })
      .pipe(
        takeUntil(this.comparisonCancelled),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._comparisonLoading.set(false)),
      )
      .subscribe({
        next: (result) => this._comparisonResult.set(result),
        error: (error: unknown) => {
          const status = error instanceof HttpErrorResponse ? error.status : 0;
          this._comparisonError.set(
            status === 404
              ? 'El producto ya no está disponible públicamente para comparar.'
              : status === 400
                ? 'Ingresa una URL válida del producto.'
                : 'No pudimos completar la comparación. Inténtalo nuevamente.',
          );
        },
      });
  }

  compareCompetitors(unitSlug: string = this.unitSlug): void {
    const product = this._product();
    if (!isPlatformBrowser(this.platformId) || !product || this._competitorComparisonLoading()) return;
    this._competitorComparisonResult.set(null);
    this._competitorComparisonError.set(null);
    this._competitorComparisonLoading.set(true);
    this.publicApi
      .compareProductCompetitors(this.siteKey, unitSlug, product.slug)
      .pipe(
        takeUntil(this.competitorComparisonCancelled),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._competitorComparisonLoading.set(false)),
      )
      .subscribe({
        next: (result) => this._competitorComparisonResult.set(result),
        error: () =>
          this._competitorComparisonError.set(
            'No pudimos buscar productos similares. Inténtalo nuevamente.',
          ),
      });
  }

  private loadCommunity(slug: string, unitSlug: string): void {
    this._communityLoading.set(true);
    forkJoin({
      recommendations: this.publicApi.getRecommendedProducts(this.siteKey, unitSlug, slug),
      summary: this.publicApi.getProductReviewSummary(this.siteKey, unitSlug, slug),
    })
      .pipe(
        takeUntil(this.detailCancelled),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._communityLoading.set(false)),
        catchError(() => {
          this._communityError.set('No pudimos cargar las recomendaciones y opiniones en este momento.');
          return of(null);
        }),
      )
      .subscribe((result) => {
        if (!result) return;
        this._recommendedProducts.set(result.recommendations);
        this._reviewSummary.set(result.summary);
      });
    this.loadReviews(slug, unitSlug);
  }

  private loadReviews(slug: string, unitSlug: string): void {
    this.publicApi.getProductReviews(this.siteKey, unitSlug, slug, this._reviewOrder())
      .pipe(
        takeUntil(this.detailCancelled),
        takeUntilDestroyed(this.destroyRef),
        catchError(() => {
          this._communityError.set('No pudimos cargar los comentarios en este momento.');
          return of([] as ProductReviewResponse[]);
        }),
      )
      .subscribe((reviews) => this._reviews.set(reviews));
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
