import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { ProductAvailability } from '../../data/models/product/product-availability.enum';
import {
  PublicProductDetailResponse,
  PublicProductVariantResponse,
} from '../../data/models/public-content/public-product-detail.model';
import { IsadecorQuoteCartService } from './isadecor-quote-cart.service';

const product: PublicProductDetailResponse = {
  nombre: 'Wall Panel Roble',
  sku: 'WP-001',
  slug: 'wall-panel-roble',
  resumen: null,
  descripcion: 'Panel decorativo.',
  tituloSeo: null,
  descripcionSeo: null,
  precioBase: 45.5,
  precioAnterior: null,
  descuentoPorcentaje: null,
  disponibilidad: ProductAvailability.DISPONIBLE,
  retiroEnTienda: true,
  categorias: [],
  imagenes: [
    { url: 'https://cdn.example/panel.jpg', alt: 'Panel roble', esPrincipal: true, orden: 0 },
  ],
  variantes: [],
  especificaciones: [],
  documentos: [],
  configuracionCalculo: null,
};

const oak: PublicProductVariantResponse = {
  sku: 'WP-ROBLE',
  nombre: 'Roble claro',
  descripcion: null,
  precio: 49.9,
  disponible: true,
  imagenUrl: null,
  orden: 0,
};

const walnut: PublicProductVariantResponse = {
  ...oak,
  sku: 'WP-NOGAL',
  nombre: 'Nogal',
  precio: null,
};

describe('IsadecorQuoteCartService', () => {
  const createService = (): IsadecorQuoteCartService => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [IsadecorQuoteCartService, { provide: PLATFORM_ID, useValue: 'browser' }],
    });
    return TestBed.inject(IsadecorQuoteCartService);
  };

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('adds products, accumulates the same variant and keeps different variants separate', () => {
    const service = createService();

    service.addProduct(product, oak, 2);
    service.addProduct(product, oak, 3);
    service.addProduct(product, walnut, 1);
    service.addProduct(product, null, 4);

    expect(service.itemCount()).toBe(3);
    expect(service.totalQuantity()).toBe(10);
    expect(service.items().find((item) => item.variant?.sku === oak.sku)?.quantity).toBe(5);
    expect(service.items().find((item) => item.variant?.sku === walnut.sku)?.quantity).toBe(1);
    expect(service.items().find((item) => item.variant === null)?.quantity).toBe(4);
  });

  it('uses the calculated quantity, validates edits, removes products and clears the cart', () => {
    const service = createService();
    const added = service.addProduct(product, oak, 7);

    expect(added.quantity).toBe(7);
    expect(service.updateQuantity(added.key, 9)).toBe(true);
    expect(service.items()[0].quantity).toBe(9);
    expect(service.updateQuantity(added.key, 0)).toBe(false);
    expect(service.updateQuantity(added.key, Number.NaN)).toBe(false);
    expect(service.items()[0].quantity).toBe(9);

    service.removeItem(added.key);
    expect(service.items()).toEqual([]);
    service.addProduct(product, null, 1);
    service.clear();
    expect(service.items()).toEqual([]);
  });

  it('persists and restores valid cart items from localStorage', () => {
    const service = createService();
    service.addProduct(product, oak, 2);

    const restored = createService();

    expect(restored.items()).toEqual(service.items());
    expect(restored.items()[0].imageUrl).toBe('https://cdn.example/panel.jpg');
  });

  it('falls back to quantity one and ignores malformed persisted data', () => {
    let service = createService();
    expect(service.addProduct(product, null, -4).quantity).toBe(1);

    localStorage.setItem('isadecor_quote_cart_v1', JSON.stringify([{ productSlug: 'incompleto' }]));
    service = createService();
    expect(service.items()).toEqual([]);
  });

  it('builds a WhatsApp message with product, variant, SKUs, quantities and totals', () => {
    const service = createService();
    service.addProduct(product, oak, 2);
    service.addProduct(product, walnut, 1);
    service.addProduct(
      { ...product, slug: 'panel-sin-precio', sku: 'PANEL-SP', precioBase: null },
      null,
      1,
    );

    const message = service.buildWhatsAppMessage();
    const url = service.buildWhatsAppUrl('+51 999 888 777');

    expect(message).toContain('Wall Panel Roble');
    expect(message).toContain('SKU: WP-001');
    expect(message).toContain('Variante: Roble claro (SKU: WP-ROBLE)');
    expect(message).toContain('Cantidad: 2');
    expect(message).toContain('Subtotal referencial: S/ 99.80');
    expect(message).toContain('Total estimado parcial: S/ 145.30');
    expect(message).toContain('Precio referencial unitario: S/ 45.50');
    expect(message).toContain('Precio referencial: por confirmar');
    expect(url).toContain('https://wa.me/51999888777?text=');
    expect(decodeURIComponent(url!)).toContain('Variante: Nogal (SKU: WP-NOGAL)');
  });

  it('does not generate a WhatsApp URL without a valid configured phone or items', () => {
    const service = createService();
    expect(service.buildWhatsAppUrl('+51 999 888 777')).toBeNull();
    service.addProduct(product, null, 1);
    expect(service.buildWhatsAppUrl(null)).toBeNull();
    expect(service.buildWhatsAppUrl('123')).toBeNull();
  });

  it('does not access browser storage during SSR', () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [IsadecorQuoteCartService, { provide: PLATFORM_ID, useValue: 'server' }],
    });
    const service = TestBed.inject(IsadecorQuoteCartService);

    expect(service.items()).toEqual([]);
    expect(() => service.addProduct(product, null, 1)).not.toThrow();
  });
});
