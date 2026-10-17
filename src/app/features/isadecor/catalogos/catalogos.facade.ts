import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { finalize } from 'rxjs';

import { ISADECOR_UNIT_SLUG, PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import { PublicCatalogo } from '../../../data/models/public-content/public-business-unit.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import {
  PublicPageSeoDefaults,
  applyPublicPageSeo,
  clearPublicPageSeo,
} from '../../../shared/utils/public-page-seo.util';

@Injectable()
export class CatalogosFacade {
  readonly siteKey: string = PUBLIC_SITE_KEY;
  readonly unitSlug: string = ISADECOR_UNIT_SLUG;

  private readonly publicApi = inject(PublicContentApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT, { optional: true });

  private readonly seoDefaults: PublicPageSeoDefaults = {
    title: 'Catálogos | ISADECOR',
    description: 'Descarga los catálogos en PDF de las líneas de productos de ISADECOR.',
    siteTitle: 'ISADECOR',
  };

  private readonly _catalogos = signal<readonly PublicCatalogo[]>([]);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);

  readonly catalogos = this._catalogos.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  constructor() {
    this.destroyRef.onDestroy(() => clearPublicPageSeo(this.title, this.meta, 'ISADECOR'));
  }

  load(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this._loading.set(true);
    this._error.set(null);
    this.publicApi
      .getBusinessUnit(this.siteKey, this.unitSlug)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (unit) => {
          this._catalogos.set([...unit.catalogos].sort((a, b) => a.orden - b.orden));
          applyPublicPageSeo(this.title, this.meta, { seo: unit.seo }, this.seoDefaults, this.document);
        },
        error: () => {
          this._error.set(
            'No pudimos cargar los catálogos. Comprueba tu conexión e inténtalo nuevamente.',
          );
          applyPublicPageSeo(this.title, this.meta, null, this.seoDefaults, this.document);
        },
      });
  }
}
