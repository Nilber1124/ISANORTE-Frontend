import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrderResponse } from '../../../data/models/order/order-response.model';
import { OrderStatus } from '../../../data/models/order/order-status.enum';
import { AdminOrders } from './admin-orders';
import { AdminOrdersFacade, OrderStatusFilter } from './admin-orders.facade';

const order: OrderResponse = {
  id: 'order-1',
  codigo: 'PED-20260917-AB12CD34',
  clienteId: 'cliente-1',
  direccionAlias: 'Casa',
  direccionCalle: 'Av. Siempre Viva 123',
  direccionDistrito: 'Miraflores',
  direccionCiudad: 'Lima',
  direccionReferencia: null,
  direccionTelefonoContacto: '999111222',
  ruc: null,
  razonSocial: null,
  estado: OrderStatus.PENDIENTE_PAGO,
  totalPedido: null,
  stockDescontado: true,
  detalles: [
    {
      id: 'detail-1',
      productoId: 'product-1',
      varianteId: null,
      nombreProducto: 'Cemento Saco 42.5kg',
      sku: 'CEM-001',
      cantidad: 4,
      precioUnitario: null,
      subtotal: null,
      notas: null,
    },
  ],
  seguimientos: [],
  fechaCreacion: '2026-09-17T10:00:00-05:00',
  fechaActualizacion: null,
};

class FacadeStub {
  readonly orders = signal<readonly OrderResponse[]>([order]);
  readonly filteredOrders = signal<readonly OrderResponse[]>([order]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly selectedStatus = signal<OrderStatusFilter>('ALL');
  readonly searchTerm = signal('');
  readonly selectedOrder = signal<OrderResponse | null>(null);
  readonly detailOpen = signal(false);
  readonly loadingDetail = signal(false);
  readonly detailError = signal<string | null>(null);
  readonly statusError = signal<string | null>(null);
  readonly changingStatusId = signal<string | null>(null);
  opened: OrderResponse[] = [];
  changedStatuses: OrderStatus[] = [];

  load(): void {}
  clearFeedback(): void {}
  setStatusFilter(status: OrderStatusFilter): void {
    this.selectedStatus.set(status);
  }
  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }
  openDetail(value: OrderResponse): void {
    this.opened.push(value);
    this.selectedOrder.set(value);
    this.detailOpen.set(true);
  }
  closeDetail(): void {
    this.detailOpen.set(false);
  }
  changeStatus(status: OrderStatus): void {
    if (this.changingStatusId() !== null) return;
    this.changedStatuses.push(status);
  }
}

describe('AdminOrders', () => {
  let fixture: ComponentFixture<AdminOrders>;
  let facade: FacadeStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AdminOrders] })
      .overrideComponent(AdminOrders, {
        set: { providers: [{ provide: AdminOrdersFacade, useClass: FacadeStub }] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(AdminOrders);
    facade = fixture.debugElement.injector.get(AdminOrdersFacade) as unknown as FacadeStub;
    fixture.detectChanges();
  });

  it('renders the semantic table and status badge', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('table caption')?.textContent).toContain('Listado administrativo');
    expect(element.textContent).toContain(order.codigo);
    expect(element.textContent).toContain('Pendiente de pago');
  });

  it('shows EmptyState when there are no orders', () => {
    facade.orders.set([]);
    facade.filteredOrders.set([]);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('No hay pedidos');
    expect(element.querySelector('table')).toBeNull();
  });

  it('opens the detail with address and product data', () => {
    const viewButton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Ver'));
    viewButton?.click();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(facade.opened).toEqual([order]);
    expect(text).toContain('Av. Siempre Viva 123');
    expect(text).toContain('999111222');
    expect(text).toContain('Cemento Saco 42.5kg');
    expect(text).toContain('CEM-001');
    expect(text).toContain('Stock descontado');
  });

  it('shows Por confirmar for null total and null product prices', () => {
    facade.selectedOrder.set(order);
    facade.detailOpen.set(true);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text.match(/Por confirmar/g)?.length).toBeGreaterThanOrEqual(3);
    expect(text).not.toContain('Total: 0');
  });

  it('renders the accessible status selector and emits an update', () => {
    facade.selectedOrder.set(order);
    facade.detailOpen.set(true);
    fixture.detectChanges();
    const select = (fixture.nativeElement as HTMLElement).querySelector(
      '#order-next-status',
    ) as HTMLSelectElement;
    select.value = OrderStatus.PAGADO_MANUAL;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    const updateButton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Actualizar estado'));
    updateButton?.click();
    expect(facade.changedStatuses).toEqual([OrderStatus.PAGADO_MANUAL]);
  });

  it('disables status updating while a change is pending', () => {
    facade.selectedOrder.set(order);
    facade.detailOpen.set(true);
    facade.changingStatusId.set(order.id);
    fixture.detectChanges();
    const select = (fixture.nativeElement as HTMLElement).querySelector(
      '#order-next-status',
    ) as HTMLSelectElement;
    const updateButton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Actualizar estado')) as HTMLButtonElement;
    expect(select.disabled).toBe(true);
    expect(updateButton.disabled).toBe(true);
  });

  it('hides the status selector and explains the guard for a cancelled order', () => {
    facade.selectedOrder.set({ ...order, estado: OrderStatus.CANCELADO });
    facade.detailOpen.set(true);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('#order-next-status')).toBeNull();
    expect(element.textContent).toContain('Un pedido cancelado no puede cambiar de estado');
  });
});
