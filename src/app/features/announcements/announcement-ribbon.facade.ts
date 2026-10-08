import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import {
  AnnouncementDestination,
  AnnouncementResponse,
} from '../../data/models/announcement/announcement.model';
import { AnnouncementApiService } from '../../data/services/announcement-api.service';

@Injectable()
export class AnnouncementRibbonFacade {
  private readonly api = inject(AnnouncementApiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _announcements = signal<readonly AnnouncementResponse[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly announcements = this._announcements.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  load(destination: Exclude<AnnouncementDestination, 'AMBOS'>): void {
    this._loading.set(true);
    this._error.set(null);
    this.api
      .getPublic(destination)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (announcements) => this._announcements.set(announcements),
        error: (error: unknown) => {
          this._announcements.set([]);
          this._error.set(
            error instanceof HttpErrorResponse && error.status === 0
              ? 'No se pudo conectar con el servicio de anuncios.'
              : 'No se pudieron cargar los anuncios.',
          );
        },
      });
  }
}
