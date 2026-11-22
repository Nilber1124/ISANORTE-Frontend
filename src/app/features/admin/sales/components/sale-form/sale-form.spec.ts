import { TestBed } from '@angular/core/testing';

import { ProductResponse } from '../../../../../data/models/product/product-response.model';
import { SaleRequest } from '../../../../../data/models/sale/sale.model';
import { SaleForm } from './sale-form';

const panel = { id: 'p1', nombre: 'Panel PVC', sku: 'PV-1', precioBase: 12.5, stockActual: 10, variantes: [] } as unknown as ProductResponse;
const piso = {
  id: 'p2', nombre: 'Piso SPC', sku: 'SPC', precioBase: 40, stockActual: null,
  variantes: [{ id: 'v1', nombre: 'Roble', sku: 'SPC-R', precio: 45, stockActual: 3 }, { id: 'v2', nombre: 'Nogal', sku: 'SPC-N', precio: null, stockActual: 8 }],
} as unknown as ProductResponse;
const sinControl = { id: 'p3', nombre: 'Pegamento', sku: 'PG', precioBase: 9, stockActual: null, variantes: [] } as unknown as ProductResponse;

describe('SaleForm', () => {
  function create() {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(SaleForm);
    fixture.componentRef.setInput('products', [panel, piso, sinControl]);
    fixture.detectChanges();
    const saved: SaleRequest[] = [];
    fixture.componentInstance.saved.subscribe((request) => saved.push(request));
    const c = fixture.componentInstance as unknown as Record<string, any>;
    return { fixture, c, saved, el: fixture.nativeElement as HTMLElement };
  }
  const submit = (fixture: ReturnType<typeof create>['fixture'], c: Record<string, any>) => {
    c['submit']();
    fixture.detectChanges();
  };

  it('starts with one empty line, WhatsApp as channel and the sale as paid', () => {
    const { c, el } = create();
    expect(c['lines']()).toHaveLength(1);
    expect(c['canal']()).toBe('WHATSAPP');
    expect(c['pagado']()).toBe(true);
    expect(el.querySelector('[data-sale-total]')?.textContent).toContain('S/ 0.00');
  });

  it('fills name, SKU and price from the chosen product and warns when asking for more than the stock', () => {
    const { fixture, c, el } = create();
    const key = c['lines']()[0].key;
    c['chooseProduct'](key, 'p1');
    c['setLine'](key, 'cantidad', '3');
    fixture.detectChanges();
    expect(c['lines']()[0]).toMatchObject({ nombre: 'Panel PVC', sku: 'PV-1', precio: '12.5' });
    expect(el.querySelector('[data-stock-note]')?.textContent).toContain('Stock actual: 10');
    expect(el.querySelector('[data-sale-total]')?.textContent).toContain('S/ 37.50');

    c['setLine'](key, 'cantidad', '15');
    fixture.detectChanges();
    expect(el.querySelector('[data-stock-note]')?.textContent).toContain('Solo hay 10 en stock');
  });

  it('asks for the finish when the stock is controlled by finish and uses its price and stock', () => {
    const { fixture, c, el, saved } = create();
    const key = c['lines']()[0].key;
    c['chooseProduct'](key, 'p2');
    fixture.detectChanges();
    submit(fixture, c);
    expect(el.textContent).toContain('elige el acabado');
    expect(saved).toEqual([]);

    c['chooseVariant'](key, 'v1');
    fixture.detectChanges();
    expect(c['lines']()[0]).toMatchObject({ nombre: 'Piso SPC - Roble', sku: 'SPC-R', precio: '45' });
    expect(el.querySelector('[data-stock-note]')?.textContent).toContain('Stock actual: 3');
    // Un acabado sin precio propio usa el del producto.
    c['chooseVariant'](key, 'v2');
    expect(c['lines']()[0].precio).toBe('40');
  });

  it('says a free item or a product without stock control does not move stock', () => {
    const { fixture, c, el } = create();
    const key = c['lines']()[0].key;
    expect(el.querySelector('[data-stock-note]')?.textContent).toContain('no mueve stock');
    c['chooseProduct'](key, 'p3');
    fixture.detectChanges();
    expect(el.querySelector('[data-stock-note]')?.textContent).toContain('no controla stock');
  });

  it('validates lines and the document before emitting', () => {
    const { fixture, c, el, saved } = create();
    submit(fixture, c);
    expect(el.textContent).toContain('escribe qué se vendió');
    const key = c['lines']()[0].key;
    c['setLine'](key, 'nombre', 'Instalación');
    c['setLine'](key, 'precio', '80');
    c['tipoDocumento'].set('DNI');
    c['documento'].set('123');
    submit(fixture, c);
    expect(el.textContent).toContain('El DNI debe tener 8 dígitos');
    expect(saved).toEqual([]);
  });

  it('emits the sale with the product links, the cleaned customer and null for what is empty', () => {
    const { fixture, c, saved } = create();
    const first = c['lines']()[0].key;
    c['chooseProduct'](first, 'p1');
    c['setLine'](first, 'cantidad', '2');
    c['addLine']();
    const second = c['lines']()[1].key;
    c['setLine'](second, 'nombre', 'Instalación');
    c['setLine'](second, 'precio', '80');
    c['clienteNombre'].set('  Ana Pérez ');
    c['tipoDocumento'].set('RUC');
    c['documento'].set('20123456789');
    c['razonSocial'].set('Ana SAC');
    c['metodoPago'].set('TRANSFERENCIA');
    c['pagado'].set(false);
    submit(fixture, c);

    expect(saved).toHaveLength(1);
    expect(saved[0]).toMatchObject({
      canal: 'WHATSAPP', clienteNombre: 'Ana Pérez', clienteTelefono: null, tipoDocumento: 'RUC', documento: '20123456789',
      razonSocial: 'Ana SAC', metodoPago: 'TRANSFERENCIA', pagado: false, notas: null,
    });
    expect(saved[0].detalles).toEqual([
      { productoId: 'p1', varianteId: null, nombre: 'Panel PVC', sku: 'PV-1', cantidad: 2, precioUnitario: 12.5 },
      { productoId: null, varianteId: null, nombre: 'Instalación', sku: null, cantidad: 1, precioUnitario: 80 },
    ]);
  });

  it('prefills when editing a sale', () => {
    TestBed.configureTestingModule({});
    const fixture = TestBed.createComponent(SaleForm);
    fixture.componentRef.setInput('products', [panel]);
    fixture.componentRef.setInput('sale', {
      codigo: 'VTA-1', canal: 'TIENDA', fechaVenta: '2026-11-01', clienteNombre: 'Luis', clienteTelefono: '999', tipoDocumento: 'DNI',
      documento: '12345678', razonSocial: null, metodoPago: 'EFECTIVO', pagado: true, notas: 'Nota',
      detalles: [{ id: 'd', productoId: 'p1', varianteId: null, nombre: 'Panel PVC', sku: 'PV-1', cantidad: 4, precioUnitario: 12.5, subtotal: 50 }],
    });
    fixture.detectChanges();
    const c = fixture.componentInstance as unknown as Record<string, any>;
    expect(c['canal']()).toBe('TIENDA');
    expect(c['clienteNombre']()).toBe('Luis');
    expect(c['lines']()[0]).toMatchObject({ productoId: 'p1', cantidad: '4', precio: '12.5' });
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Editar venta VTA-1');
  });
});
