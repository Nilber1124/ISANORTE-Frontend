import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { finalize } from 'rxjs';

import { PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import {
  PublicCompanyStatistic,
  PublicPageResponse,
  PublicPageType,
} from '../../../data/models/public-content/public-page.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import {
  PublicPageSeoDefaults,
  applyPublicPageSeo,
  clearPublicPageSeo,
} from '../../../shared/utils/public-page-seo.util';

export interface AboutValueView {
  id: 'mision' | 'vision' | 'valores';
  label: 'Misión' | 'Visión' | 'Valores';
  description: string;
}

@Injectable()
export class PublicAboutFacade {
  private readonly api = inject(PublicContentApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT, { optional: true });

  private readonly seoDefaults: PublicPageSeoDefaults = {
    title: 'Nosotros | ISANORTE',
    description:
      'Conoce la trayectoria, misión, visión y valores corporativos de ISANORTE, empresa líder en construcción e ingeniería.',
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
  readonly company = computed(() => this.page()?.empresa ?? null);
  readonly seo = computed(() => this.page()?.seo ?? null);
  readonly tags = computed<readonly string[]>(() => this.content()?.tags ?? []);
  readonly statistics = computed<readonly PublicCompanyStatistic[]>(() =>
    this.stableOrder(this.company()?.estadisticas ?? []),
  );
  readonly values = computed<readonly AboutValueView[]>(() => {
    const company = this.company();
    if (company === null) return [];

    return [
      this.value('mision', 'Misión', company.mision),
      this.value('vision', 'Visión', company.vision),
      this.value('valores', 'Valores', company.valores),
    ].filter((value): value is AboutValueView => value !== null);
  });
  readonly showStatistics = computed(() => this.statistics().length > 0);
  readonly showValues = computed(() => this.values().length > 0);

  load(): void {
    if (this.destroyed || this.requestInFlight) return;

    this.requestInFlight = true;
    this._loading.set(true);
    this._error.set(null);

    this.api
      .getPage(PUBLIC_SITE_KEY, PublicPageType.NOSOTROS)
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
          this._error.set('No pudimos cargar el contenido de Nosotros.');
          applyPublicPageSeo(this.title, this.meta, null, this.seoDefaults, this.document);
        },
      });
  }

  private stableOrder(values: readonly PublicCompanyStatistic[]): PublicCompanyStatistic[] {
    return values
      .map((value, sourceIndex) => ({ value, sourceIndex }))
      .sort(
        (left, right) =>
          left.value.orden - right.value.orden || left.sourceIndex - right.sourceIndex,
      )
      .map(({ value }) => value);
  }

  private value(
    id: AboutValueView['id'],
    label: AboutValueView['label'],
    content: string | null,
  ): AboutValueView | null {
    const description = content?.trim();
    return description ? { id, label, description } : null;
  }
}
