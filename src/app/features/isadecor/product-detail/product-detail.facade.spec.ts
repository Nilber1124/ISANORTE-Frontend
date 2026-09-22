import { HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';

import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { ProductPublicationStatus } from '../../../data/models/product/product-publication-status.enum';
import { ProductResponse } from '../../../data/models/product/product-response.model';
import { ProductApiService } from '../../../data/services/product-api.service';
import { ProductDetailFacade } from './product-detail.facade';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { ProductPriceComparisonResponse } from '../../../data/models/product/product-price-comparison-response.model';

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

class PublicApiStub {
  response$: Observable<ProductPriceComparisonResponse> = of(comparison);
  readonly calls: unknown[][] = [];
  compareProductPrice(...args: unknown[]): Observable<ProductPriceComparisonResponse> {
    this.calls.push(args);
    return this.response$;
  }
}

const product: ProductResponse = {
  id: 'product-1',
  sku: 'WP-ROBLE-001',
  nombre: 'Wall Panel Roble',
  slug: 'wall-panel-roble',
  resumen: 'Panel decorativo con acabado tipo madera.',
  descripcion: 'Wall panel decorativo para revestimiento de muros interiores.',
  precioBase: 49.9,
  precioAnterior: 59.9,
  descuentoPorcentaje: 16.69,
  disponibilidad: ProductAvailability.DISPONIBLE,
  destacado: true,
  estado: ProductPublicationStatus.PUBLICADO,
  tituloSeo: 'Wall Panel Roble',
  descripcionSeo: 'Wall panel decorativo acabado roble.',
  unidadNegocio: { id: 'business-isadecor', nombre: 'ISADECOR', slug: 'isadecor' },
  categorias: [{ id: 'category-wall-panels', nombre: 'Wall Panels', slug: 'wall-panels' }],
  variantes: [],
  imagenes: [],
  especificaciones: [
    { id: 'spec-1', clave: 'Acabado', valor: 'Roble', grupo: 'Características', orden: 1 },
  ],
  documentos: [],
  configuracionCalculo: null,
  fechaCreacion: null,
  fechaActualizacion: null,
};

class ProductApiStub {
  response$: Observable<ProductResponse> = of(product);
  readonly requestedSlugs: string[] = [];

  getPublishedBySlug(slug: string): Observable<ProductResponse> {
    this.requestedSlugs.push(slug);
    return this.response$;
  }
}

describe('ProductDetailFacade', () => {
  let facade: ProductDetailFacade;
  let productApi: ProductApiStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ProductDetailFacade,
        ProductApiStub,
        PublicApiStub,
        { provide: PublicContentApiService, useExisting: PublicApiStub },
        { provide: ProductApiService, useExisting: ProductApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    facade = TestBed.inject(ProductDetailFacade);
    productApi = TestBed.inject(ProductApiStub);
  });

  it('loads a published product using the normalized slug', () => {
    facade.load('  wall-panel-roble  ');

    expect(productApi.requestedSlugs).toEqual(['wall-panel-roble']);
    expect(facade.error()).toBeNull();
  });

  it('only compares on explicit action and submits no client price', () => {
    facade.load('wall-panel-roble');
    const api = TestBed.inject(PublicApiStub);
    expect(api.calls).toEqual([]);
    facade.comparePrice('https://tienda.example/mesa');
    expect(api.calls).toEqual([
      ['isanorte', 'isadecor', 'wall-panel-roble', { urlExterna: 'https://tienda.example/mesa' }],
    ]);
    expect(facade.comparisonResult()).toEqual(comparison);
    expect(facade.product()).toEqual(product);
  });

  it('keeps comparison loading independent and prevents concurrent requests', () => {
    facade.load('wall-panel-roble');
    const api = TestBed.inject(PublicApiStub);
    const response = new Subject<ProductPriceComparisonResponse>();
    api.response$ = response;
    facade.comparePrice('https://tienda.example/mesa');
    facade.comparePrice('https://tienda.example/otra');
    expect(api.calls.length).toBe(1);
    expect(facade.comparisonLoading()).toBe(true);
    expect(facade.loading()).toBe(false);
    response.next(comparison);
    response.complete();
    expect(facade.comparisonLoading()).toBe(false);
  });

  it('handles backend errors without losing the product', () => {
    facade.load('wall-panel-roble');
    TestBed.inject(PublicApiStub).response$ = throwError(
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
    TestBed.inject(PublicApiStub).response$ = response;
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
    productApi.response$ = throwError(
      () => new HttpErrorResponse({ status: 404, statusText: 'Not Found' }),
    );

    facade.load('no-existe');

    expect(facade.product()).toBeNull();
    expect(facade.notFound()).toBe(true);
    expect(facade.error()).toContain('no existe');
    expect(facade.loading()).toBe(false);
  });

  it('keeps loading active until the request finishes', () => {
    const response = new Subject<ProductResponse>();
    productApi.response$ = response;

    facade.load('wall-panel-roble');
    expect(facade.loading()).toBe(true);

    response.next(product);
    response.complete();

    expect(facade.loading()).toBe(false);
  });

  it('rejects an empty slug without calling the API', () => {
    facade.load('   ');

    expect(productApi.requestedSlugs).toEqual([]);
    expect(facade.product()).toBeNull();
    expect(facade.notFound()).toBe(true);
    expect(facade.error()).toContain('válido');
    expect(facade.loading()).toBe(false);
  });
});
