import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal } from '@angular/core';

import { SALE_CHANNEL_LABELS, SALE_PAYMENT_LABELS, SaleChannel, SaleRequest, SaleResponse } from '../../../data/models/sale/sale.model';
import { OrderStatus } from '../../../data/models/order/order-status.enum';
import { Alert } from '../../../shared/components/alert/alert';
import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { Modal } from '../../../shared/components/modal/modal';
import { SelectField, SelectOption } from '../../../shared/components/select-field/select-field';
import { AdminPageHeader } from '../shared/admin-page-header/admin-page-header';
import { AdminSalesFacade } from './admin-sales.facade';
import { SaleForm } from './components/sale-form/sale-form';

export type SaleStatusFilter = '' | 'cobradas' | 'por-cobrar' | 'anuladas';

/** Ventas hechas fuera de la web (WhatsApp, tienda…): se registran aquí y descuentan el stock de los productos. */
@Component({
  selector: 'app-admin-sales',
  imports: [AdminPageHeader, Alert, Badge, Button, DatePipe, DecimalPipe, EmptyState, Loading, Modal, SaleForm, SelectField],
  providers: [AdminSalesFacade],
  templateUrl: './admin-sales.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSales {
  readonly facade = inject(AdminSalesFacade);

  protected readonly channelLabels = SALE_CHANNEL_LABELS;
  protected readonly paymentLabels = SALE_PAYMENT_LABELS;

  protected readonly statusFilter = signal<SaleStatusFilter>('');
  protected readonly channelFilter = signal<string>('');
  protected readonly saleToCancel = signal<SaleResponse | null>(null);

  protected readonly statusOptions: readonly SelectOption[] = [
    { value: '', label: 'Todas' },
    { value: 'cobradas', label: 'Cobradas' },
    { value: 'por-cobrar', label: 'Por cobrar' },
    { value: 'anuladas', label: 'Anuladas' },
  ];
  protected readonly channelOptions: readonly SelectOption[] = [
    { value: '', label: 'Todos los canales' },
    ...(Object.keys(SALE_CHANNEL_LABELS) as SaleChannel[]).map((value) => ({ value, label: SALE_CHANNEL_LABELS[value] })),
  ];

  protected readonly filtered = computed(() => {
    const status = this.statusFilter();
    const channel = this.channelFilter();
    return this.facade.sales().filter((sale) => {
      if (channel && sale.canal !== channel) return false;
      if (status === 'anuladas') return sale.anulada;
      if (status === 'cobradas') return !sale.anulada && sale.pagado;
      if (status === 'por-cobrar') return !sale.anulada && !sale.pagado;
      return true;
    });
  });

  protected readonly recentOnlineOrders = computed(() =>
    [...this.facade.onlineOrders()]
      .sort((a, b) => (b.fechaCreacion ?? '').localeCompare(a.fechaCreacion ?? ''))
      .slice(0, 15),
  );

  protected orderLabel(status: OrderStatus): string {
    const labels: Record<OrderStatus, string> = {
      [OrderStatus.PENDIENTE_PAGO]: 'Pendiente de pago',
      [OrderStatus.PAGADO_MANUAL]: 'Pago confirmado',
      [OrderStatus.PAGADO_ONLINE]: 'Pagado en línea',
      [OrderStatus.EN_PREPARACION]: 'En preparación',
      [OrderStatus.ENVIADO]: 'Enviado',
      [OrderStatus.ENTREGADO]: 'Entregado',
      [OrderStatus.CANCELADO]: 'Cancelado',
    };
    return labels[status];
  }

  protected orderBadge(status: OrderStatus): 'success' | 'warning' | 'error' | 'info' {
    if (status === OrderStatus.PENDIENTE_PAGO) return 'warning';
    if (status === OrderStatus.CANCELADO) return 'error';
    if (status === OrderStatus.ENTREGADO) return 'success';
    return 'info';
  }

  constructor() {
    afterNextRender(() => this.facade.load());
  }

  protected save(request: SaleRequest): void {
    this.facade.save(request);
  }

  protected requestCancel(sale: SaleResponse): void {
    this.saleToCancel.set(sale);
  }

  protected confirmCancel(): void {
    const sale = this.saleToCancel();
    if (sale === null) return;
    this.facade.setAnulada(sale, true);
    this.saleToCancel.set(null);
  }

  protected editingSale(): SaleResponse | null {
    const current = this.facade.editing();
    return current === 'new' || current === null ? null : current;
  }

  protected customer(sale: SaleResponse): string {
    return sale.clienteNombre ?? sale.razonSocial ?? 'Sin nombre';
  }

  protected linesSummary(sale: SaleResponse): string {
    const [first, ...rest] = sale.detalles;
    if (!first) return '';
    return rest.length === 0 ? `${first.cantidad} × ${first.nombre}` : `${first.cantidad} × ${first.nombre} y ${rest.length} más`;
  }
}
