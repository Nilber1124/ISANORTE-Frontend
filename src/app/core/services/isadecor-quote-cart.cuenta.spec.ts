import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../config/api.config';
import { ClienteAuthService } from '../auth/cliente-auth.service';
import { PublicProductDetailResponse } from '../../data/models/public-content/public-product-detail.model';
import { IsadecorQuoteCartService } from './isadecor-quote-cart.service';

const ORIGEN = 'http://api.test';
const GUEST_KEY = 'isadecor_quote_cart_v1';

function jwtVigente(): string {
  const encode = (value: object) => btoa(JSON.stringify(value));
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: 'c1', exp })}.firma`;
}

const perfil = {
  id: 'c1',
  nombre: 'Ana',
  apellido: null,
  email: 'ana@example.com',
  telefono: null,
  fechaCreacion: '2026-10-06T10:00:00',
};

function producto(slug: string, nombre: string): PublicProductDetailResponse {
  return {
    nombre,
    sku: `${slug.toUpperCase()}-01`,
    slug,
    precioBase: 10,
    imagenes: [],
    variantes: [],
  } as unknown as PublicProductDetailResponse;
}

describe('IsadecorQuoteCartService con cuenta de cliente', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('isanorte.cliente.token', jwtVigente());
    localStorage.setItem('isanorte.cliente.perfil', JSON.stringify(perfil));
    TestBed.configureTestingModule({
      providers: [
        { provide: API_BASE_URL, useValue: ORIGEN },
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('fusiona el carrito local con el de la cuenta, guarda el resultado y limpia la copia local', async () => {
    localStorage.setItem(
      GUEST_KEY,
      JSON.stringify([
        { productSlug: 'mesa', productName: 'Mesa', productSku: 'MESA-01', imageUrl: null, imageAlt: 'Mesa', variant: null, quantity: 1, unitPrice: 10 },
      ]),
    );
    const service = TestBed.inject(IsadecorQuoteCartService);
    TestBed.flushEffects();

    http.expectOne(`${ORIGEN}/api/publico/cuenta/carrito`).flush({
      items: [
        { productoSlug: 'silla', productoNombre: 'Silla', productoSku: 'SILLA-01', imagenUrl: null, imagenAlt: null, variante: null, cantidad: 2, precioUnitario: 20 },
      ],
    });

    expect(service.items().map((item) => item.productSlug).sort()).toEqual(['mesa', 'silla']);
    expect(localStorage.getItem(GUEST_KEY)).toBeNull();

    service.addProduct(producto('mesa', 'Mesa'), null, 2);
    expect(service.totalQuantity()).toBe(5);

    await new Promise((resolve) => setTimeout(resolve, 450));
    const guardado = http.expectOne(`${ORIGEN}/api/publico/cuenta/carrito`);
    expect(guardado.request.method).toBe('PUT');
    expect(guardado.request.body.items.find((item: { productoSlug: string }) => item.productoSlug === 'mesa').cantidad).toBe(3);
    guardado.flush({ items: [] });
  });

  it('al cerrar sesión deja de mostrar el carrito de la cuenta', () => {
    const service = TestBed.inject(IsadecorQuoteCartService);
    TestBed.flushEffects();
    http.expectOne(`${ORIGEN}/api/publico/cuenta/carrito`).flush({
      items: [
        { productoSlug: 'silla', productoNombre: 'Silla', productoSku: 'SILLA-01', imagenUrl: null, imagenAlt: null, variante: null, cantidad: 2, precioUnitario: 20 },
      ],
    });
    expect(service.itemCount()).toBe(1);

    TestBed.inject(ClienteAuthService).logout();
    TestBed.flushEffects();

    expect(service.itemCount()).toBe(0);
  });
});
