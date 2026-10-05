import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductCompetitorComparisonResponse } from '../../../../../data/models/product/product-competitor-comparison-response.model';
import { ProductCompetitorComparison } from './product-competitor-comparison';

const result: ProductCompetitorComparisonResponse = {
  productoIsadecor: {
    nombre: 'Piso SPC Roble Grey 6mm', precio: 85, precioAnterior: null,
    moneda: 'PEN', unidadPrecio: 'm2', caracteristicas: [{ nombre: 'Espesor', valor: '6 mm' }],
  },
  competidores: [
    {
      empresa: 'PISOPAK', estado: 'FOUND', encontrado: true,
      nombreProducto: 'Piso SPC Roble Grey', urlProducto: 'https://www.pisopak.com/producto/roble',
      precio: 89.9, precioAnterior: null, moneda: 'PEN', unidadPrecio: 'm2',
      cantidadPorPresentacion: null, similitud: 0.86,
      caracteristicas: [{ nombre: 'Grosor', valor: '6 mm' }], comparablePrecio: true,
      diferenciaPrecio: 4.9, mensaje: 'Precios expresados en la misma moneda y unidad.',
    },
    {
      empresa: 'DECORPLAS', estado: 'STORE_UNAVAILABLE', encontrado: false,
      nombreProducto: null, urlProducto: null, precio: null, precioAnterior: null, moneda: null,
      unidadPrecio: null, cantidadPorPresentacion: null, similitud: null, caracteristicas: [],
      comparablePrecio: false, diferenciaPrecio: null, mensaje: 'No fue posible consultar esta tienda.',
    },
  ],
  diferenciasEncontradas: [], fechaConsulta: '2026-09-22T12:00:00Z',
};

describe('ProductCompetitorComparison', () => {
  let fixture: ComponentFixture<ProductCompetitorComparison>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProductCompetitorComparison] }).compileComponents();
    fixture = TestBed.createComponent(ProductCompetitorComparison);
    element = fixture.nativeElement as HTMLElement;
  });

  it('starts only after explicit user action', () => {
    let requests = 0;
    fixture.componentInstance.compare.subscribe(() => requests++);
    fixture.detectChanges();
    expect(requests).toBe(0);
    element.querySelector('button')!.click();
    expect(requests).toBe(1);
  });

  it('shows independent partial results and objective data', () => {
    fixture.componentRef.setInput('result', result);
    fixture.detectChanges();
    expect(element.textContent).toContain('ISADECOR');
    expect(element.textContent).toContain('PISOPAK');
    expect(element.textContent).toContain('DECORPLAS');
    expect(element.textContent).toContain('S/ 89.90 / m2');
    expect(element.textContent).toContain('No fue posible consultar esta tienda.');
    expect(element.querySelector('a')?.getAttribute('href')).toContain('pisopak.com');
  });

  it('announces loading without a second action button', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    expect(element.textContent).toContain('Buscando productos similares...');
    expect(element.querySelector('button')).toBeNull();
  });
});
