import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DestroyRef } from '@angular/core';

import { PUBLIC_SITE_KEY } from '../../../../core/config/public-site.config';
import { PublicProject } from '../../../../data/models/public-content/public-page.model';
import { PublicContentApiService } from '../../../../data/services/public-content-api.service';

@Injectable()
export class ProjectDetailFacade {
  private readonly api = inject(PublicContentApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _project = signal<PublicProject | null>(null);
  private readonly _loading = signal(true);
  private readonly _notFound = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly project = this._project.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly notFound = this._notFound.asReadonly();
  readonly error = this._error.asReadonly();

  load(slug: string): void {
    this._project.set(null);
    this._notFound.set(false);
    this._error.set(null);
    if (!isPlatformBrowser(this.platformId)) return;

    this._loading.set(true);
    this.api
      .getProject(PUBLIC_SITE_KEY, slug.trim())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (project) => this._project.set(project),
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 404) {
            this._notFound.set(true);
            return;
          }
          this._error.set('No pudimos cargar el proyecto. Inténtalo nuevamente.');
        },
      });
  }
}
