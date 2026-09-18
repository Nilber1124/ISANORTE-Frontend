import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';

import { QuoteResponse } from '../../../data/models/quote/quote-response.model';
import { QuoteStatus } from '../../../data/models/quote/quote-status.enum';
import { Alert } from '../../../shared/components/alert/alert';
import { Badge, BadgeVariant } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { InputField } from '../../../shared/components/input-field/input-field';
import { Loading } from '../../../shared/components/loading/loading';
import { SelectField, SelectOption } from '../../../shared/components/select-field/select-field';
import { AdminQuotesFacade, QuoteStatusFilter } from './admin-quotes.facade';
import { QuoteDetail } from './components/quote-detail/quote-detail';

@Component({
  selector: 'app-admin-quotes',
  imports: [
    Alert,
    Badge,
    Button,
    DatePipe,
    DecimalPipe,
    EmptyState,
    InputField,
    Loading,
    QuoteDetail,
    SelectField,
  ],
  providers: [AdminQuotesFacade],
  templateUrl: './admin-quotes.html',
  styleUrl: './admin-quotes.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminQuotes {
  readonly facade = inject(AdminQuotesFacade);

  readonly statusOptions: readonly SelectOption[] = [
    { value: 'ALL', label: 'Todos' },
    { value: QuoteStatus.NUEVA, label: 'Nueva' },
    { value: QuoteStatus.EN_REVISION, label: 'En revisión' },
    { value: QuoteStatus.CONTACTADA, label: 'Contactada' },
    { value: QuoteStatus.COTIZADA, label: 'Cotizada' },
    { value: QuoteStatus.CERRADA, label: 'Cerrada' },
    { value: QuoteStatus.CANCELADA, label: 'Cancelada' },
  ];

  constructor() {
    afterNextRender(() => this.facade.load());
  }

  protected updateStatusFilter(status: string): void {
    this.facade.setStatusFilter(status as QuoteStatusFilter);
  }

  protected productCount(quote: QuoteResponse): string {
    const count = quote.detalles?.length ?? 0;
    return `${count} ${count === 1 ? 'producto' : 'productos'}`;
  }

  protected statusLabel(status: QuoteStatus): string {
    return {
      [QuoteStatus.NUEVA]: 'Nueva',
      [QuoteStatus.EN_REVISION]: 'En revisión',
      [QuoteStatus.CONTACTADA]: 'Contactada',
      [QuoteStatus.COTIZADA]: 'Cotizada',
      [QuoteStatus.CERRADA]: 'Cerrada',
      [QuoteStatus.CANCELADA]: 'Cancelada',
    }[status];
  }

  protected statusVariant(status: QuoteStatus): BadgeVariant {
    return {
      [QuoteStatus.NUEVA]: 'info' as const,
      [QuoteStatus.EN_REVISION]: 'warning' as const,
      [QuoteStatus.CONTACTADA]: 'accent' as const,
      [QuoteStatus.COTIZADA]: 'neutral' as const,
      [QuoteStatus.CERRADA]: 'success' as const,
      [QuoteStatus.CANCELADA]: 'error' as const,
    }[status];
  }
}
