import { HttpErrorResponse } from '@angular/common/http';
import { EnvironmentInjector, PLATFORM_ID, createEnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { Observable, Subject, of, throwError } from 'rxjs';

import { ISADECOR_UNIT_SLUG, PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { ProductPriceComparisonResponse } from '../../../data/models/product/product-price-comparison-response.model';
import { ProductCompetitorComparisonResponse } from '../../../data/models/product/product-competitor-comparison-response.model';
import { PublicProductDetailResponse } from '../../../data/models/public-content/public-product-detail.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { ProductDetailFacade } from './product-detail.facade';

const comparison: ProductPriceComparisonResponse = {
  producto: 'Mesa',
  urlExterna: 'https://tienda.example/mesa',
  dominioExterno: 'tienda.example',
  nombreProductoExterno: 'Mesa externa',
  precioInterno: 850,
  precioExterno: 920,
  monedaInterna: 'PEN',
  monedaExterna: 'PEN',
  diferencia: 70,
  porcentajeDiferencia: 8.24,
  comparable: true,
  estado: 'SUCCESS',
  mensaje: 'ISADECOR tiene un precio S/ 70.00 menor.',
  fechaConsulta: '2026-09-22T12:00:00Z',
};

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

class PublicApiStub {
  productResponse$: Observable<PublicProductDetailResponse> = of(product);
  comparisonResponse$: Observable<ProductPriceComparisonResponse> = of(comparison);
  competitorResponse$: Observable<ProductCompetitorComparisonResponse> = of({
    productoIsadecor: {
      nombre: 'Wall Panel Roble',
      precio: 49.9,
      precioAnterior: 59.9,
      moneda: 'PEN',
      unidadPrecio: 'm2',
      caracteristicas: [],
    },
    competidores: [],
    diferenciasEncontradas: [],
    fechaConsulta: '2026-09-22T12:00:00Z',
  });
  readonly productCalls: unknown[][] = [];
  readonly comparisonCalls: unknown[][] = [];
  readonly competitorCalls: unknown[][] = [];

  getProductDetail(...args: unknown[]): Observable<PublicProductDetailResponse> {
    this.productCalls.push(args);
    return this.productResponse$;
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

  it('only compares on explicit action and submits no client price', () => {
    facade.load('wall-panel-roble');
    expect(publicApi.comparisonCalls).toEqual([]);
    facade.comparePrice('https://tienda.example/mesa');
    expect(publicApi.comparisonCalls).toEqual([
      [PUBLIC_SITE_KEY, ISADECOR_UNIT_SLUG, 'wall-panel-roble', { urlExterna: 'https://tienda.example/mesa' }],
    ]);
    expect(facade.comparisonResult()).toEqual(comparison);
    expect(facade.product()).toEqual(product);
  });

  it('compares competitors using canonical siteKey and centralized unitSlug', () => {
    facade.load('wall-panel-roble');
    expect(publicApi.competitorCalls).toEqual([]);
    facade.compareCompetitors();
    expect(publicApi.competitorCalls).toEqual([[PUBLIC_SITE_KEY, ISADECOR_UNIT_SLUG, 'wall-panel-roble']]);
    expect(facade.competitorComparisonLoading()).toBe(false);
    expect(facade.competitorComparisonResult()).toBeTruthy();
  });

  it('keeps comparison loading independent and prevents concurrent requests', () => {
    facade.load('wall-panel-roble');
    const response = new Subject<ProductPriceComparisonResponse>();
    publicApi.comparisonResponse$ = response;
    facade.comparePrice('https://tienda.example/mesa');
    facade.comparePrice('https://tienda.example/otra');
    expect(publicApi.comparisonCalls.length).toBe(1);
    expect(facade.comparisonLoading()).toBe(true);
    expect(facade.loading()).toBe(false);
    response.next(comparison);
    response.complete();
    expect(facade.comparisonLoading()).toBe(false);
  });

  it('handles backend errors without losing the product', () => {
    facade.load('wall-panel-roble');
    publicApi.comparisonResponse$ = throwError(
      () => new HttpErrorResponse({ status: 503 }),
    );
    facade.comparePrice('https://tienda.example/mesa');
    expect(facade.comparisonError()).toContain('No pudimos');
    expect(facade.comparisonResult()).toBeNull();
    expect(facade.comparisonLoading()).toBe(false);
    expect(facade.error()).toBeNull();
    expect(facade.product()).toEqual(product);
  });

  it('cancels stale comparison results when a different detail is loaded', () => {
    facade.load('wall-panel-roble');
    const response = new Subject<ProductPriceComparisonResponse>();
    publicApi.comparisonResponse$ = response;
    facade.comparePrice('https://tienda.example/mesa');
    facade.load('otro-producto');
    response.next(comparison);
    expect(facade.comparisonResult()).toBeNull();
    expect(facade.comparisonLoading()).toBe(false);
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
});
