import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Alert } from '../../../shared/components/alert/alert';
import { Badge, BadgeVariant } from '../../../shared/components/badge/badge';
import { AdminDashboardFacade } from './admin-dashboard.facade';
import { QuoteStatus } from '../../../data/models/quote/quote-status.enum';

@Component({
  selector: 'app-admin-dashboard',
  imports: [Alert, Badge, RouterLink, DatePipe],
  providers: [AdminDashboardFacade],
  templateUrl: './admin-dashboard.html',
  styleUrl: './admin-dashboard.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminDashboard implements OnInit {
  readonly facade = inject(AdminDashboardFacade);

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
}
