import { HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';

import { ISADECOR_UNIT_SLUG, PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import { IsadecorQuoteCartService } from '../../../core/services/isadecor-quote-cart.service';
import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { PublicProductDetailResponse } from '../../../data/models/public-content/public-product-detail.model';
import { PublicQuoteRequest, PublicQuoteResponse } from '../../../data/models/public-content/public-quote.model';
import { QuoteChannel } from '../../../data/models/quote/quote-channel.enum';
import { QuoteStatus } from '../../../data/models/quote/quote-status.enum';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { QuoteCustomerDetails, QuoteFacade } from './quote.facade';

const product: PublicProductDetailResponse = {
  sku: 'WP-ROBLE-001',
  nombre: 'Wall Panel Roble',
  slug: 'wall-panel-roble',
  resumen: null,
  descripcion: 'Panel',
  tituloSeo: null,
  descripcionSeo: null,
  precioBase: 49.9,
  precioAnterior: null,
  descuentoPorcentaje: null,
  disponibilidad: ProductAvailability.DISPONIBLE,
  retiroEnTienda: null,
  categorias: [],
  variantes: [],
  imagenes: [],
  especificaciones: [],
  documentos: [],
  configuracionCalculo: null,
};

const customer: QuoteCustomerDetails = {
  nombreCliente: 'Ana',
  emailCliente: 'ana@example.com',
  telefonoCliente: '999 999 999',
  empresaCliente: null,
  ciudad: null,
  mensaje: null,
};

const response: PublicQuoteResponse = {
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
  fechaCreacion: '2026-09-23T02:00:00',
};

class PublicContentApiStub {
  productResponse$: Observable<PublicProductDetailResponse> = of(product);
  quoteResponse$: Observable<PublicQuoteResponse> = of(response);
  requestedProductParams: Array<{ siteKey: string; unitSlug: string; productSlug: string }> = [];
  requestedQuoteParams: Array<{ siteKey: string; unitSlug: string; request: PublicQuoteRequest }> = [];

  getProductDetail(siteKey: string, unitSlug: string, productSlug: string): Observable<PublicProductDetailResponse> {
    this.requestedProductParams.push({ siteKey, unitSlug, productSlug });
    return this.productResponse$;
  }

  createQuote(siteKey: string, unitSlug: string, quoteReq: PublicQuoteRequest): Observable<PublicQuoteResponse> {
    this.requestedQuoteParams.push({ siteKey, unitSlug, request: quoteReq });
    return this.quoteResponse$;
  }
}

describe('QuoteFacade', () => {
  let facade: QuoteFacade;
  let publicApi: PublicContentApiStub;
  let cart: IsadecorQuoteCartService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        QuoteFacade,
        PublicContentApiStub,
        { provide: PublicContentApiService, useExisting: PublicContentApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    facade = TestBed.inject(QuoteFacade);
    publicApi = TestBed.inject(PublicContentApiStub);
    cart = TestBed.inject(IsadecorQuoteCartService);
  });

  afterEach(() => localStorage.clear());

  it('merges a product into the shared cart by slug and quantity', () => {
    facade.mergeProductIntoCart(' wall-panel-roble ', 3);
    expect(publicApi.requestedProductParams).toEqual([
      { siteKey: PUBLIC_SITE_KEY, unitSlug: ISADECOR_UNIT_SLUG, productSlug: 'wall-panel-roble' },
    ]);
    expect(cart.items()).toHaveLength(1);
    expect(cart.items()[0].productSlug).toBe(product.slug);
    expect(cart.items()[0].quantity).toBe(3);
    expect(facade.mergingProduct()).toBe(false);
  });

  it('does nothing when submitting an empty cart', () => {
    facade.submit(customer);
    expect(publicApi.requestedQuoteParams).toHaveLength(0);
  });

  it('sends one detail per cart item, stores the response and clears the cart', () => {
    cart.addProduct(product, null, 5);
    facade.submit(customer);

    expect(publicApi.requestedQuoteParams).toHaveLength(1);
    expect(publicApi.requestedQuoteParams[0].siteKey).toBe(PUBLIC_SITE_KEY);
    expect(publicApi.requestedQuoteParams[0].unitSlug).toBe(ISADECOR_UNIT_SLUG);
    expect(publicApi.requestedQuoteParams[0].request.canal).toBe(QuoteChannel.FORMULARIO);
    expect(publicApi.requestedQuoteParams[0].request.detalles).toEqual([
      { productoSlug: product.slug, varianteSku: null, cantidad: 5, notas: null },
    ]);
    expect(facade.quoteResult()).toEqual(response);
    expect(cart.items()).toHaveLength(0);
  });

  it('sets submitting only until the request completes and prevents duplicate sends', () => {
    const pending = new Subject<PublicQuoteResponse>();
    publicApi.quoteResponse$ = pending;
    cart.addProduct(product, null, 1);
    facade.submit(customer);
    facade.submit(customer);
    expect(facade.submitting()).toBe(true);
    expect(publicApi.requestedQuoteParams).toHaveLength(1);
    pending.next(response);
    pending.complete();
    expect(facade.submitting()).toBe(false);
  });

  it('keeps the cart intact and exposes a user-safe submit error on failure', () => {
    publicApi.quoteResponse$ = throwError(() => new HttpErrorResponse({ status: 400 }));
    cart.addProduct(product, null, 1);
    facade.submit(customer);
    expect(facade.quoteResult()).toBeNull();
    expect(facade.error()).toContain('Revisa');
    expect(facade.submitting()).toBe(false);
    expect(cart.items()).toHaveLength(1);
  });
});
