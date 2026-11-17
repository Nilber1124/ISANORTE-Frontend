import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { finalize } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { PUBLIC_SITE_KEY } from '../../../../core/config/public-site.config';
import {
  PublicPageType,
  PublicProject,
} from '../../../../data/models/public-content/public-page.model';
import { PublicContentApiService } from '../../../../data/services/public-content-api.service';
import { pickRelatedProjects } from './related-projects';

@Injectable()
export class ProjectDetailFacade {
  private readonly api = inject(PublicContentApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _project = signal<PublicProject | null>(null);
  private readonly _loading = signal(true);
  private readonly _notFound = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _related = signal<readonly PublicProject[]>([]);

  readonly project = this._project.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly notFound = this._notFound.asReadonly();
  readonly error = this._error.asReadonly();
  /** Otros proyectos sugeridos; vacío si no hay o si falla su carga (es un complemento). */
  readonly related = this._related.asReadonly();

  load(slug: string): void {
    this._project.set(null);
    this._notFound.set(false);
    this._error.set(null);
    this._related.set([]);
    if (!isPlatformBrowser(this.platformId)) return;

    this._loading.set(true);
    this.api
      .getProject(PUBLIC_SITE_KEY, slug.trim())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (project) => {
          this._project.set(project);
          this.loadRelated(project);
        },
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 404) {
            this._notFound.set(true);
            return;
          }
          this._error.set('No pudimos cargar el proyecto. Inténtalo nuevamente.');
        },
      });
  }

  private loadRelated(project: PublicProject): void {
    this.api
      .getPage(PUBLIC_SITE_KEY, PublicPageType.PROYECTOS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => this._related.set(pickRelatedProjects(project, page.proyectos ?? [])),
        error: () => this._related.set([]),
      });
  }
}
