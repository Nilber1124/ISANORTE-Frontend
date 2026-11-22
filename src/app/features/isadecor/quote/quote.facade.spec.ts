import { DOCUMENT } from '@angular/common';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of } from 'rxjs';

import { ISADECOR_UNIT_SLUG, PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import { IsadecorQuoteCartService } from '../../../core/services/isadecor-quote-cart.service';
import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { PublicProductDetailResponse } from '../../../data/models/public-content/public-product-detail.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { PublicSiteFacade } from '../../../layouts/public-layout/public-site.facade';
import { QuoteCustomerDetails, QuoteFacade, buildQuoteWhatsappMessage } from './quote.facade';

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

class PublicContentApiStub {
  productResponse$: Observable<PublicProductDetailResponse> = of(product);
  requestedProductParams: Array<{ siteKey: string; unitSlug: string; productSlug: string }> = [];

  getProductDetail(
    siteKey: string,
    unitSlug: string,
    productSlug: string,
  ): Observable<PublicProductDetailResponse> {
    this.requestedProductParams.push({ siteKey, unitSlug, productSlug });
    return this.productResponse$;
  }
}

describe('QuoteFacade', () => {
  let facade: QuoteFacade;
  let publicApi: PublicContentApiStub;
  let cart: IsadecorQuoteCartService;
  let opened: string[];
  let whatsappAvailable: boolean;

  beforeEach(() => {
    localStorage.clear();
    opened = [];
    whatsappAvailable = true;
    TestBed.configureTestingModule({
      providers: [
        QuoteFacade,
        PublicContentApiStub,
        { provide: PublicContentApiService, useExisting: PublicContentApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: PublicSiteFacade,
          useValue: {
            whatsappHrefFor: (text: string) =>
              whatsappAvailable ? `https://wa.me/51999?text=${encodeURIComponent(text)}` : null,
          },
        },
        {
          provide: DOCUMENT,
          useValue: { defaultView: { open: (url: string) => opened.push(url) } },
        },
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
    expect(opened).toHaveLength(0);
    expect(facade.sent()).toBe(false);
  });

  it('opens WhatsApp with the products and customer data, then clears the cart', () => {
    cart.addProduct(product, null, 5);
    facade.submit(customer);

    expect(opened).toHaveLength(1);
    const text = decodeURIComponent(opened[0].split('text=')[1]);
    expect(text).toContain('Wall Panel Roble × 5');
    expect(text).toContain('*Nombre:* Ana');
    expect(text).toContain('*Teléfono:* 999 999 999');
    expect(facade.sent()).toBe(true);
    expect(cart.items()).toHaveLength(0);
  });

  it('keeps the cart and shows an error when there is no WhatsApp number', () => {
    whatsappAvailable = false;
    cart.addProduct(product, null, 1);
    facade.submit(customer);
    expect(opened).toHaveLength(0);
    expect(facade.sent()).toBe(false);
    expect(facade.error()).toContain('WhatsApp');
    expect(cart.items()).toHaveLength(1);
  });

  it('builds the message skipping empty optional fields and naming the finish', () => {
    const text = buildQuoteWhatsappMessage(
      { ...customer, empresaCliente: 'ACME', mensaje: '  ' },
      [{ productName: 'Piso', variant: { name: 'Roble' }, quantity: 2 }],
    );
    expect(text).toContain('• Piso (Roble) × 2');
    expect(text).toContain('*Empresa:* ACME');
    expect(text).not.toContain('Mensaje');
    expect(text).not.toContain('Ciudad');
  });
});
