import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';

import { QuoteResponse } from '../../../../../data/models/quote/quote-response.model';
import { QuoteStatus } from '../../../../../data/models/quote/quote-status.enum';
import { Alert } from '../../../../../shared/components/alert/alert';
import { Badge, BadgeVariant } from '../../../../../shared/components/badge/badge';
import { Button } from '../../../../../shared/components/button/button';
import { Card } from '../../../../../shared/components/card/card';
import { EmptyState } from '../../../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../../../shared/components/loading/loading';
import { Modal } from '../../../../../shared/components/modal/modal';
import {
  SelectField,
  SelectOption,
} from '../../../../../shared/components/select-field/select-field';

@Component({
  selector: 'app-quote-detail',
  imports: [
    Alert,
    Badge,
    Button,
    Card,
    DatePipe,
    DecimalPipe,
    EmptyState,
    Loading,
    Modal,
    SelectField,
  ],
  templateUrl: './quote-detail.html',
  styleUrl: './quote-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuoteDetail {
  readonly quote = input<QuoteResponse | null>(null);
  readonly loading = input(false);
  readonly error = input<string | null>(null);
  readonly statusError = input<string | null>(null);
  readonly success = input<string | null>(null);
  readonly changingStatus = input(false);

  readonly closed = output<void>();
  readonly statusChanged = output<QuoteStatus>();

  readonly nextStatus = signal<QuoteStatus>(QuoteStatus.NUEVA);
  readonly statusOptions: readonly SelectOption[] = [
    { value: QuoteStatus.NUEVA, label: 'Nueva' },
    { value: QuoteStatus.EN_REVISION, label: 'En revisión' },
    { value: QuoteStatus.CONTACTADA, label: 'Contactada' },
    { value: QuoteStatus.COTIZADA, label: 'Cotizada' },
    { value: QuoteStatus.CERRADA, label: 'Cerrada' },
    { value: QuoteStatus.CANCELADA, label: 'Cancelada' },
  ];

  private readonly syncStatus = effect(() => {
    const quote = this.quote();
    if (quote !== null) this.nextStatus.set(quote.estado);
  });

  protected updateNextStatus(status: string): void {
    this.nextStatus.set(status as QuoteStatus);
  }

  protected submitStatus(): void {
    const quote = this.quote();
    if (quote === null || this.changingStatus() || quote.estado === this.nextStatus()) return;
    this.statusChanged.emit(this.nextStatus());
  }

  protected statusLabel(status: QuoteStatus | null): string {
    if (status === null) return 'Sin estado';
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
