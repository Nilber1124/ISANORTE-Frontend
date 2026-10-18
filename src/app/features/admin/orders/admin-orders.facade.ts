import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { OrderResponse } from '../../../data/models/order/order-response.model';
import { OrderStatus } from '../../../data/models/order/order-status.enum';
import { OrderApiService } from '../../../data/services/order-api.service';
import { ToastService } from '../../../core/services/toast.service';

export type OrderStatusFilter = OrderStatus | 'ALL';

@Injectable()
export class AdminOrdersFacade {
  private readonly orderApi = inject(OrderApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly toastService = inject(ToastService);

  private readonly _orders = signal<readonly OrderResponse[]>([]);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);
  private readonly _selectedStatus = signal<OrderStatusFilter>('ALL');
  private readonly _searchTerm = signal('');
  private readonly _selectedOrder = signal<OrderResponse | null>(null);
  private readonly _detailOpen = signal(false);
  private readonly _loadingDetail = signal(false);
  private readonly _detailError = signal<string | null>(null);
  private readonly _statusError = signal<string | null>(null);
  private readonly _changingStatusId = signal<string | null>(null);

  readonly orders = this._orders.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly selectedStatus = this._selectedStatus.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly selectedOrder = this._selectedOrder.asReadonly();
  readonly detailOpen = this._detailOpen.asReadonly();
  readonly loadingDetail = this._loadingDetail.asReadonly();
  readonly detailError = this._detailError.asReadonly();
  readonly statusError = this._statusError.asReadonly();
  readonly changingStatusId = this._changingStatusId.asReadonly();

  readonly filteredOrders = computed(() => {
    const status = this._selectedStatus();
    const term = this._searchTerm().trim().toLocaleLowerCase('es');

    return this._orders().filter((order) => {
      const matchesStatus = status === 'ALL' || order.estado === status;
      if (!matchesStatus || term.length === 0) return matchesStatus;

      return [
        order.codigo,
        order.direccionCalle,
        order.direccionDistrito,
        order.direccionCiudad,
        order.direccionTelefonoContacto,
        order.ruc ?? '',
        order.razonSocial ?? '',
      ].some((value) => value.toLocaleLowerCase('es').includes(term));
    });
  });

  load(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this._loading.set(true);
    this._error.set(null);
    this.orderApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (orders) => this._orders.set(this.sortOrders(orders)),
        error: () =>
          this._error.set(
            'No pudimos cargar los pedidos. Comprueba tu conexión e inténtalo nuevamente.',
          ),
      });
  }

  setStatusFilter(status: OrderStatusFilter): void {
    this._selectedStatus.set(status);
  }

  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
  }

  openDetail(order: OrderResponse): void {
    if (this._loadingDetail()) return;

    this._selectedOrder.set(null);
    this._detailOpen.set(true);
    this._loadingDetail.set(true);
    this._detailError.set(null);
    this._statusError.set(null);

    this.orderApi
      .getById(order.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loadingDetail.set(false)),
      )
      .subscribe({
        next: (detail) => this._selectedOrder.set(detail),
        error: (error: unknown) => this._detailError.set(this.detailErrorMessage(error)),
      });
  }

  closeDetail(): void {
    if (this._changingStatusId() !== null) return;
    this._detailOpen.set(false);
    this._selectedOrder.set(null);
    this._detailError.set(null);
    this._statusError.set(null);
  }

  changeStatus(status: OrderStatus): void {
    const order = this._selectedOrder();
    if (order === null || order.estado === status || this._changingStatusId() !== null) return;

    this._changingStatusId.set(order.id);
    this._statusError.set(null);
    this._error.set(null);

    this.orderApi
      .changeStatus(order.id, { estado: status })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._changingStatusId.set(null)),
      )
      .subscribe({
        next: (updatedOrder) => {
          this.upsertOrder(updatedOrder);
          this._selectedOrder.set(updatedOrder);
          this.toastService.show('Estado actualizado correctamente.', 'success');
        },
        error: (error: unknown) => this._statusError.set(this.statusErrorMessage(error)),
      });
  }

  clearFeedback(): void {
    this._error.set(null);
  }

  private upsertOrder(order: OrderResponse): void {
    const nextOrders = this._orders().map((item) => (item.id === order.id ? order : item));
    this._orders.set(this.sortOrders(nextOrders));
  }

  private sortOrders(orders: readonly OrderResponse[]): OrderResponse[] {
    return [...orders].sort((first, second) => {
      const firstDate = first.fechaCreacion ?? '';
      const secondDate = second.fechaCreacion ?? '';
      return secondDate.localeCompare(firstDate);
    });
  }

  private detailErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      return 'El pedido ya no existe o no está disponible.';
    }
    return 'No pudimos cargar el detalle. Comprueba tu conexión e inténtalo nuevamente.';
  }

  private statusErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400)
        return 'El estado seleccionado o los datos enviados no son válidos.';
      if (error.status === 404) return 'El pedido ya no existe o no está disponible.';
      if (error.status === 409)
        return 'No pudimos cambiar el estado: el pedido ya está cancelado o hay un conflicto de stock.';
    }
    return 'No pudimos actualizar el estado. Comprueba tu conexión e inténtalo nuevamente.';
  }
}
