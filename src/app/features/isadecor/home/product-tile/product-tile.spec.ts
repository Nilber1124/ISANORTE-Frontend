import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { toProductCard } from '../isadecor-home.mapper';
import { HomeProductTile } from './product-tile';

describe('HomeProductTile', () => {
  it('renders one detail link, a limited set of finishes and the action for the stock state', () => {
    TestBed.configureTestingModule({ imports: [HomeProductTile], providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(HomeProductTile);
    const product = toProductCard({
      slug: 'panel',
      nombre: 'Panel de nogal',
      categorias: [],
      imagen: null,
      precioBase: 20,
      precioAnterior: 25,
      descuentoPorcentaje: 20,
      unidadVenta: 'M2',
      modalidad: 'COMPRAR',
      plazoEntrega: 'Entrega inmediata',
      valoracion: 4.3,
      resenasCantidad: 2,
      estadoStock: 'QUEDAN',
      quedan: 2,
      acabados: Array.from({ length: 6 }, (_, index) => ({
        nombre: `Acabado ${index}`,
        colorHex: null,
        agotado: index === 0,
      })),
    });
    fixture.componentRef.setInput('product', product);
    fixture.detectChanges();

    const tile = fixture.nativeElement as HTMLElement;
    expect(tile.querySelectorAll('a')).toHaveLength(1);
    expect(tile.querySelector('a')?.getAttribute('href')).toBe('/isadecor/productos/panel');
    expect(tile.querySelectorAll('li')).toHaveLength(5);
    expect(tile.querySelector('li')?.textContent).toContain('agotado');
    expect(tile.textContent).toContain('Quedan 2');
    expect(tile.textContent).toContain('Comprar');

    fixture.componentRef.setInput('product', { ...product, estadoStock: 'AGOTADO' });
    fixture.detectChanges();
    expect(tile.textContent).toContain('Agotado');
    expect(tile.textContent).not.toContain('Comprar');
  });
});
