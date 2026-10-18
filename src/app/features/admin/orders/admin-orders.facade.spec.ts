import { HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';

import { OrderResponse } from '../../../data/models/order/order-response.model';
import { OrderStatusRequest } from '../../../data/models/order/order-status-request.model';
import { OrderStatus } from '../../../data/models/order/order-status.enum';
import { OrderApiService } from '../../../data/services/order-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { AdminOrdersFacade } from './admin-orders.facade';

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
      precioUnitario: 30,
      subtotal: 120,
      notas: null,
    },
  ],
  seguimientos: [],
  fechaCreacion: '2026-09-17T10:00:00-05:00',
  fechaActualizacion: null,
};

class OrderApiStub {
  getAllResponse$: Observable<OrderResponse[]> = of([order]);
  getByIdResponse$: Observable<OrderResponse> = of(order);
  statusResponse$: Observable<OrderResponse> = of({
    ...order,
    estado: OrderStatus.PAGADO_MANUAL,
    seguimientos: [
      {
        id: 'tracking-1',
        administradorId: null,
        administradorNombre: null,
        estadoAnterior: OrderStatus.PENDIENTE_PAGO,
        estadoNuevo: OrderStatus.PAGADO_MANUAL,
        comentario: 'Cambio de estado administrativo',
        fecha: '2026-09-18T09:00:00-05:00',
      },
    ],
  });
  getAllCalls = 0;
  detailIds: string[] = [];
  statusRequests: Array<{ id: string; request: OrderStatusRequest }> = [];

  getAll(): Observable<OrderResponse[]> {
    this.getAllCalls += 1;
    return this.getAllResponse$;
  }

  getById(id: string): Observable<OrderResponse> {
    this.detailIds.push(id);
    return this.getByIdResponse$;
  }

  changeStatus(id: string, request: OrderStatusRequest): Observable<OrderResponse> {
    this.statusRequests.push({ id, request });
    return this.statusResponse$;
  }
}

describe('AdminOrdersFacade', () => {
  let facade: AdminOrdersFacade;
  let orderApi: OrderApiStub;
  let toastService: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminOrdersFacade,
        OrderApiStub,
        { provide: OrderApiService, useExisting: OrderApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    facade = TestBed.inject(AdminOrdersFacade);
    orderApi = TestBed.inject(OrderApiStub);
    toastService = TestBed.inject(ToastService);
  });

  it('loads all orders', () => {
    facade.load();
    expect(orderApi.getAllCalls).toBe(1);
    expect(facade.orders()).toEqual([order]);
    expect(facade.loading()).toBe(false);
  });

  it('represents an empty order list', () => {
    orderApi.getAllResponse$ = of([]);
    facade.load();
    expect(facade.orders()).toEqual([]);
    expect(facade.filteredOrders()).toEqual([]);
  });

  it('exposes a safe loading error', () => {
    orderApi.getAllResponse$ = throwError(() => new HttpErrorResponse({ status: 500 }));
    facade.load();
    expect(facade.error()).toContain('No pudimos cargar los pedidos');
    expect(facade.loading()).toBe(false);
  });

  it('loads the selected order detail by id', () => {
    facade.openDetail(order);
    expect(orderApi.detailIds).toEqual([order.id]);
    expect(facade.selectedOrder()).toEqual(order);
    expect(facade.detailOpen()).toBe(true);
    expect(facade.loadingDetail()).toBe(false);
  });

  it('changes status with the exact PATCH request and updates the response', () => {
    facade.load();
    facade.openDetail(order);
    facade.changeStatus(OrderStatus.PAGADO_MANUAL);

    expect(orderApi.statusRequests).toEqual([
      { id: order.id, request: { estado: OrderStatus.PAGADO_MANUAL } },
    ]);
    expect(facade.selectedOrder()?.estado).toBe(OrderStatus.PAGADO_MANUAL);
    expect(facade.orders()[0].estado).toBe(OrderStatus.PAGADO_MANUAL);
    expect(facade.selectedOrder()?.seguimientos).toHaveLength(1);
    expect(toastService.toasts().at(-1)?.message).toBe('Estado actualizado correctamente.');
  });

  it('maps 400, 404 and 409 status errors', () => {
    facade.openDetail(order);
    for (const status of [400, 404, 409]) {
      orderApi.statusResponse$ = throwError(() => new HttpErrorResponse({ status }));
      facade.changeStatus(OrderStatus.PAGADO_MANUAL);
      expect(facade.statusError()).toBeTruthy();
    }
  });

  it('returns changingStatusId to idle after a failed update', () => {
    facade.openDetail(order);
    orderApi.statusResponse$ = throwError(() => new HttpErrorResponse({ status: 500 }));
    facade.changeStatus(OrderStatus.PAGADO_MANUAL);
    expect(facade.changingStatusId()).toBeNull();
    expect(facade.statusError()).toContain('No pudimos actualizar');
  });

  it('blocks duplicate status updates while PATCH is pending', () => {
    const pending = new Subject<OrderResponse>();
    orderApi.statusResponse$ = pending;
    facade.openDetail(order);
    facade.changeStatus(OrderStatus.PAGADO_MANUAL);
    facade.changeStatus(OrderStatus.EN_PREPARACION);
    expect(orderApi.statusRequests).toHaveLength(1);
    expect(facade.changingStatusId()).toBe(order.id);
    pending.next({ ...order, estado: OrderStatus.PAGADO_MANUAL });
    pending.complete();
    expect(facade.changingStatusId()).toBeNull();
  });

  it('preserves a null backend total without calculating a fallback', () => {
    orderApi.getAllResponse$ = of([{ ...order, totalPedido: null }]);
    facade.load();
    expect(facade.orders()[0].totalPedido).toBeNull();
  });

  it('filters locally by status and address or billing data', () => {
    facade.load();
    facade.setStatusFilter(OrderStatus.PENDIENTE_PAGO);
    facade.setSearchTerm('miraflores');
    expect(facade.filteredOrders()).toEqual([order]);
    facade.setStatusFilter(OrderStatus.CANCELADO);
    expect(facade.filteredOrders()).toEqual([]);
  });
});
