import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import {
  ContactRequestResponse,
  ContactRequestStatus,
} from '../../../data/models/contact/contact-request.model';
import { ContactRequestApiService } from '../../../data/services/contact-request-api.service';

@Injectable()
export class AdminContactFacade {
  private readonly api = inject(ContactRequestApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  readonly requests = signal<readonly ContactRequestResponse[]>([]);
  readonly selected = signal<ContactRequestResponse | null>(null);
  readonly filter = signal<ContactRequestStatus | null>(null);
  readonly loading = signal(true);
  readonly detailLoading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  load(status: ContactRequestStatus | null = this.filter()): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.filter.set(status);
    this.loading.set(true);
    this.error.set(null);
    this.api
      .getAll(status)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: (requests) => this.requests.set(requests),
        error: () => this.error.set('No pudimos cargar la bandeja de contacto.'),
      });
  }
  openDetail(id: string): void {
    this.detailLoading.set(true);
    this.error.set(null);
    this.api
      .getById(id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.detailLoading.set(false)),
      )
      .subscribe({
        next: (request) => this.selected.set(request),
        error: (error: unknown) => this.error.set(this.message(error)),
      });
  }
  closeDetail(): void {
    if (!this.saving()) this.selected.set(null);
  }
  changeStatus(status: ContactRequestStatus): void {
    const current = this.selected();
    if (!current || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    this.api
      .changeStatus(current.id, { estado: status })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: (updated) => {
          this.selected.set(updated);
          this.requests.update((items) =>
            this.filter() && updated.estado !== this.filter()
              ? items.filter((item) => item.id !== updated.id)
              : items.map((item) => (item.id === updated.id ? updated : item)),
          );
          this.success.set('Estado actualizado correctamente.');
        },
        error: (error: unknown) => this.error.set(this.message(error)),
      });
  }
  clearFeedback(): void {
    this.error.set(null);
    this.success.set(null);
  }
  private message(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) return 'El cambio de estado no es válido.';
      if (error.status === 404) return 'La solicitud ya no existe.';
    }
    return 'No pudimos completar la operación.';
  }
}
