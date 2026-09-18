import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { QuoteResponse } from '../../../data/models/quote/quote-response.model';
import { QuoteStatus } from '../../../data/models/quote/quote-status.enum';
import { QuoteApiService } from '../../../data/services/quote-api.service';

export type QuoteStatusFilter = QuoteStatus | 'ALL';

@Injectable()
export class AdminQuotesFacade {
  private readonly quoteApi = inject(QuoteApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _quotes = signal<readonly QuoteResponse[]>([]);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);
  private readonly _success = signal<string | null>(null);
  private readonly _selectedStatus = signal<QuoteStatusFilter>('ALL');
  private readonly _searchTerm = signal('');
  private readonly _selectedQuote = signal<QuoteResponse | null>(null);
  private readonly _detailOpen = signal(false);
  private readonly _loadingDetail = signal(false);
  private readonly _detailError = signal<string | null>(null);
  private readonly _statusError = signal<string | null>(null);
  private readonly _changingStatusId = signal<string | null>(null);

  readonly quotes = this._quotes.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly success = this._success.asReadonly();
  readonly selectedStatus = this._selectedStatus.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly selectedQuote = this._selectedQuote.asReadonly();
  readonly detailOpen = this._detailOpen.asReadonly();
  readonly loadingDetail = this._loadingDetail.asReadonly();
  readonly detailError = this._detailError.asReadonly();
  readonly statusError = this._statusError.asReadonly();
  readonly changingStatusId = this._changingStatusId.asReadonly();

  readonly filteredQuotes = computed(() => {
    const status = this._selectedStatus();
    const term = this._searchTerm().trim().toLocaleLowerCase('es');

    return this._quotes().filter((quote) => {
      const matchesStatus = status === 'ALL' || quote.estado === status;
      if (!matchesStatus || term.length === 0) return matchesStatus;

      return [quote.codigo, quote.nombreCliente, quote.emailCliente, quote.telefonoCliente].some(
        (value) => value.toLocaleLowerCase('es').includes(term),
      );
    });
  });

  load(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this._loading.set(true);
    this._error.set(null);
    this.quoteApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (quotes) => this._quotes.set(this.sortQuotes(quotes)),
        error: () =>
          this._error.set(
            'No pudimos cargar las cotizaciones. Comprueba tu conexión e inténtalo nuevamente.',
          ),
      });
  }

  setStatusFilter(status: QuoteStatusFilter): void {
    this._selectedStatus.set(status);
  }

  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
  }

  openDetail(quote: QuoteResponse): void {
    if (this._loadingDetail()) return;

    this._selectedQuote.set(null);
    this._detailOpen.set(true);
    this._loadingDetail.set(true);
    this._detailError.set(null);
    this._statusError.set(null);
    this._success.set(null);

    this.quoteApi
      .getById(quote.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loadingDetail.set(false)),
      )
      .subscribe({
        next: (detail) => this._selectedQuote.set(detail),
        error: (error: unknown) => this._detailError.set(this.detailErrorMessage(error)),
      });
  }

  closeDetail(): void {
    if (this._changingStatusId() !== null) return;
    this._detailOpen.set(false);
    this._selectedQuote.set(null);
    this._detailError.set(null);
    this._statusError.set(null);
  }

  changeStatus(status: QuoteStatus): void {
    const quote = this._selectedQuote();
    if (quote === null || quote.estado === status || this._changingStatusId() !== null) return;

    this._changingStatusId.set(quote.id);
    this._statusError.set(null);
    this._error.set(null);
    this._success.set(null);

    this.quoteApi
      .changeStatus(quote.id, { estado: status })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._changingStatusId.set(null)),
      )
      .subscribe({
        next: (updatedQuote) => {
          this.upsertQuote(updatedQuote);
          this._selectedQuote.set(updatedQuote);
          this._success.set('Estado actualizado correctamente.');
        },
        error: (error: unknown) => this._statusError.set(this.statusErrorMessage(error)),
      });
  }

  clearFeedback(): void {
    this._error.set(null);
    this._success.set(null);
  }

  private upsertQuote(quote: QuoteResponse): void {
    const nextQuotes = this._quotes().map((item) => (item.id === quote.id ? quote : item));
    this._quotes.set(this.sortQuotes(nextQuotes));
  }

  private sortQuotes(quotes: readonly QuoteResponse[]): QuoteResponse[] {
    return [...quotes].sort((first, second) => {
      const firstDate = first.fechaCreacion ?? '';
      const secondDate = second.fechaCreacion ?? '';
      return secondDate.localeCompare(firstDate);
    });
  }

  private detailErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 404) {
      return 'La cotización ya no existe o no está disponible.';
    }
    return 'No pudimos cargar el detalle. Comprueba tu conexión e inténtalo nuevamente.';
  }

  private statusErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400)
        return 'El estado seleccionado o los datos enviados no son válidos.';
      if (error.status === 404) return 'La cotización ya no existe o no está disponible.';
      if (error.status === 409) return 'No pudimos cambiar el estado debido a un conflicto.';
    }
    return 'No pudimos actualizar el estado. Comprueba tu conexión e inténtalo nuevamente.';
  }
}
