import { HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';

import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { ProductPublicationStatus } from '../../../data/models/product/product-publication-status.enum';
import { ProductResponse } from '../../../data/models/product/product-response.model';
import { QuoteChannel } from '../../../data/models/quote/quote-channel.enum';
import { QuoteCreateRequest } from '../../../data/models/quote/quote-create-request.model';
import { QuoteResponse } from '../../../data/models/quote/quote-response.model';
import { QuoteStatus } from '../../../data/models/quote/quote-status.enum';
import { ProductApiService } from '../../../data/services/product-api.service';
import { QuoteApiService } from '../../../data/services/quote-api.service';
import { QuoteFacade } from './quote.facade';

const product: ProductResponse = {
  id: '8eb571c9-2810-4bd0-9452-61fd5b46e4c7',
  sku: 'WP-ROBLE-001',
  nombre: 'Wall Panel Roble',
  slug: 'wall-panel-roble',
  resumen: null,
  descripcion: 'Panel',
  precioBase: 49.9,
  precioAnterior: null,
  descuentoPorcentaje: null,
  disponibilidad: ProductAvailability.DISPONIBLE,
  destacado: null,
  estado: ProductPublicationStatus.PUBLICADO,
  tituloSeo: null,
  descripcionSeo: null,
  unidadNegocio: { id: 'business-1', nombre: 'ISADECOR', slug: 'isadecor' },
  categorias: [],
  variantes: [],
  imagenes: [],
  especificaciones: [],
  documentos: [],
  configuracionCalculo: null,
  fechaCreacion: null,
  fechaActualizacion: null,
};
const request: QuoteCreateRequest = {
  nombreCliente: 'Ana',
  emailCliente: 'ana@example.com',
  telefonoCliente: '999 999 999',
  empresaCliente: null,
  ciudad: null,
  mensaje: null,
  canal: QuoteChannel.FORMULARIO,
  detalles: [{ productoId: product.id, varianteId: null, cantidad: 21, notas: null }],
};
const response: QuoteResponse = {
  id: 'quote-1',
  codigo: 'COT-0001',
  nombreCliente: 'Ana',
  emailCliente: 'ana@example.com',
  telefonoCliente: '999 999 999',
  empresaCliente: null,
  ciudad: null,
  mensaje: null,
  canal: QuoteChannel.FORMULARIO,
  estado: QuoteStatus.NUEVA,
  totalEstimado: null,
  detalles: [],
  seguimientos: [],
  fechaCreacion: null,
  fechaActualizacion: null,
};

class ProductApiStub {
  response$: Observable<ProductResponse> = of(product);
  requestedSlugs: string[] = [];
  getPublishedBySlug(slug: string): Observable<ProductResponse> {
    this.requestedSlugs.push(slug);
    return this.response$;
  }
}
class QuoteApiStub {
  response$: Observable<QuoteResponse> = of(response);
  requests: QuoteCreateRequest[] = [];
  create(value: QuoteCreateRequest): Observable<QuoteResponse> {
    this.requests.push(value);
    return this.response$;
  }
}

describe('QuoteFacade', () => {
  let facade: QuoteFacade;
  let productApi: ProductApiStub;
  let quoteApi: QuoteApiStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QuoteFacade,
        ProductApiStub,
        QuoteApiStub,
        { provide: ProductApiService, useExisting: ProductApiStub },
        { provide: QuoteApiService, useExisting: QuoteApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    facade = TestBed.inject(QuoteFacade);
    productApi = TestBed.inject(ProductApiStub);
    quoteApi = TestBed.inject(QuoteApiStub);
  });

  it('loads a published product by slug', () => {
    facade.loadProduct(' wall-panel-roble ');
    expect(productApi.requestedSlugs).toEqual(['wall-panel-roble']);
    expect(facade.product()).toEqual(product);
  });
  it('marks a 404 product as not found', () => {
    productApi.response$ = throwError(() => new HttpErrorResponse({ status: 404 }));
    facade.loadProduct('missing');
    expect(facade.notFound()).toBe(true);
    expect(facade.loadingProduct()).toBe(false);
  });
  it('sends the exact request and stores the successful response', () => {
    facade.loadProduct(product.slug);
    facade.submit(request);
    expect(quoteApi.requests).toEqual([request]);
    expect(quoteApi.requests[0].canal).toBe(QuoteChannel.FORMULARIO);
    expect(quoteApi.requests[0].detalles[0].productoId).toBe(product.id);
    expect(quoteApi.requests[0].detalles[0].cantidad).toBe(21);
    expect(facade.quoteResult()).toEqual(response);
  });
  it('sets submitting only until the request completes and prevents duplicate sends', () => {
    const pending = new Subject<QuoteResponse>();
    quoteApi.response$ = pending;
    facade.loadProduct(product.slug);
    facade.submit(request);
    facade.submit(request);
    expect(facade.submitting()).toBe(true);
    expect(quoteApi.requests).toHaveLength(1);
    pending.next(response);
    pending.complete();
    expect(facade.submitting()).toBe(false);
  });
  it('keeps the form available and exposes a user-safe submit error', () => {
    quoteApi.response$ = throwError(() => new HttpErrorResponse({ status: 400 }));
    facade.loadProduct(product.slug);
    facade.submit(request);
    expect(facade.quoteResult()).toBeNull();
    expect(facade.error()).toContain('Revisa');
    expect(facade.submitting()).toBe(false);
  });
});
