import { HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';

import { ISADECOR_UNIT_SLUG, PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import { IsadecorQuoteCartService } from '../../../core/services/isadecor-quote-cart.service';
import { AddressResponse } from '../../../data/models/address/address.model';
import { OrderStatus } from '../../../data/models/order/order-status.enum';
import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { PublicOrderRequest, PublicOrderResponse } from '../../../data/models/public-content/public-order.model';
import { PublicProductDetailResponse } from '../../../data/models/public-content/public-product-detail.model';
import { ClienteApiService } from '../../../data/services/cliente-api.service';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { CheckoutSubmission, CheckoutFacade } from './checkout.facade';

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

const addresses: AddressResponse[] = [
  {
    id: 'addr-1',
    alias: 'Casa',
    calle: 'Av. Siempre Viva 123',
    distrito: 'Miraflores',
    ciudad: 'Lima',
    referencia: null,
    telefonoContacto: '987654321',
    principal: true,
  },
];

const submission: CheckoutSubmission = {
  direccionId: 'addr-1',
  direccionNueva: null,
  ruc: null,
  razonSocial: null,
};

const response: PublicOrderResponse = {
  codigo: 'PED-0001',
  direccionCalle: 'Av. Siempre Viva 123',
  direccionDistrito: 'Miraflores',
  direccionCiudad: 'Lima',
  estado: OrderStatus.PENDIENTE_PAGO,
  totalPedido: null,
  detalles: [],
  fechaCreacion: '2026-09-23T02:00:00',
};

class PublicContentApiStub {
  productResponse$: Observable<PublicProductDetailResponse> = of(product);
  orderResponse$: Observable<PublicOrderResponse> = of(response);
  requestedProductParams: Array<{ siteKey: string; unitSlug: string; productSlug: string }> = [];
  requestedOrderParams: Array<{ siteKey: string; unitSlug: string; request: PublicOrderRequest }> = [];

  getProductDetail(siteKey: string, unitSlug: string, productSlug: string): Observable<PublicProductDetailResponse> {
    this.requestedProductParams.push({ siteKey, unitSlug, productSlug });
    return this.productResponse$;
  }

  createOrder(siteKey: string, unitSlug: string, orderReq: PublicOrderRequest): Observable<PublicOrderResponse> {
    this.requestedOrderParams.push({ siteKey, unitSlug, request: orderReq });
    return this.orderResponse$;
  }
}

class ClienteApiStub {
  addressesResponse$: Observable<AddressResponse[]> = of(addresses);
  direcciones(): Observable<AddressResponse[]> {
    return this.addressesResponse$;
  }
}

describe('CheckoutFacade', () => {
  let facade: CheckoutFacade;
  let publicApi: PublicContentApiStub;
  let clienteApi: ClienteApiStub;
  let cart: IsadecorQuoteCartService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        CheckoutFacade,
        PublicContentApiStub,
        { provide: PublicContentApiService, useExisting: PublicContentApiStub },
        ClienteApiStub,
        { provide: ClienteApiService, useExisting: ClienteApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    facade = TestBed.inject(CheckoutFacade);
    publicApi = TestBed.inject(PublicContentApiStub);
    clienteApi = TestBed.inject(ClienteApiStub);
    cart = TestBed.inject(IsadecorQuoteCartService);
  });

  afterEach(() => localStorage.clear());

  it('merges a product into the shared cart by slug and quantity', () => {
    facade.mergeProductIntoCart(' wall-panel-roble ', 3);
    expect(publicApi.requestedProductParams).toEqual([
      { siteKey: PUBLIC_SITE_KEY, unitSlug: ISADECOR_UNIT_SLUG, productSlug: 'wall-panel-roble' },
    ]);
    expect(cart.items()).toHaveLength(1);
    expect(cart.items()[0].quantity).toBe(3);
  });

  it('loads the saved addresses from the account', () => {
    facade.loadAddresses();
    expect(facade.addresses()).toEqual(addresses);
    expect(facade.loadingAddresses()).toBe(false);
  });

  it('falls back to an empty address list on failure', () => {
    clienteApi.addressesResponse$ = throwError(() => new HttpErrorResponse({ status: 500 }));
    facade.loadAddresses();
    expect(facade.addresses()).toEqual([]);
  });

  it('does nothing when submitting an empty cart', () => {
    facade.submit(submission);
    expect(publicApi.requestedOrderParams).toHaveLength(0);
  });

  it('sends one detail per cart item using a saved address, stores the response and clears the cart', () => {
    cart.addProduct(product, null, 5);
    facade.submit(submission);

    expect(publicApi.requestedOrderParams).toHaveLength(1);
    expect(publicApi.requestedOrderParams[0].request.direccionId).toBe('addr-1');
    expect(publicApi.requestedOrderParams[0].request.detalles).toEqual([
      { productoSlug: product.slug, varianteSku: null, cantidad: 5 },
    ]);
    expect(facade.orderResult()).toEqual(response);
    expect(cart.items()).toHaveLength(0);
  });

  it('sends the inline address fields when a new address is used', () => {
    cart.addProduct(product, null, 1);
    facade.submit({
      direccionId: null,
      direccionNueva: {
        alias: 'Obra',
        calle: 'Calle Nueva 1',
        distrito: 'Surco',
        ciudad: 'Lima',
        referencia: null,
        telefonoContacto: '999999999',
      },
      ruc: '20123456789',
      razonSocial: 'Constructora XYZ',
    });

    expect(publicApi.requestedOrderParams[0].request).toEqual({
      direccionId: null,
      direccionAlias: 'Obra',
      direccionCalle: 'Calle Nueva 1',
      direccionDistrito: 'Surco',
      direccionCiudad: 'Lima',
      direccionReferencia: null,
      direccionTelefonoContacto: '999999999',
      ruc: '20123456789',
      razonSocial: 'Constructora XYZ',
      detalles: [{ productoSlug: product.slug, varianteSku: null, cantidad: 1 }],
    });
  });

  it('sets submitting only until the request completes and prevents duplicate sends', () => {
    const pending = new Subject<PublicOrderResponse>();
    publicApi.orderResponse$ = pending;
    cart.addProduct(product, null, 1);
    facade.submit(submission);
    facade.submit(submission);
    expect(facade.submitting()).toBe(true);
    expect(publicApi.requestedOrderParams).toHaveLength(1);
    pending.next(response);
    pending.complete();
    expect(facade.submitting()).toBe(false);
  });

  it('keeps the cart intact and exposes a user-safe submit error on a stock conflict', () => {
    publicApi.orderResponse$ = throwError(() => new HttpErrorResponse({ status: 409 }));
    cart.addProduct(product, null, 1);
    facade.submit(submission);
    expect(facade.orderResult()).toBeNull();
    expect(facade.error()).toContain('agotó');
    expect(facade.submitting()).toBe(false);
    expect(cart.items()).toHaveLength(1);
  });
});
