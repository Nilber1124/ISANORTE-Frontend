import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';

import { OrderResponse } from '../../../../../data/models/order/order-response.model';
import { OrderStatus } from '../../../../../data/models/order/order-status.enum';
import { Alert } from '../../../../../shared/components/alert/alert';
import { Badge, BadgeVariant } from '../../../../../shared/components/badge/badge';
import { Button } from '../../../../../shared/components/button/button';
import { Card } from '../../../../../shared/components/card/card';
import { EmptyState } from '../../../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../../../shared/components/loading/loading';
import { Drawer } from '../../../../../shared/components/drawer/drawer';
import {
  SelectField,
  SelectOption,
} from '../../../../../shared/components/select-field/select-field';

@Component({
  selector: 'app-order-detail',
  imports: [
    Alert,
    Badge,
    Button,
    Card,
    DatePipe,
    DecimalPipe,
    EmptyState,
    Drawer,
    Loading,
    SelectField,
  ],
  templateUrl: './order-detail.html',
  styleUrl: './order-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderDetail {
  readonly order = input<OrderResponse | null>(null);
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly statusError = input<string | null>(null);
  readonly changingStatus = input(false);

  readonly closed = output<void>();
  readonly statusChanged = output<OrderStatus>();

  readonly nextStatus = signal<OrderStatus>(OrderStatus.PENDIENTE_PAGO);
  readonly statusOptions: readonly SelectOption[] = [
    { value: OrderStatus.PENDIENTE_PAGO, label: 'Pendiente de pago' },
    { value: OrderStatus.PAGADO_MANUAL, label: 'Pago confirmado' },
    { value: OrderStatus.EN_PREPARACION, label: 'En preparación' },
    { value: OrderStatus.ENVIADO, label: 'Enviado' },
    { value: OrderStatus.ENTREGADO, label: 'Entregado' },
    { value: OrderStatus.CANCELADO, label: 'Cancelado' },
  ];

  private readonly syncStatus = effect(() => {
    const order = this.order();
    if (order !== null) this.nextStatus.set(order.estado);
  });

  protected updateNextStatus(status: string): void {
    this.nextStatus.set(status as OrderStatus);
  }

  protected submitStatus(): void {
    const order = this.order();
    if (order === null || this.changingStatus() || order.estado === this.nextStatus()) return;
    this.statusChanged.emit(this.nextStatus());
  }

  protected statusLabel(status: OrderStatus | null): string {
    if (status === null) return 'Sin estado';
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
