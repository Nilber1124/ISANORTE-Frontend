import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin, finalize } from 'rxjs';

import { AnnouncementResponse } from '../../../data/models/announcement/announcement.model';
import { AnnouncementApiService } from '../../../data/services/announcement-api.service';

@Injectable()
export class IsadecorHomeContentFacade {
  private readonly api = inject(AnnouncementApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly _ribbon = signal<readonly AnnouncementResponse[]>([]);
  private readonly _promotions = signal<readonly AnnouncementResponse[]>([]);
  private readonly _announcements = signal<readonly AnnouncementResponse[]>([]);
  private readonly _categories = signal<readonly AnnouncementResponse[]>([]);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);
  private loaded = false;

  readonly ribbon = this._ribbon.asReadonly();
  readonly promotions = this._promotions.asReadonly();
  readonly announcements = this._announcements.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  load(): void {
    if (this.loaded) return;
    this.loaded = true;
    this._loading.set(true);
    forkJoin({
      ribbon: this.api.getPublic('ISADECOR', 'CINTA_HOME'),
      mainPromotions: this.api.getPublic('ISADECOR', 'PROMOCION_PRINCIPAL'),
      secondaryPromotions: this.api.getPublic('ISADECOR', 'PROMOCION_SECUNDARIA'),
      generalAnnouncements: this.api.getPublic('ISADECOR', 'GENERAL'),
      homeAnnouncements: this.api.getPublic('ISADECOR', 'ANUNCIOS_HOME'),
      categories: this.api.getPublic('ISADECOR', 'CATEGORIA_SUPERIOR'),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (content) => {
          this._ribbon.set(content.ribbon);
          this._promotions.set([
            ...content.mainPromotions.slice(0, 1),
            ...content.secondaryPromotions.slice(0, 2),
          ]);
          const announcements = [
            ...content.generalAnnouncements,
            ...content.homeAnnouncements,
          ];
          this._announcements.set(
            [...new Map(announcements.map((item) => [item.id, item])).values()].sort(
              (a, b) => a.orden - b.orden || a.titulo.localeCompare(b.titulo),
            ),
          );
          this._categories.set(content.categories.slice(0, 4));
        },
        error: () => this._error.set('No se pudo cargar el contenido actualizado del Home.'),
      });
  }
}
