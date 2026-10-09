import { HttpErrorResponse } from '@angular/common/http';
import { EnvironmentInjector, PLATFORM_ID, createEnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { Observable, Subject, of, throwError } from 'rxjs';

import { ISADECOR_UNIT_SLUG, PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { ProductPriceComparisonResponse } from '../../../data/models/product/product-price-comparison-response.model';
import { ProductCompetitorComparisonResponse } from '../../../data/models/product/product-competitor-comparison-response.model';
import {
  ProductReviewOrder,
  ProductReviewResponse,
  RecommendedProductResponse,
  ReviewSummaryResponse,
} from '../../../data/models/product/product-review.model';
import { PublicProductDetailResponse } from '../../../data/models/public-content/public-product-detail.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { ProductDetailFacade } from './product-detail.facade';

const product: PublicProductDetailResponse = {
  sku: 'WP-ROBLE-001',
  nombre: 'Wall Panel Roble',
  slug: 'wall-panel-roble',
  resumen: 'Panel decorativo con acabado tipo madera.',
  descripcion: 'Wall panel decorativo para revestimiento de muros interiores.',
  tituloSeo: 'Wall Panel Roble | ISADECOR',
  descripcionSeo: 'Panel decorativo SEO.',
  precioBase: 49.9,
  precioAnterior: 59.9,
  descuentoPorcentaje: 16.69,
  disponibilidad: ProductAvailability.DISPONIBLE,
  retiroEnTienda: true,
  categorias: [{ nombre: 'Wall Panels', slug: 'wall-panels' }],
  variantes: [],
  imagenes: [],
  especificaciones: [
    { clave: 'Acabado', valor: 'Roble', grupo: 'Características', orden: 1 },
  ],
  documentos: [],
  configuracionCalculo: null,
};

const comparison: ProductPriceComparisonResponse = {
  producto: 'Wall Panel Roble',
  urlExterna: 'https://tienda.example/productos/wall-panel-roble',
  dominioExterno: 'tienda.example',
  nombreProductoExterno: 'Wall Panel Roble',
  precioInterno: 49.9,
  precioExterno: 54.9,
  monedaInterna: 'PEN',
  monedaExterna: 'PEN',
  diferencia: 5,
  porcentajeDiferencia: 10.02,
  comparable: true,
  estado: 'SUCCESS',
  mensaje: 'Comparación completada.',
  fechaConsulta: '2026-10-06T12:00:00Z',
};

const competitorComparison: ProductCompetitorComparisonResponse = {
  productoIsadecor: {
    nombre: 'Wall Panel Roble',
    precio: 49.9,
    precioAnterior: 59.9,
    moneda: 'PEN',
    unidadPrecio: null,
    caracteristicas: [],
  },
  competidores: [],
  diferenciasEncontradas: [],
  fechaConsulta: '2026-10-06T12:00:00Z',
};

class PublicApiStub {
  productResponse$: Observable<PublicProductDetailResponse> = of(product);
  comparisonResponse$: Observable<ProductPriceComparisonResponse> = of(comparison);
  competitorResponse$: Observable<ProductCompetitorComparisonResponse> = of(competitorComparison);
  readonly productCalls: unknown[][] = [];
  readonly comparisonCalls: unknown[][] = [];
  readonly competitorCalls: unknown[][] = [];
  readonly recommendationCalls: unknown[][] = [];
  readonly reviewCalls: unknown[][] = [];
  readonly summaryCalls: unknown[][] = [];
  readonly createReviewCalls: unknown[][] = [];

  getProductDetail(...args: unknown[]): Observable<PublicProductDetailResponse> {
    this.productCalls.push(args);
    return this.productResponse$;
  }

  getRecommendedProducts(...args: unknown[]): Observable<RecommendedProductResponse[]> {
    this.recommendationCalls.push(args);
    return of([]);
  }

  getProductReviews(...args: [...unknown[], ProductReviewOrder]): Observable<ProductReviewResponse[]> {
    this.reviewCalls.push(args);
    return of([]);
  }

  getProductReviewSummary(...args: unknown[]): Observable<ReviewSummaryResponse> {
    this.summaryCalls.push(args);
    return of({ promedio: 0, total: 0, distribucion: [] });
  }

  markReviewUseful(): Observable<ProductReviewResponse> {
    return throwError(() => new Error('not configured'));
  }

  createProductReview(...args: unknown[]): Observable<ProductReviewResponse> {
    this.createReviewCalls.push(args);
    return of({
      id: 'review-1',
      nombreCliente: 'Ana Cliente',
      calificacion: 5,
      titulo: null,
      comentario: 'Excelente acabado',
      fechaCreacion: '2026-10-09T12:00:00',
      compraVerificada: false,
      cantidadUtil: 0,
    });
  }

  compareProductPrice(...args: unknown[]): Observable<ProductPriceComparisonResponse> {
    this.comparisonCalls.push(args);
    return this.comparisonResponse$;
  }

  compareProductCompetitors(...args: unknown[]): Observable<ProductCompetitorComparisonResponse> {
    this.competitorCalls.push(args);
    return this.competitorResponse$;
  }
}

describe('ProductDetailFacade', () => {
  let facade: ProductDetailFacade;
  let publicApi: PublicApiStub;
  let titleService: Title;
  let metaService: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductDetailFacade,
        PublicApiStub,
        { provide: PublicContentApiService, useExisting: PublicApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    facade = TestBed.inject(ProductDetailFacade);
    publicApi = TestBed.inject(PublicApiStub);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
  });

  it('loads a published product using canonical siteKey, isadecor unit and normalized slug', () => {
    facade.load('  wall-panel-roble  ');

    expect(facade.siteKey).toBe(PUBLIC_SITE_KEY);
    expect(facade.unitSlug).toBe(ISADECOR_UNIT_SLUG);
    expect(publicApi.productCalls).toEqual([[PUBLIC_SITE_KEY, ISADECOR_UNIT_SLUG, 'wall-panel-roble']]);
    expect(facade.error()).toBeNull();
  });

  it('stores the product returned by the API', () => {
    facade.load('wall-panel-roble');

    expect(facade.product()).toEqual(product);
    expect(facade.notFound()).toBe(false);
  });

  it('identifies a 404 response as a product not found state', () => {
    publicApi.productResponse$ = throwError(
      () => new HttpErrorResponse({ status: 404, statusText: 'Not Found' }),
    );

    facade.load('no-existe');

    expect(facade.product()).toBeNull();
    expect(facade.notFound()).toBe(true);
    expect(facade.error()).toContain('no existe');
    expect(facade.loading()).toBe(false);
  });

  it('keeps loading active until the request finishes', () => {
    const response = new Subject<PublicProductDetailResponse>();
    publicApi.productResponse$ = response;

    facade.load('wall-panel-roble');
    expect(facade.loading()).toBe(true);

    response.next(product);
    response.complete();

    expect(facade.loading()).toBe(false);
  });

  it('rejects an empty slug without calling the API', () => {
    facade.load('   ');

    expect(publicApi.productCalls).toEqual([]);
    expect(facade.product()).toBeNull();
    expect(facade.notFound()).toBe(true);
    expect(facade.error()).toContain('válido');
    expect(facade.loading()).toBe(false);
  });

  it('applies custom SEO title and description when provided by the product', () => {
    facade.load('wall-panel-roble');

    expect(titleService.getTitle()).toBe('Wall Panel Roble | ISADECOR');
    expect(metaService.getTag('name="description"')?.content).toBe('Panel decorativo SEO.');
    expect(metaService.getTag('name="robots"')?.content).toBe('index, follow');
    expect(metaService.getTag('property="og:title"')?.content).toBe('Wall Panel Roble | ISADECOR');
    expect(metaService.getTag('property="og:description"')?.content).toBe('Panel decorativo SEO.');
    expect(metaService.getTag('property="og:type"')?.content).toBe('website');
  });

  it('falls back to product name and description when SEO fields are null', () => {
    const productWithoutSeo: PublicProductDetailResponse = {
      ...product,
      tituloSeo: null,
      descripcionSeo: null,
      imagenes: [
        { url: 'https://cdn.isadecor.pe/mesa.jpg', alt: 'Mesa', esPrincipal: true, orden: 0 },
      ],
    };
    publicApi.productResponse$ = of(productWithoutSeo);

    facade.load('wall-panel-roble');

    expect(titleService.getTitle()).toBe('Wall Panel Roble');
    expect(metaService.getTag('name="description"')?.content).toBe(product.descripcion);
    expect(metaService.getTag('property="og:title"')?.content).toBe('Wall Panel Roble');
    expect(metaService.getTag('property="og:description"')?.content).toBe(product.descripcion);
    expect(metaService.getTag('property="og:image"')?.content).toBe('https://cdn.isadecor.pe/mesa.jpg');
    expect(metaService.getTag('name="robots"')?.content).toBe('index, follow');
  });

  it('applies not found SEO on 404 error with noindex, nofollow', () => {
    publicApi.productResponse$ = throwError(
      () => new HttpErrorResponse({ status: 404, statusText: 'Not Found' }),
    );

    facade.load('no-existe');

    expect(titleService.getTitle()).toBe('Producto no encontrado | ISADECOR');
    expect(metaService.getTag('name="description"')?.content).toContain('no está disponible');
    expect(metaService.getTag('name="robots"')?.content).toBe('noindex, nofollow');
  });

  it('applies default SEO on generic API error', () => {
    publicApi.productResponse$ = throwError(
      () => new HttpErrorResponse({ status: 500, statusText: 'Server Error' }),
    );

    facade.load('error-prod');

    expect(titleService.getTitle()).toBe('Producto | ISADECOR');
    expect(metaService.getTag('name="description"')?.content).toBe(
      'Conoce los productos de ISADECOR para tus espacios.',
    );
    expect(metaService.getTag('name="robots"')?.content).toBe('index, follow');
  });

  it('cleans up SEO tags when destroyed', () => {
    const parentInjector = TestBed.inject(EnvironmentInjector);
    const childInjector = createEnvironmentInjector([ProductDetailFacade], parentInjector);
    const scopedFacade = childInjector.get(ProductDetailFacade);

    scopedFacade.load('wall-panel-roble');
    expect(titleService.getTitle()).toBe('Wall Panel Roble | ISADECOR');

    childInjector.destroy();
    expect(titleService.getTitle()).toBe('ISANORTE');
    expect(metaService.getTag('property="og:title"')).toBeNull();
    expect(metaService.getTag('property="og:description"')).toBeNull();
    expect(metaService.getTag('property="og:image"')).toBeNull();
  });

  it('avoids duplicate API requests when loading the same slug while already loaded', () => {
    facade.load('wall-panel-roble');
    expect(publicApi.productCalls.length).toBe(1);

    facade.load('wall-panel-roble');
    expect(publicApi.productCalls.length).toBe(1);
  });

  it('publishes once and refreshes the review list and summary after success', () => {
    facade.load('wall-panel-roble');
    const initialReviewCalls = publicApi.reviewCalls.length;
    const initialSummaryCalls = publicApi.summaryCalls.length;

    facade.submitReview({ calificacion: 5, titulo: null, comentario: 'Excelente acabado' });

    expect(publicApi.createReviewCalls).toEqual([[
      PUBLIC_SITE_KEY,
      ISADECOR_UNIT_SLUG,
      'wall-panel-roble',
      { calificacion: 5, titulo: null, comentario: 'Excelente acabado' },
    ]]);
    expect(facade.reviewSubmitted()).toBe(true);
    expect(facade.reviewSubmitting()).toBe(false);
    expect(publicApi.reviewCalls.length).toBe(initialReviewCalls + 1);
    expect(publicApi.summaryCalls.length).toBe(initialSummaryCalls + 1);
  });
});
