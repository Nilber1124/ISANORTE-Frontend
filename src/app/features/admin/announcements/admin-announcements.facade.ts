import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import {
  AnnouncementRequest,
  AnnouncementResponse,
} from '../../../data/models/announcement/announcement.model';
import { AnnouncementApiService } from '../../../data/services/announcement-api.service';
import { ToastService } from '../../../core/services/toast.service';

export type AnnouncementFormMode = 'create' | 'edit';

@Injectable()
export class AdminAnnouncementsFacade {
  private readonly api = inject(AnnouncementApiService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _announcements = signal<readonly AnnouncementResponse[]>([]);
  private readonly _loading = signal(true);
  private readonly _submitting = signal(false);
  private readonly _changingActiveId = signal<string | null>(null);
  private readonly _deletingId = signal<string | null>(null);
  private readonly _selected = signal<AnnouncementResponse | null>(null);
  private readonly _formMode = signal<AnnouncementFormMode>('create');
  private readonly _formOpen = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly announcements = this._announcements.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly submitting = this._submitting.asReadonly();
  readonly changingActiveId = this._changingActiveId.asReadonly();
  readonly deletingId = this._deletingId.asReadonly();
  readonly selected = this._selected.asReadonly();
  readonly formMode = this._formMode.asReadonly();
  readonly formOpen = this._formOpen.asReadonly();
  readonly error = this._error.asReadonly();

  load(): void {
    this._loading.set(true);
    this._error.set(null);
    this.api
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (items) => this._announcements.set(this.sort(items)),
        error: () => this._error.set('No pudimos cargar los anuncios.'),
      });
  }

  openCreate(): void {
    this._selected.set(null);
    this._formMode.set('create');
    this._formOpen.set(true);
    this._error.set(null);
  }

  openEdit(announcement: AnnouncementResponse): void {
    this._selected.set(announcement);
    this._formMode.set('edit');
    this._formOpen.set(true);
    this._error.set(null);
  }

  closeForm(): void {
    if (this._submitting()) return;
    this._formOpen.set(false);
    this._selected.set(null);
    this._error.set(null);
  }

  save(request: AnnouncementRequest): void {
    if (this._submitting()) return;
    const selected = this._selected();
    const operation = selected ? this.api.update(selected.id, request) : this.api.create(request);
    this._submitting.set(true);
    this._error.set(null);
    operation
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._submitting.set(false)),
      )
      .subscribe({
        next: (announcement) => {
          this.upsert(announcement);
          this._formOpen.set(false);
          this._selected.set(null);
          this.toast.show(
            selected ? 'Anuncio actualizado correctamente.' : 'Anuncio creado correctamente.',
            'success',
          );
        },
        error: (error: unknown) => this._error.set(this.errorMessage(error)),
      });
  }

  changeActive(announcement: AnnouncementResponse): void {
    if (this._changingActiveId() !== null) return;
    this._changingActiveId.set(announcement.id);
    this.api
      .changeActive(announcement.id, { activo: !announcement.activo })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._changingActiveId.set(null)),
      )
      .subscribe({
        next: (updated) => {
          this.upsert(updated);
          this.toast.show(updated.activo ? 'Anuncio activado.' : 'Anuncio desactivado.', 'success');
        },
        error: () => this._error.set('No pudimos cambiar el estado del anuncio.'),
      });
  }

  delete(announcement: AnnouncementResponse): void {
    if (this._deletingId() !== null) return;
    this._deletingId.set(announcement.id);
    this.api
      .delete(announcement.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._deletingId.set(null)),
      )
      .subscribe({
        next: () => {
          this._announcements.update((items) =>
            items.filter((item) => item.id !== announcement.id),
          );
          this.toast.show('Anuncio eliminado correctamente.', 'success');
        },
        error: () => this._error.set('No pudimos eliminar el anuncio.'),
      });
  }

  clearError(): void {
    this._error.set(null);
  }

  private upsert(announcement: AnnouncementResponse): void {
    const exists = this._announcements().some((item) => item.id === announcement.id);
    const items = exists
      ? this._announcements().map((item) => (item.id === announcement.id ? announcement : item))
      : [...this._announcements(), announcement];
    this._announcements.set(this.sort(items));
  }

  private sort(items: readonly AnnouncementResponse[]): AnnouncementResponse[] {
    return [...items].sort((a, b) => a.orden - b.orden || a.titulo.localeCompare(b.titulo));
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400)
        return error.error?.message ?? 'Revisa los datos y la vigencia ingresada.';
      if (error.status === 404) return 'El anuncio ya no existe.';
    }
    return 'No pudimos guardar el anuncio. Comprueba tu conexión.';
  }
}
