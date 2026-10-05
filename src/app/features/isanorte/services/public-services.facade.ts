import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { finalize } from 'rxjs';

import { PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import {
  PublicPageResponse,
  PublicPageType,
  PublicService,
} from '../../../data/models/public-content/public-page.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import {
  PublicPageSeoDefaults,
  applyPublicPageSeo,
  clearPublicPageSeo,
} from '../../../shared/utils/public-page-seo.util';

@Injectable()
export class PublicServicesFacade {
  private readonly api = inject(PublicContentApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT, { optional: true });

  private readonly seoDefaults: PublicPageSeoDefaults = {
    title: 'Servicios | ISANORTE',
    description:
      'Descubre nuestros servicios integrales de construcción, diseño arquitectónico, consultoría y ejecución de proyectos de ingeniería.',
  };

  private readonly _page = signal<PublicPageResponse | null>(null);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);
  private requestInFlight = false;
  private destroyed = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      clearPublicPageSeo(this.title, this.meta);
    });
  }

  readonly page = this._page.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly content = computed(() => this.page()?.contenido ?? null);
  readonly seo = computed(() => this.page()?.seo ?? null);
  readonly services = computed<readonly PublicService[]>(() =>
    this.stableOrder(this.page()?.servicios ?? []).map((service) => ({
      ...service,
      beneficios: this.stableOrder(service.beneficios ?? []),
    })),
  );
  readonly showServices = computed(() => this.services().length > 0);

  load(): void {
    if (this.destroyed || this.requestInFlight) return;

    this.requestInFlight = true;
    this._loading.set(true);
    this._error.set(null);

    this.api
      .getPage(PUBLIC_SITE_KEY, PublicPageType.SERVICIOS)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.requestInFlight = false;
          this._loading.set(false);
        }),
      )
      .subscribe({
        next: (page) => {
          if (this.destroyed) return;
          this._page.set(page);
          applyPublicPageSeo(this.title, this.meta, page, this.seoDefaults, this.document);
        },
        error: () => {
          if (this.destroyed) return;
          this._page.set(null);
          this._error.set('No pudimos cargar los servicios.');
          applyPublicPageSeo(this.title, this.meta, null, this.seoDefaults, this.document);
        },
      });
  }

  private stableOrder<T extends { orden: number }>(values: readonly T[]): T[] {
    return values
      .map((value, sourceIndex) => ({ value, sourceIndex }))
      .sort((left, right) => left.value.orden - right.value.orden || left.sourceIndex - right.sourceIndex)
      .map(({ value }) => value);
  }
}
