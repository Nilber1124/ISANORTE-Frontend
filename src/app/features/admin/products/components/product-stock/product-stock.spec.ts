import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { ProductResponse } from '../../../../../data/models/product/product-response.model';
import { ProductStock } from './product-stock';

describe('ProductStock', () => {
  let http: HttpTestingController;

  function create(product: Partial<ProductResponse>) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '' },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ProductStock);
    fixture.componentRef.setInput('product', { id: 'p1', nombre: 'Panel', ...product });
    fixture.detectChanges();
    http.expectOne('/api/productos/p1/movimientos-stock').flush([]);
    return fixture;
  }

  afterEach(() => http.verify());

  it('lists one line per finish with its stock and the total', () => {
    const fixture = create({
      variantes: [
        { id: 'v1', nombre: 'Roble', stockActual: 3 },
        { id: 'v2', nombre: 'Nogal', stockActual: 4 },
      ] as ProductResponse['variantes'],
    });

    expect(fixture.componentInstance.lines().map((line) => line.stock)).toEqual([3, 4]);
    expect(fixture.componentInstance.total()).toBe(7);
  });

  it('adjusts the stock of a finish and refreshes the history', () => {
    const fixture = create({
      variantes: [{ id: 'v1', nombre: 'Roble', stockActual: 3 }] as ProductResponse['variantes'],
    });
    const component = fixture.componentInstance;

    component.open(component.lines()[0]);
    expect(component.valid()).toBe(false);
    component.type.set('ENTRADA');
    component.quantity.set('5');
    component.reason.set(' Reposición ');
    component.save();

    const request = http.expectOne('/api/productos/p1/variantes/v1/stock');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ tipo: 'ENTRADA', cantidad: 5, motivo: 'Reposición' });
    request.flush({ productoId: 'p1', varianteId: 'v1', stockActual: 8, estado: 'DISPONIBLE' });
    http.expectOne('/api/productos/p1/movimientos-stock').flush([]);

    expect(component.lines()[0].stock).toBe(8);
    expect(component.target()).toBeUndefined();
  });

  it('adjusts the product itself when it has no finishes', () => {
    const fixture = create({ stockActual: null });
    const component = fixture.componentInstance;

    component.open(component.lines()[0]);
    expect(component.type()).toBe('AJUSTE');
    component.quantity.set('10');
    component.save();

    http.expectOne('/api/productos/p1/stock').flush({ productoId: 'p1', stockActual: 10 });
    http.expectOne('/api/productos/p1/movimientos-stock').flush([]);
    expect(component.lines()[0].stock).toBe(10);
  });
});
