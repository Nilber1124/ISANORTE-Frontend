import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { PublicContentApiService } from './public-content-api.service';
import { ProductPriceComparisonResponse } from '../models/product/product-price-comparison-response.model';
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

describe('Public product price comparison API', () => {
  it('posts to the public unit endpoint with only the external URL', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    let result: ProductPriceComparisonResponse | undefined;
    TestBed.inject(PublicContentApiService)
      .compareProductPrice('isanorte', 'isadecor', 'mesa / moderna', {
        urlExterna: comparison.urlExterna!,
      })
      .subscribe((value) => (result = value));
    const http = TestBed.inject(HttpTestingController);
    const request = http.expectOne(
      '/api/publico/sitios/isanorte/unidades/isadecor/productos/mesa%20%2F%20moderna/comparar-precio',
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ urlExterna: comparison.urlExterna });
    request.flush(comparison);
    expect(result).toEqual(comparison);
    http.verify();
  });
});
