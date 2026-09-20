import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize, forkJoin } from 'rxjs';

import {
  PageContentRequest,
  PageContentResponse,
  PageContentUpdateRequest,
} from '../../../data/models/content/page-content.model';
import {
  PageSeoRequest,
  PageSeoResponse,
  PageSeoUpdateRequest,
} from '../../../data/models/content/page-seo.model';
import { BusinessUnitResponse } from '../../../data/models/business-unit/business-unit-response.model';
import { SiteConfigResponse } from '../../../data/models/site-config/site-config-response.model';
import { BusinessUnitApiService } from '../../../data/services/business-unit-api.service';
import { PageContentApiService } from '../../../data/services/page-content-api.service';
import { PageSeoApiService } from '../../../data/services/page-seo-api.service';
import { SiteConfigApiService } from '../../../data/services/site-config-api.service';

@Injectable()
export class AdminContentFacade {
  private readonly contentApi = inject(PageContentApiService);
  private readonly seoApi = inject(PageSeoApiService);
  private readonly configApi = inject(SiteConfigApiService);
  private readonly unitApi = inject(BusinessUnitApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  readonly contents = signal<readonly PageContentResponse[]>([]);
  readonly seoPages = signal<readonly PageSeoResponse[]>([]);
  readonly configurations = signal<readonly SiteConfigResponse[]>([]);
  readonly units = signal<readonly BusinessUnitResponse[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);

  load(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      contents: this.contentApi.getAll(),
      seo: this.seoApi.getAll(),
      configurations: this.configApi.getAll(),
      units: this.unitApi.getAll(),
    })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.loading.set(false)),
      )
      .subscribe({
        next: ({ contents, seo, configurations, units }) => {
          this.contents.set(contents);
          this.seoPages.set(seo);
          this.configurations.set(configurations);
          this.units.set(units);
        },
        error: () => this.error.set('No pudimos cargar el contenido editorial y SEO.'),
      });
  }

  saveContent(
    request: PageContentRequest | PageContentUpdateRequest,
    current?: PageContentResponse,
  ): void {
    if (this.saving()) return;
    this.startSaving();
    const operation = current
      ? this.contentApi.update(current.id, request as PageContentUpdateRequest)
      : this.contentApi.create(request as PageContentRequest);
    operation
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: (saved) => {
          this.contents.update((items) => this.upsert(items, saved));
          this.success.set(
            current ? 'Contenido actualizado correctamente.' : 'Contenido creado correctamente.',
          );
        },
        error: (error: unknown) => this.error.set(this.errorMessage(error, 'contenido')),
      });
  }

  saveSeo(request: PageSeoRequest | PageSeoUpdateRequest, current?: PageSeoResponse): void {
    if (this.saving()) return;
    this.startSaving();
    const operation = current
      ? this.seoApi.update(current.id, request as PageSeoUpdateRequest)
      : this.seoApi.create(request as PageSeoRequest);
    operation
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.saving.set(false)),
      )
      .subscribe({
        next: (saved) => {
          this.seoPages.update((items) => this.upsert(items, saved));
          this.success.set(
            current ? 'SEO actualizado correctamente.' : 'SEO creado correctamente.',
          );
        },
        error: (error: unknown) => this.error.set(this.errorMessage(error, 'SEO')),
      });
  }

  clearFeedback(): void {
    this.error.set(null);
    this.success.set(null);
  }

  private startSaving(): void {
    this.saving.set(true);
    this.clearFeedback();
  }

  private upsert<T extends { id: string }>(items: readonly T[], saved: T): T[] {
    return items.some((item) => item.id === saved.id)
      ? items.map((item) => (item.id === saved.id ? saved : item))
      : [...items, saved];
  }

  private errorMessage(error: unknown, resource: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) return `Revisa las reglas y los datos de ${resource}.`;
      if (error.status === 404) return `El ${resource} o una de sus relaciones ya no existe.`;
      if (error.status === 409) return `Ya existe ${resource} para ese sitio e identidad.`;
    }
    return `No pudimos guardar ${resource}. Comprueba tu conexión.`;
  }
}
