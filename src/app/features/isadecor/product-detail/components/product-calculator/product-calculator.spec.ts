import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculationConfigResponse } from '../../../../../data/models/product/product-response.model';
import { ProductCalculator } from './product-calculator';

const enabledConfig: CalculationConfigResponse = {
  id: 'calculation-config-1',
  habilitada: true,
  etiquetaEntrada: 'Largo del muro',
  unidadEntrada: 'm',
  coberturaPorUnidad: 0.22,
  unidadVenta: 'panel',
  textoAyuda: 'Ingresa el largo total del muro.',
};

describe('ProductCalculator', () => {
  let fixture: ComponentFixture<ProductCalculator>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [ProductCalculator] }).compileComponents();
    fixture = TestBed.createComponent(ProductCalculator);
  });

  function render(config: CalculationConfigResponse = enabledConfig): HTMLElement {
    fixture.componentRef.setInput('config', config);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function enterMeasurement(value: string): HTMLElement {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function resultText(element: HTMLElement): string | null {
    return element.querySelector('output')?.textContent?.trim() ?? null;
  }

  it('enables the calculator when the configuration is enabled and valid', () => {
    const element = render();

    expect(element.querySelector('input[type="number"]')).toBeTruthy();
    expect(element.textContent).toContain('Calcula cuánto necesitas');
  });

  it('calculates 21 units for 4.5 with a coverage of 0.22', () => {
    render();
    const element = enterMeasurement('4.5');

    expect(resultText(element)).toContain('21');
  });

  it('emits the calculated quantity for its parent feature', () => {
    const quantities: Array<number | null> = [];
    fixture.componentInstance.quantityChange.subscribe((quantity) => quantities.push(quantity));
    render();
    enterMeasurement('4.5');
    enterMeasurement('');

    expect(quantities).toEqual([21, null]);
  });

  it('calculates five units for a measurement of one', () => {
    render();
    const element = enterMeasurement('1');

    expect(resultText(element)).toContain('5');
  });

  it('calculates one unit for the exact coverage value', () => {
    render();
    const element = enterMeasurement('0.22');

    expect(resultText(element)).toContain('1');
  });

  it('always rounds quantities upward', () => {
    render();
    expect(resultText(enterMeasurement('0.21'))).toContain('1');
    expect(resultText(enterMeasurement('4.4'))).toContain('20');
    expect(resultText(enterMeasurement('4.41'))).toContain('21');
  });

  it('does not produce a valid result for zero', () => {
    render();
    const element = enterMeasurement('0');

    expect(element.textContent).toContain('Ingresa un valor mayor que 0.');
    expect(element.textContent).toContain('Ingresa una medida válida para ver el resultado.');
    expect(resultText(element)).toBeNull();
  });

  it('does not produce a valid result for a negative measurement', () => {
    render();
    const element = enterMeasurement('-5');

    expect(element.textContent).toContain('Ingresa un valor mayor que 0.');
    expect(resultText(element)).toBeNull();
  });

  it('keeps the result empty when the input is empty', () => {
    render();
    const element = enterMeasurement('');

    expect(element.textContent).toContain('Ingresa una medida válida para ver el resultado.');
    expect(element.querySelector('[aria-invalid="true"]')).toBeNull();
    expect(resultText(element)).toBeNull();
  });

  it('does not produce a valid result for a non-finite value', () => {
    const element = render();
    fixture.componentInstance.measurement.set(Number.NaN);
    fixture.detectChanges();

    expect(element.textContent).toContain('Ingresa un valor numérico válido.');
    expect(resultText(element)).toBeNull();
  });

  it('shows an unavailable state when coverage is zero', () => {
    const element = render({ ...enabledConfig, coberturaPorUnidad: 0 });

    expect(element.querySelector('input')).toBeNull();
    expect(element.textContent).toContain('El cálculo no está disponible');
  });

  it('does not expose infinity when the division overflows', () => {
    const element = render({ ...enabledConfig, coberturaPorUnidad: Number.MIN_VALUE });
    fixture.componentInstance.measurement.set(Number.MAX_VALUE);
    fixture.detectChanges();

    expect(resultText(element)).toBeNull();
  });

  it('renders optional help only when the contract provides it', () => {
    expect(render().textContent).toContain(enabledConfig.textoAyuda);

    const element = render({ ...enabledConfig, textoAyuda: null });
    expect(element.querySelector('#product-calculator-help')).toBeNull();
  });

  it('uses the input label and units provided by the configuration', () => {
    render({
      ...enabledConfig,
      etiquetaEntrada: 'Área a cubrir',
      unidadEntrada: 'm²',
      coberturaPorUnidad: 1.44,
      unidadVenta: 'caja',
    });
    const element = enterMeasurement('1.44');

    expect(element.textContent).toContain('Área a cubrir');
    expect(element.textContent).toContain('m²');
    expect(element.textContent).toContain('caja');
  });
});
