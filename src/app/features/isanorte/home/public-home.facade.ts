import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import {
  PublicBusinessUnitResourceType,
  PublicHomeAction,
  PublicHomeResponse,
  PublicHomeSectionType,
} from '../../../data/models/public-content/public-home.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { CinematicScene } from '../../../shared/components/cinematic-tour/cinematic-tour';
import { HOME_HERO_FALLBACK, HeroActionViewData, HeroViewData } from './home-hero-fallback';
import {
  BUSINESS_UNIT_WEB_CATALOG_LABEL,
  HOME_BUSINESS_UNIT_FALLBACK,
} from './home-business-unit-fallback';
import {
  HOME_SERVICES_FALLBACK,
  HomeServiceActionView,
  HomeServiceCardView,
  HomeServicesHeaderView,
  LEGACY_HOME_SERVICE_CARD_LINK,
} from './home-services-fallback';

export interface HomeBusinessUnitActionView {
  label: string;
  url: string;
}

@Injectable()
export class PublicHomeFacade {
  private readonly api = inject(PublicContentApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly _home = signal<PublicHomeResponse | null>(null);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);
  private requestInFlight = false;

  readonly home = this._home.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly heroSection = computed(
    () =>
      this._home()?.secciones.find((section) => section.tipo === PublicHomeSectionType.HERO) ??
      null,
  );

  readonly hero = computed<HeroViewData | null>(() => {
    const home = this._home();
    if (home === null) return HOME_HERO_FALLBACK.content;

    const section = this.heroSection();
    if (section === null) return null;

    return {
      tag: section.etiqueta ?? '',
      title: section.titulo ?? '',
      subtitle: section.subtitulo ?? '',
    };
  });

  readonly heroScenes = computed<readonly CinematicScene[]>(() => {
    const home = this._home();
    if (home === null) return HOME_HERO_FALLBACK.scenes;

    const section = this.heroSection();
    if (section === null) return [];

    return [...section.escenas]
      .sort((left, right) => left.orden - right.orden)
      .map((scene, index) => ({
        id: `hero-scene-${scene.orden}-${index}`,
        imageUrl: scene.imagenUrl,
      }));
  });

  readonly heroActions = computed<readonly HeroActionViewData[]>(() => {
    const home = this._home();
    if (home === null) return HOME_HERO_FALLBACK.actions;

    const section = this.heroSection();
    if (section === null) return [];

    return [...section.acciones]
      .sort((left, right) => left.orden - right.orden)
      .slice(0, 2)
      .map((action) => ({ label: action.texto, url: action.enlace, order: action.orden }));
  });

  readonly servicesSection = computed(
    () =>
      this._home()?.secciones.find((section) => section.tipo === PublicHomeSectionType.SERVICIOS) ??
      null,
  );

  readonly servicesHeader = computed<HomeServicesHeaderView | null>(() => {
    const home = this._home();
    if (home === null) return HOME_SERVICES_FALLBACK.header;

    const section = this.servicesSection();
    if (section === null) return null;

    return {
      eyebrow: section.etiqueta ?? '',
      title: section.titulo ?? '',
    };
  });

  readonly servicesAction = computed<HomeServiceActionView | null>(() => {
    const home = this._home();
    if (home === null) return HOME_SERVICES_FALLBACK.action;

    const section = this.servicesSection();
    if (section === null) return null;

    const action = [...section.acciones].sort((left, right) => left.orden - right.orden)[0];
    return action ? { label: action.texto, url: action.enlace, order: action.orden } : null;
  });

  readonly services = computed<readonly HomeServiceCardView[]>(() => {
    const home = this._home();
    if (home === null) return HOME_SERVICES_FALLBACK.services;

    return [...home.servicios]
      .sort((left, right) => left.orden - right.orden)
      .map((service) => ({
        id: service.slug,
        slug: service.slug,
        name: service.nombre,
        summary: service.resumen ?? '',
        imageUrl: service.imagenUrl,
        imageAlt: service.imagenAlt,
        linkUrl: LEGACY_HOME_SERVICE_CARD_LINK,
        order: service.orden,
      }));
  });

  readonly showServices = computed(
    () => this.servicesHeader() !== null && this.services().length > 0,
  );

  private readonly useBusinessUnitFallback = computed(
    () => this._home() === null && this._error() !== null,
  );

  readonly businessUnitSection = computed(() => {
    const home = this._home();
    if (home === null) {
      return this.useBusinessUnitFallback() ? HOME_BUSINESS_UNIT_FALLBACK.section : null;
    }

    return (
      home.secciones.find((section) => section.tipo === PublicHomeSectionType.UNIDAD_NEGOCIO) ??
      null
    );
  });

  readonly featuredBusinessUnit = computed(() => {
    const home = this._home();
    if (home === null) {
      return this.useBusinessUnitFallback() ? HOME_BUSINESS_UNIT_FALLBACK.unit : null;
    }

    return home.unidadDestacada;
  });

  private readonly orderedBusinessUnitResources = computed(() =>
    [...(this.featuredBusinessUnit()?.recursos ?? [])].sort(
      (left, right) => left.orden - right.orden,
    ),
  );

  readonly businessUnitBackground = computed(
    () =>
      this.orderedBusinessUnitResources().find(
        (resource) => resource.tipo === PublicBusinessUnitResourceType.IMAGEN_FONDO,
      ) ?? null,
  );

  readonly businessUnitEditorialImages = computed(() =>
    this.orderedBusinessUnitResources()
      .filter((resource) => resource.tipo === PublicBusinessUnitResourceType.IMAGEN_EDITORIAL)
      .slice(0, 3),
  );

  readonly businessUnitCatalogResource = computed(
    () =>
      this.orderedBusinessUnitResources().find(
        (resource) => resource.tipo === PublicBusinessUnitResourceType.CATALOGO,
      ) ?? null,
  );

  readonly businessUnitActions = computed<readonly PublicHomeAction[]>(() =>
    [...(this.businessUnitSection()?.acciones ?? [])].sort(
      (left, right) => left.orden - right.orden,
    ),
  );

  readonly businessUnitWebUrl = computed(() => {
    const slug = this.featuredBusinessUnit()?.slug.trim();
    return slug ? `/${encodeURIComponent(slug)}` : null;
  });

  readonly businessUnitCatalogUrl = computed(() => {
    const unitUrl = this.businessUnitWebUrl();
    return unitUrl ? `${unitUrl}/catalogo` : null;
  });

  readonly businessUnitPrimaryAction = computed<HomeBusinessUnitActionView | null>(() => {
    const url = this.businessUnitWebUrl();
    const action = this.businessUnitActions()[0];
    return url && action ? { label: action.texto, url } : null;
  });

  readonly businessUnitCatalogAction = computed<HomeBusinessUnitActionView | null>(() => {
    const url = this.businessUnitCatalogUrl();
    if (url === null) return null;

    const action = this.businessUnitActions()[1];
    const isDownloadAction = action ? /descargar|pdf/i.test(action.texto) : false;
    return {
      label: action && !isDownloadAction ? action.texto : BUSINESS_UNIT_WEB_CATALOG_LABEL,
      url,
    };
  });

  readonly showBusinessUnit = computed(
    () => this.businessUnitSection() !== null && this.featuredBusinessUnit() !== null,
  );

  load(): void {
    if (this.requestInFlight) return;

    this.requestInFlight = true;
    this._loading.set(true);
    this._error.set(null);

    this.api
      .getHome(PUBLIC_SITE_KEY)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.requestInFlight = false;
          this._loading.set(false);
        }),
      )
      .subscribe({
        next: (home) => this._home.set(home),
        error: () => {
          this._error.set(
            'No pudimos cargar el contenido actualizado. Mostramos temporalmente la versión local.',
          );
        },
      });
  }
}
