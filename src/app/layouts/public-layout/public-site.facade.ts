import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { PUBLIC_SITE_KEY } from '../../core/config/public-site.config';
import {
  PublicSiteBusinessUnit,
  PublicSiteResponse,
  PublicSiteSocialNetwork,
} from '../../data/models/public-content/public-site.model';
import { PublicContentApiService } from '../../data/services/public-content-api.service';
import { PUBLIC_SITE_ERROR_FALLBACK } from './public-site-fallback';

export interface PublicSiteConfigurationView {
  key: string;
  title: string | null;
  description: string | null;
  logoUrl: string | null;
  logoWhiteUrl: string | null;
  faviconUrl: string | null;
  footerText: string | null;
}

export interface PublicBusinessUnitLink {
  name: string;
  slug: string;
  url: string;
  order: number;
}

@Injectable()
export class PublicSiteFacade {
  private readonly api = inject(PublicContentApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly _site = signal<PublicSiteResponse | null>(null);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);
  private requested = false;

  readonly site = this._site.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  private readonly effectiveSite = computed(() => {
    const site = this._site();
    if (site !== null) return site;
    return this._error() !== null ? PUBLIC_SITE_ERROR_FALLBACK : null;
  });

  readonly configuration = computed<PublicSiteConfigurationView | null>(() => {
    const site = this.effectiveSite();
    if (site === null) return null;

    return {
      key: site.clave,
      title: site.tituloSitio,
      description: site.descripcionSitio,
      logoUrl: site.logoUrl,
      logoWhiteUrl: site.logoBlancoUrl,
      faviconUrl: site.faviconUrl,
      footerText: site.textoPiePagina,
    };
  });

  readonly company = computed(() => this.effectiveSite()?.empresa ?? null);

  readonly socialNetworks = computed<readonly PublicSiteSocialNetwork[]>(() =>
    this.stableOrder(this.effectiveSite()?.redes ?? []),
  );

  readonly presentableSocialNetworks = computed(() =>
    this.socialNetworks().filter((network) => this.isExternalHttpUrl(network.url)),
  );

  readonly businessUnits = computed<readonly PublicSiteBusinessUnit[]>(() =>
    this.stableOrder(this.effectiveSite()?.unidades ?? []),
  );

  readonly businessUnitLinks = computed<readonly PublicBusinessUnitLink[]>(() =>
    this.businessUnits().flatMap((unit) => {
      const slug = unit.slug.trim();
      return slug
        ? [{ name: unit.nombre, slug, url: `/${encodeURIComponent(slug)}`, order: unit.orden }]
        : [];
    }),
  );

  readonly brandLogo = computed(() => this.optionalText(this.configuration()?.logoUrl ?? null));
  readonly brandLogoWhite = computed(() =>
    this.optionalText(this.configuration()?.logoWhiteUrl ?? null),
  );
  readonly siteName = computed(
    () =>
      this.optionalText(this.configuration()?.title ?? null) ??
      this.optionalText(this.company()?.nombreComercial ?? null) ??
      '',
  );
  readonly companyName = computed(
    () => this.optionalText(this.company()?.nombreComercial ?? null) ?? this.siteName(),
  );
  readonly companySummary = computed(
    () =>
      this.optionalText(this.company()?.resumenNosotros ?? null) ??
      this.optionalText(this.configuration()?.description ?? null),
  );
  readonly contactEmails = computed(() => {
    const company = this.company();
    if (company === null) return [];

    return [company.email, company.emailVentas]
      .map((value) => this.optionalText(value))
      .filter((value): value is string => value !== null && this.isPresentableEmail(value))
      .filter((value, index, values) => values.indexOf(value) === index);
  });
  readonly contactPhones = computed(() => {
    const company = this.company();
    if (company === null) return [];

    return [company.telefono, company.telefonoSecundario]
      .map((value) => this.optionalText(value))
      .filter((value): value is string => value !== null)
      .filter((value, index, values) => values.indexOf(value) === index);
  });
  readonly address = computed(() => this.optionalText(this.company()?.direccion ?? null));
  readonly city = computed(() => this.optionalText(this.company()?.ciudad ?? null));
  readonly hasContactDetails = computed(
    () =>
      this.contactEmails().length > 0 ||
      this.contactPhones().length > 0 ||
      this.address() !== null ||
      this.city() !== null,
  );
  readonly footerText = computed(() => {
    const value = this.optionalText(this.configuration()?.footerText ?? null);
    return value?.replace(/^©\s*\d{4}\s*/u, '') ?? null;
  });

  load(): void {
    if (this.requested) return;
    this.requested = true;
    this._loading.set(true);
    this._error.set(null);

    this.api
      .getSite(PUBLIC_SITE_KEY)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (site) => this._site.set(site),
        error: () =>
          this._error.set(
            'No pudimos cargar la información pública del sitio. Mostramos branding mínimo.',
          ),
      });
  }

  private stableOrder<T extends { orden: number }>(values: readonly T[]): T[] {
    return values
      .map((value, sourceIndex) => ({ value, sourceIndex }))
      .sort(
        (left, right) =>
          left.value.orden - right.value.orden || left.sourceIndex - right.sourceIndex,
      )
      .map(({ value }) => value);
  }

  private optionalText(value: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private isPresentableEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  private isExternalHttpUrl(value: string): boolean {
    try {
      const url = new URL(value);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
}
