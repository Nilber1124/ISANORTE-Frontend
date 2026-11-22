import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { SaleResponse } from '../../../data/models/sale/sale.model';
import { AdminSales } from './admin-sales';
import { AdminSalesFacade } from './admin-sales.facade';

registerLocaleData(localeEs);

const sale = (patch: Partial<SaleResponse>): SaleResponse =>
  ({
    id: 'v', codigo: 'VTA-1', canal: 'WHATSAPP', fechaVenta: '2026-11-22', clienteNombre: 'Ana', clienteTelefono: null, razonSocial: null,
    metodoPago: 'YAPE', pagado: true, total: 100, anulada: false, stockDescontado: true,
    detalles: [{ id: 'd', nombre: 'Panel', cantidad: 2, precioUnitario: 50, subtotal: 100 }], ...patch,
  }) as SaleResponse;

class FacadeStub {
  readonly sales = signal<readonly SaleResponse[]>([]);
  readonly products = signal<readonly unknown[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly formError = signal<string | null>(null);
  readonly editing = signal<SaleResponse | 'new' | null>(null);
  readonly summary = signal({ todayTotal: 150, todayCount: 2, monthTotal: 350, monthCount: 3, toCollect: 50 });
  opened = 0;
  cancelled: Array<[string, boolean]> = [];
  load(): void {}
  openNew(): void { this.opened++; this.editing.set('new'); }
  openEdit(s: SaleResponse): void { this.editing.set(s); }
  closeForm(): void { this.editing.set(null); }
  save(): void {}
  setAnulada(s: SaleResponse, anulada: boolean): void { this.cancelled.push([s.id, anulada]); }
}

describe('AdminSales', () => {
  let facade: FacadeStub;

  function render(sales: SaleResponse[] = []) {
    TestBed.configureTestingModule({}).overrideComponent(AdminSales, {
      set: { providers: [{ provide: AdminSalesFacade, useValue: (facade = new FacadeStub()) }] },
    });
    const fixture = TestBed.createComponent(AdminSales);
    facade.sales.set(sales);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement, c: fixture.componentInstance as unknown as Record<string, any> };
  }
  const rows = (el: HTMLElement) => Array.from(el.querySelectorAll('[data-sale-row]'));
  const button = (el: HTMLElement, text: string) => Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.includes(text)) as HTMLButtonElement;

  it('shows the empty state with a button to register the first sale', () => {
    const { el } = render([]);
    expect(el.textContent).toContain('Aún no hay ventas registradas');
    button(el, 'Registrar venta').click();
    expect(facade.opened).toBe(1);
  });

  it('shows the summary and one row per sale with its customer, channel and status', () => {
    const { el } = render([
      sale({ id: '1' }),
      sale({ id: '2', clienteNombre: null, razonSocial: 'Ana SAC', canal: 'TIENDA', metodoPago: 'EFECTIVO', pagado: false }),
      sale({ id: '3', anulada: true }),
    ]);
    const summary = el.querySelector('[data-sales-summary]')?.textContent ?? '';
    expect(summary).toContain('150.00');
    expect(summary).toContain('350.00');
    expect(summary).toContain('50.00');
    expect(rows(el)).toHaveLength(3);
    expect(rows(el)[0].textContent).toContain('Cobrada');
    expect(rows(el)[1].textContent).toContain('Por cobrar');
    expect(rows(el)[1].textContent).toContain('Ana SAC');
    expect(rows(el)[1].textContent).toContain('Tienda · Efectivo');
    expect(rows(el)[2].textContent).toContain('Anulada');
    expect(rows(el)[2].textContent).toContain('Reactivar');
  });

  it('filters by status and channel', () => {
    const { fixture, el, c } = render([
      sale({ id: '1' }),
      sale({ id: '2', pagado: false, canal: 'TIENDA' }),
      sale({ id: '3', anulada: true }),
    ]);
    c['statusFilter'].set('por-cobrar');
    fixture.detectChanges();
    expect(rows(el)).toHaveLength(1);
    c['statusFilter'].set('anuladas');
    fixture.detectChanges();
    expect(rows(el)).toHaveLength(1);
    c['statusFilter'].set('');
    c['channelFilter'].set('TIENDA');
    fixture.detectChanges();
    expect(rows(el)).toHaveLength(1);
    c['channelFilter'].set('OTRO');
    fixture.detectChanges();
    expect(el.querySelector('[data-sales-no-match]')).toBeTruthy();
  });

  it('asks for confirmation before cancelling and says the stock will be returned', () => {
    const { fixture, el } = render([sale({ id: 'v1' })]);
    button(el, 'Anular').click();
    fixture.detectChanges();
    expect(el.textContent).toContain('Se devolverá al stock');
    expect(facade.cancelled).toEqual([]);
    (Array.from(el.querySelectorAll('app-modal button')).find((b) => b.textContent?.includes('Anular venta')) as HTMLElement).click();
    fixture.detectChanges();
    expect(facade.cancelled).toEqual([['v1', true]]);
  });

  it('reactivates a cancelled sale straight away', () => {
    const { el } = render([sale({ id: 'v2', anulada: true })]);
    button(el, 'Reactivar').click();
    expect(facade.cancelled).toEqual([['v2', false]]);
  });

  it('opens the form for a new sale and for editing one', () => {
    const { fixture, el } = render([sale({ id: 'v3' })]);
    button(el, 'Editar').click();
    fixture.detectChanges();
    expect(el.querySelector('app-sale-form')).toBeTruthy();
    expect(el.textContent).toContain('Editar venta VTA-1');
  });
});
