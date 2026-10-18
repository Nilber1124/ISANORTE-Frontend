import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';

import { OrderResponse } from '../../../data/models/order/order-response.model';
import { OrderStatus } from '../../../data/models/order/order-status.enum';
import { Alert } from '../../../shared/components/alert/alert';
import { Badge, BadgeVariant } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { InputField } from '../../../shared/components/input-field/input-field';
import { Loading } from '../../../shared/components/loading/loading';
import { SelectField, SelectOption } from '../../../shared/components/select-field/select-field';
import { AdminOrdersFacade, OrderStatusFilter } from './admin-orders.facade';
import { OrderDetail } from './components/order-detail/order-detail';

@Component({
  selector: 'app-admin-orders',
  imports: [
    Alert,
    Badge,
    Button,
    DatePipe,
    DecimalPipe,
    EmptyState,
    InputField,
    Loading,
    OrderDetail,
    SelectField,
  ],
  providers: [AdminOrdersFacade],
  templateUrl: './admin-orders.html',
  styleUrl: './admin-orders.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminOrders {
  readonly facade = inject(AdminOrdersFacade);

  readonly statusOptions: readonly SelectOption[] = [
    { value: 'ALL', label: 'Todos' },
    { value: OrderStatus.PENDIENTE_PAGO, label: 'Pendiente de pago' },
    { value: OrderStatus.PAGADO_MANUAL, label: 'Pago confirmado' },
    { value: OrderStatus.EN_PREPARACION, label: 'En preparación' },
    { value: OrderStatus.ENVIADO, label: 'Enviado' },
    { value: OrderStatus.ENTREGADO, label: 'Entregado' },
    { value: OrderStatus.CANCELADO, label: 'Cancelado' },
  ];

  constructor() {
    afterNextRender(() => this.facade.load());
  }

  protected updateStatusFilter(status: string): void {
    this.facade.setStatusFilter(status as OrderStatusFilter);
  }

  protected productCount(order: OrderResponse): string {
    const count = order.detalles?.length ?? 0;
    return `${count} ${count === 1 ? 'producto' : 'productos'}`;
  }

  protected statusLabel(status: OrderStatus): string {
    return {
      [OrderStatus.PENDIENTE_PAGO]: 'Pendiente de pago',
      [OrderStatus.PAGADO_MANUAL]: 'Pago confirmado',
      [OrderStatus.EN_PREPARACION]: 'En preparación',
      [OrderStatus.ENVIADO]: 'Enviado',
      [OrderStatus.ENTREGADO]: 'Entregado',
      [OrderStatus.CANCELADO]: 'Cancelado',
    }[status];
  }

  protected statusVariant(status: OrderStatus): BadgeVariant {
    return {
      [OrderStatus.PENDIENTE_PAGO]: 'warning' as const,
      [OrderStatus.PAGADO_MANUAL]: 'info' as const,
      [OrderStatus.EN_PREPARACION]: 'accent' as const,
      [OrderStatus.ENVIADO]: 'accent' as const,
      [OrderStatus.ENTREGADO]: 'success' as const,
      [OrderStatus.CANCELADO]: 'error' as const,
    }[status];
  }
}
