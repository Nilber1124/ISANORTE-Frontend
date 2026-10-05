import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ProductPriceComparisonResponse,
  PriceComparisonStatus,
} from '../../../../../data/models/product/product-price-comparison-response.model';
import { ProductPriceComparison } from './product-price-comparison';

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

describe('ProductPriceComparison', () => {
  let fixture: ComponentFixture<ProductPriceComparison>;
  let element: HTMLElement;
  let submitted: string[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProductPriceComparison] }).compileComponents();
    fixture = TestBed.createComponent(ProductPriceComparison);
    element = fixture.nativeElement as HTMLElement;
    submitted = [];
    fixture.componentInstance.compare.subscribe((value) => submitted.push(value));
    fixture.detectChanges();
  });

  function submit(value: string): void {
    const input = element.querySelector('input')!;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    element.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    fixture.detectChanges();
  }

  it('does not request scraping when rendering', () => {
    expect(submitted).toEqual([]);
    expect(element.textContent).toContain('Verifica que el enlace');
  });

  for (const value of ['', '   ', 'incorrecta', 'ftp://tienda.example/p', 'javascript:alert(1)']) {
    it('rejects empty or invalid URL: ' + value, () => {
      submit(value);
      expect(submitted).toEqual([]);
      expect(element.textContent).toContain('Ingresa una URL válida del producto.');
    });
  }

  it('requires a direct product link', () => {
    submit('https://tienda.example/');
    expect(submitted).toEqual([]);
    expect(element.textContent).toContain('no únicamente la página principal');
  });

  it('emits only the trimmed URL on explicit submission', () => {
    submit(' https://tienda.example/mesa ');
    expect(submitted).toEqual(['https://tienda.example/mesa']);
  });

  it('announces loading and disables input and button, preventing double submit', () => {
    fixture.componentRef.setInput('loading', true);
    fixture.detectChanges();
    submit('https://tienda.example/mesa');
    expect(element.querySelector('button')!.disabled).toBe(true);
    expect(element.querySelector('input')!.disabled).toBe(true);
    expect(element.textContent).toContain('Consultando precio...');
    expect(submitted).toEqual([]);
  });

  for (const [difference, message] of [
    [70, 'ISADECOR tiene un precio S/ 70.00 menor.'],
    [-50, 'El precio externo es S/ 50.00 menor.'],
    [0, 'Ambos precios son iguales.'],
  ] as const) {
    it('presents the server comparison: ' + message, () => {
      fixture.componentRef.setInput('result', {
        ...comparison,
        diferencia: difference,
        mensaje: message,
      });
      fixture.detectChanges();
      expect(element.textContent).toContain(message);
      expect(element.textContent).toContain('tienda.example');
      expect(element.textContent).toContain('Mesa externa');
      expect(element.textContent).toContain('Diferencia: S/');
    });
  }

  for (const [status, title] of [
    ['PRICE_NOT_FOUND', 'Precio no encontrado'],
    ['UNSUPPORTED_CONTENT', 'Sitio no compatible'],
    ['SITE_UNREACHABLE', 'Sitio no accesible'],
    ['INVALID_URL', 'URL inválida'],
    ['BLOCKED_URL', 'URL no permitida'],
    ['CURRENCY_UNKNOWN', 'moneda desconocida'],
    ['CURRENCY_MISMATCH', 'monedas diferentes'],
    ['NOT_COMPARABLE', 'Comparación no válida'],
  ] as const satisfies ReadonlyArray<readonly [PriceComparisonStatus, string]>) {
    it('distinguishes ' + status + ' without claiming savings', () => {
      fixture.componentRef.setInput('result', {
        ...comparison,
        comparable: false,
        estado: status,
        diferencia: null,
        porcentajeDiferencia: null,
        mensaje: 'No se puede comparar.',
      });
      fixture.detectChanges();
      expect(element.textContent).toContain(title);
      expect(element.textContent).not.toContain('Diferencia:');
      expect(element.textContent).not.toContain('Variación del precio');
    });
  }

  it('shows a backend transport error', () => {
    fixture.componentRef.setInput('error', 'No pudimos completar la comparación.');
    fixture.detectChanges();
    expect(element.querySelector('[role=alert]')?.textContent).toContain('No pudimos completar');
  });

  it('clears obsolete results when the URL changes through the parent event', () => {
    let edits = 0;
    fixture.componentInstance.edited.subscribe(() => edits++);
    submit('https://tienda.example/mesa');
    expect(edits).toBe(1);
  });
});
