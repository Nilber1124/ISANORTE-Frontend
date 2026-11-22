import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Alert } from '../../../shared/components/alert/alert';
import { Badge, BadgeVariant } from '../../../shared/components/badge/badge';
import { AdminDashboardFacade } from './admin-dashboard.facade';
import { OrderStatus } from '../../../data/models/order/order-status.enum';
import { QuoteStatus } from '../../../data/models/quote/quote-status.enum';
import { AdminPageHeader } from '../shared/admin-page-header/admin-page-header';

@Component({
  selector: 'app-admin-dashboard',
  imports: [AdminPageHeader, Alert, Badge, RouterLink, DatePipe, DecimalPipe],
  providers: [AdminDashboardFacade],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboard implements OnInit {
  readonly facade = inject(AdminDashboardFacade);

  /** Lo que más se usa a diario (la edición de la web, la tienda y lo que entra de clientes). */
  protected readonly quickLinks = [
    { label: 'Landing', route: '/admin/landing' },
    { label: 'Productos', route: '/admin/productos' },
    { label: 'Cotizaciones', route: '/admin/cotizaciones' },
    { label: 'Pedidos', route: '/admin/pedidos' },
  ] as const;

  ngOnInit(): void {
    this.facade.load();
  }

  statusLabel(status: QuoteStatus): string {
    const labels: Record<QuoteStatus, string> = {
      [QuoteStatus.NUEVA]: 'Nueva',
      [QuoteStatus.EN_REVISION]: 'En revisión',
      [QuoteStatus.CONTACTADA]: 'Contactada',
      [QuoteStatus.COTIZADA]: 'Cotizada',
      [QuoteStatus.CERRADA]: 'Cerrada',
      [QuoteStatus.CANCELADA]: 'Cancelada',
    };
    return labels[status] ?? status;
  }

  statusVariant(status: QuoteStatus): BadgeVariant {
    const variants: Record<QuoteStatus, BadgeVariant> = {
      [QuoteStatus.NUEVA]: 'accent',
      [QuoteStatus.EN_REVISION]: 'info',
      [QuoteStatus.CONTACTADA]: 'warning',
      [QuoteStatus.COTIZADA]: 'neutral',
      [QuoteStatus.CERRADA]: 'success',
      [QuoteStatus.CANCELADA]: 'error',
    };
    return variants[status] ?? 'neutral';
  }

  orderStatusLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      [OrderStatus.PENDIENTE_PAGO]: 'Pendiente de pago',
      [OrderStatus.PAGADO_MANUAL]: 'Pago confirmado',
      [OrderStatus.EN_PREPARACION]: 'En preparación',
      [OrderStatus.ENVIADO]: 'Enviado',
      [OrderStatus.ENTREGADO]: 'Entregado',
      [OrderStatus.CANCELADO]: 'Cancelado',
    };
    return labels[status] ?? status;
  }

  orderStatusVariant(status: OrderStatus): BadgeVariant {
    const variants: Record<OrderStatus, BadgeVariant> = {
      [OrderStatus.PENDIENTE_PAGO]: 'warning',
      [OrderStatus.PAGADO_MANUAL]: 'info',
      [OrderStatus.EN_PREPARACION]: 'accent',
      [OrderStatus.ENVIADO]: 'accent',
      [OrderStatus.ENTREGADO]: 'success',
      [OrderStatus.CANCELADO]: 'error',
    };
    return variants[status] ?? 'neutral';
  }
}
