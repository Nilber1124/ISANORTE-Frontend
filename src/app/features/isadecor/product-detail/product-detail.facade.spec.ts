import { HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';

import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { ProductPublicationStatus } from '../../../data/models/product/product-publication-status.enum';
import { ProductResponse } from '../../../data/models/product/product-response.model';
import { ProductApiService } from '../../../data/services/product-api.service';
import { ProductDetailFacade } from './product-detail.facade';

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
