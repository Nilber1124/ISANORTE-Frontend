import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import {
  PublicPageResponse,
  PublicPageType,
  PublicService,
} from '../../../data/models/public-content/public-page.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';

@Injectable()
export class PublicServicesFacade {
  private readonly api = inject(PublicContentApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly _page = signal<PublicPageResponse | null>(null);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);
  private requestInFlight = false;

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
    if (this.requestInFlight) return;

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
        next: (page) => this._page.set(page),
        error: () => {
          this._page.set(null);
          this._error.set('No pudimos cargar los servicios.');
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
