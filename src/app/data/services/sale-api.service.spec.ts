import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../core/config/api.config';
import { SaleRequest } from '../models/sale/sale.model';
import { SaleApiService } from './sale-api.service';

const request: SaleRequest = {
  canal: 'WHATSAPP', fechaVenta: '2026-11-22', clienteNombre: 'Ana', clienteTelefono: null, tipoDocumento: null, documento: null,
  razonSocial: null, metodoPago: 'YAPE', pagado: true, notas: null,
  detalles: [{ productoId: 'p1', varianteId: null, nombre: 'Panel', sku: 'PV-1', cantidad: 2, precioUnitario: 10 }],
};

describe('SaleApiService', () => {
  let api: SaleApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: 'https://api.example/' }],
    });
    api = TestBed.inject(SaleApiService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('uses the exact paths and methods', () => {
    api.getAll().subscribe();
    expect(http.expectOne('https://api.example/api/ventas').request.method).toBe('GET');

    api.create(request).subscribe();
    const create = http.expectOne('https://api.example/api/ventas');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(request);

    api.update('v 1', request).subscribe();
    const update = http.expectOne('https://api.example/api/ventas/v%201');
    expect(update.request.method).toBe('PUT');

    api.setAnulada('v1', true).subscribe();
    const cancel = http.expectOne('https://api.example/api/ventas/v1/anulada');
    expect(cancel.request.method).toBe('PATCH');
    expect(cancel.request.body).toEqual({ anulada: true });
  });
});
