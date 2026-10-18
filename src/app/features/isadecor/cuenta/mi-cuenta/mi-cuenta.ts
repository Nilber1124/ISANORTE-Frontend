import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ClienteAuthService } from '../../../../core/auth/cliente-auth.service';
import { AddressRequest, AddressResponse } from '../../../../data/models/address/address.model';
import { OrderStatus } from '../../../../data/models/order/order-status.enum';
import { QuoteStatus } from '../../../../data/models/quote/quote-status.enum';
import { Alert } from '../../../../shared/components/alert/alert';
import { Badge, BadgeVariant } from '../../../../shared/components/badge/badge';
import { Button } from '../../../../shared/components/button/button';
import { Loading } from '../../../../shared/components/loading/loading';
import { Modal } from '../../../../shared/components/modal/modal';
import { AddressForm, AddressFormValue } from '../components/address-form/address-form';
import { MiCuentaFacade } from './mi-cuenta.facade';

const QUOTE_CERRADAS: readonly QuoteStatus[] = [QuoteStatus.CERRADA, QuoteStatus.CANCELADA];

const QUOTE_ESTADO_VARIANTS: Record<QuoteStatus, BadgeVariant> = {
  [QuoteStatus.NUEVA]: 'info',
  [QuoteStatus.EN_REVISION]: 'warning',
  [QuoteStatus.CONTACTADA]: 'accent',
  [QuoteStatus.COTIZADA]: 'success',
  [QuoteStatus.CERRADA]: 'neutral',
  [QuoteStatus.CANCELADA]: 'error',
};

const QUOTE_ESTADO_LABELS: Record<QuoteStatus, string> = {
  [QuoteStatus.NUEVA]: 'Nueva',
  [QuoteStatus.EN_REVISION]: 'En revisión',
  [QuoteStatus.CONTACTADA]: 'Contactada',
  [QuoteStatus.COTIZADA]: 'Cotizada',
  [QuoteStatus.CERRADA]: 'Cerrada',
  [QuoteStatus.CANCELADA]: 'Cancelada',
};

const ORDER_CERRADOS: readonly OrderStatus[] = [OrderStatus.ENTREGADO, OrderStatus.CANCELADO];

const ORDER_ESTADO_VARIANTS: Record<OrderStatus, BadgeVariant> = {
  [OrderStatus.PENDIENTE_PAGO]: 'warning',
  [OrderStatus.PAGADO_MANUAL]: 'info',
  [OrderStatus.EN_PREPARACION]: 'accent',
  [OrderStatus.ENVIADO]: 'accent',
  [OrderStatus.ENTREGADO]: 'success',
  [OrderStatus.CANCELADO]: 'error',
};

const ORDER_ESTADO_LABELS: Record<OrderStatus, string> = {
  [OrderStatus.PENDIENTE_PAGO]: 'Pendiente de pago',
  [OrderStatus.PAGADO_MANUAL]: 'Pago confirmado',
  [OrderStatus.EN_PREPARACION]: 'En preparación',
  [OrderStatus.ENVIADO]: 'Enviado',
  [OrderStatus.ENTREGADO]: 'Entregado',
  [OrderStatus.CANCELADO]: 'Cancelado',
};

@Component({
  selector: 'app-isadecor-mi-cuenta',
  imports: [
    Alert,
    AddressForm,
    Badge,
    Button,
    DatePipe,
    DecimalPipe,
    Loading,
    Modal,
    RouterLink,
  ],
  providers: [MiCuentaFacade],
  templateUrl: './mi-cuenta.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiCuenta {
  private readonly auth = inject(ClienteAuthService);
  private readonly router = inject(Router);
  readonly facade = inject(MiCuentaFacade);

  readonly cliente = this.auth.cliente;

  readonly nombreCompleto = computed(() => {
    const cliente = this.cliente();
    return cliente ? [cliente.nombre, cliente.apellido].filter(Boolean).join(' ') : '';
  });
  readonly iniciales = computed(() => {
    const cliente = this.cliente();
    if (!cliente) return '';
    return [cliente.nombre, cliente.apellido]
      .filter(Boolean)
      .map((parte) => parte!.trim().charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  });
  readonly totalCotizaciones = computed(() => this.facade.quotes().length);
  readonly cotizacionesEnCurso = computed(
    () => this.facade.quotes().filter((c) => !QUOTE_CERRADAS.includes(c.estado)).length,
  );
  readonly pedidosEnCurso = computed(
    () => this.facade.orders().filter((o) => !ORDER_CERRADOS.includes(o.estado)).length,
  );

  constructor() {
    // Solo en el navegador: la página es de render en cliente y depende de la sesión local.
    afterNextRender(() => {
      this.facade.cargarCotizaciones();
      this.facade.cargarPedidos();
      this.facade.cargarDirecciones();
    });
  }

  quoteEstadoLabel(estado: QuoteStatus): string {
    return QUOTE_ESTADO_LABELS[estado] ?? estado;
  }

  quoteEstadoVariant(estado: QuoteStatus): BadgeVariant {
    return QUOTE_ESTADO_VARIANTS[estado] ?? 'neutral';
  }

  orderEstadoLabel(estado: OrderStatus): string {
    return ORDER_ESTADO_LABELS[estado] ?? estado;
  }

  orderEstadoVariant(estado: OrderStatus): BadgeVariant {
    return ORDER_ESTADO_VARIANTS[estado] ?? 'neutral';
  }

  addressLabel(address: AddressResponse): string {
    return address.alias?.trim() || address.calle;
  }

  protected saveAddress(value: AddressFormValue): void {
    const request: AddressRequest = { ...value };
    this.facade.saveAddress(request);
  }

  cerrarSesion(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/isadecor');
  }
}
