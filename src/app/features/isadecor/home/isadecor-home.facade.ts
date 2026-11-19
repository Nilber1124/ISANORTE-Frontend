import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';

import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { IsadecorHomeContent } from './isadecor-home.model';
import { toHomeContent } from './isadecor-home.mapper';

const SITE_KEY = 'isanorte';
const UNIT_SLUG = 'isadecor';

/** Estado del Home: una sola petición HTTP; las secciones sin contenido se ocultan en la plantilla. */
@Injectable()
export class IsadecorHomeFacade {
  private readonly api = inject(PublicContentApiService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _content = signal<IsadecorHomeContent | null>(null);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);

  readonly content = this._content.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  load(): void {
    this._loading.set(true);
    this._error.set(null);
    this.api
      .getIsadecorHome(SITE_KEY, UNIT_SLUG)
      .pipe(map(toHomeContent), takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (content) => {
          this._content.set(content);
          this._loading.set(false);
        },
        error: () => {
          this._error.set('No se pudo cargar el contenido de ISADECOR.');
          this._loading.set(false);
        },
      });
  }
}
