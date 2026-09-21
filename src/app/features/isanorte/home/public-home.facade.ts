import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import {
  PublicBusinessUnitResourceType,
  PublicHomeAction,
  PublicHomeResponse,
  PublicHomeSection,
  PublicHomeSectionType,
} from '../../../data/models/public-content/public-home.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { CinematicScene } from '../../../shared/components/cinematic-tour/cinematic-tour';
import {
  HeroActionViewData,
  HeroViewData,
  HomeBusinessUnitActionView,
  HomeCtaActionView,
  HomeCtaCopyView,
  HomeProjectCardView,
  HomeProjectsActionView,
  HomeProjectsHeaderView,
  HomeServiceActionView,
  HomeServiceCardView,
  HomeServicesHeaderView,
  PUBLIC_PROJECTS_PATH,
  PUBLIC_SERVICES_PATH,
} from './home-view.model';

const SUPPORTED_HOME_SECTION_TYPES = new Set<PublicHomeSectionType>([
  PublicHomeSectionType.HERO,
  PublicHomeSectionType.SERVICIOS,
  PublicHomeSectionType.UNIDAD_NEGOCIO,
  PublicHomeSectionType.PROYECTOS,
  PublicHomeSectionType.CTA,
]);

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

  /**
   * Renderer cerrado de Home: ignora tipos legacy, ordena defensivamente y
   * conserva una sola sección por tipo. El contrato público no expone el ID,
   * por lo que la firma de contenido es el último desempate determinista.
   */
  readonly orderedSections = computed<readonly PublicHomeSection[]>(() => {
    const sections = this._home()?.secciones ?? [];
    const seenTypes = new Set<PublicHomeSectionType>();

    return [...sections]
      .filter((section) => SUPPORTED_HOME_SECTION_TYPES.has(section.tipo))
      .sort(
        (left, right) =>
          left.orden - right.orden ||
          left.tipo.localeCompare(right.tipo) ||
          this.sectionContentKey(left).localeCompare(this.sectionContentKey(right)),
      )
      .filter((section) => {
        if (seenTypes.has(section.tipo)) return false;
        seenTypes.add(section.tipo);
        return true;
      });
  });

  readonly heroSection = computed(() => this.sectionByType(PublicHomeSectionType.HERO));

  readonly hero = computed<HeroViewData | null>(() => {
    const section = this.heroSection();
    return section
      ? {
          tag: section.etiqueta ?? '',
          title: section.titulo ?? '',
          subtitle: section.subtitulo ?? '',
        }
      : null;
  });

  readonly heroScenes = computed<readonly CinematicScene[]>(() => {
    const section = this.heroSection();
    if (section === null) return [];

    return [...section.escenas]
      .sort(
        (left, right) => left.orden - right.orden || left.imagenUrl.localeCompare(right.imagenUrl),
      )
      .map((scene, index) => ({
        id: `hero-scene-${scene.orden}-${index}`,
        imageUrl: scene.imagenUrl,
      }));
  });

  readonly heroActions = computed<readonly HeroActionViewData[]>(() =>
    this.orderedActions(this.heroSection()?.acciones ?? [])
      .slice(0, 2)
      .map((action) => ({ label: action.texto, url: action.enlace, order: action.orden })),
  );

  readonly servicesSection = computed(() => this.sectionByType(PublicHomeSectionType.SERVICIOS));

  readonly servicesHeader = computed<HomeServicesHeaderView | null>(() => {
    const section = this.servicesSection();
    return section ? { eyebrow: section.etiqueta ?? '', title: section.titulo ?? '' } : null;
  });

  readonly servicesAction = computed<HomeServiceActionView | null>(() => {
    const action = this.orderedActions(this.servicesSection()?.acciones ?? [])[0];
    return action ? { label: action.texto, url: action.enlace, order: action.orden } : null;
  });

  readonly services = computed<readonly HomeServiceCardView[]>(() =>
    [...(this._home()?.servicios ?? [])]
      .sort((left, right) => left.orden - right.orden || left.slug.localeCompare(right.slug))
      .map((service) => ({
        id: service.slug,
        slug: service.slug,
        name: service.nombre,
        summary: service.resumen ?? '',
        imageUrl: service.imagenUrl,
        imageAlt: service.imagenAlt,
        linkUrl: PUBLIC_SERVICES_PATH,
        order: service.orden,
      })),
  );

  readonly showServices = computed(
    () => this.servicesSection() !== null && this.services().length > 0,
  );

  readonly businessUnitSection = computed(() =>
    this.sectionByType(PublicHomeSectionType.UNIDAD_NEGOCIO),
  );

  readonly featuredBusinessUnit = computed(() => this._home()?.unidadDestacada ?? null);

  private readonly orderedBusinessUnitResources = computed(() =>
    [...(this.featuredBusinessUnit()?.recursos ?? [])].sort(
      (left, right) =>
        left.orden - right.orden ||
        left.tipo.localeCompare(right.tipo) ||
        left.url.localeCompare(right.url),
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
    this.orderedActions(this.businessUnitSection()?.acciones ?? []),
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
    const action = this.businessUnitActions()[1];
    return url && action ? { label: action.texto, url } : null;
  });

  readonly showBusinessUnit = computed(
    () => this.businessUnitSection() !== null && this.featuredBusinessUnit() !== null,
  );

  readonly projectsSection = computed(() => this.sectionByType(PublicHomeSectionType.PROYECTOS));

  readonly projectsHeader = computed<HomeProjectsHeaderView | null>(() => {
    const section = this.projectsSection();
    return section ? { eyebrow: section.etiqueta ?? '', title: section.titulo ?? '' } : null;
  });

  readonly projectsAction = computed<HomeProjectsActionView | null>(() => {
    const action = this.orderedActions(this.projectsSection()?.acciones ?? [])[0];
    return action ? { label: action.texto, url: PUBLIC_PROJECTS_PATH, order: action.orden } : null;
  });

  readonly projects = computed<readonly HomeProjectCardView[]>(() =>
    [...(this._home()?.proyectos ?? [])]
      .sort((left, right) => left.orden - right.orden || left.slug.localeCompare(right.slug))
      .map((project) => {
        const images = [...project.imagenes].sort(
          (left, right) => left.orden - right.orden || left.url.localeCompare(right.url),
        );
        const image = images.find((candidate) => candidate.esPrincipal) ?? images[0] ?? null;
        const location = this.optionalText(project.ubicacion);
        const dateLabel = this.projectDateLabel(project.fechaProyecto);

        return {
          id: project.slug,
          slug: project.slug,
          name: project.nombre,
          location,
          dateLabel,
          metadata: [location, dateLabel]
            .filter((value): value is string => value !== null)
            .join(' - '),
          imageUrl: image?.url ?? null,
          imageAlt: image?.alt ?? null,
          order: project.orden,
        };
      }),
  );

  readonly showProjects = computed(
    () => this.projectsSection() !== null && this.projects().length > 0,
  );

  readonly ctaSection = computed(() => this.sectionByType(PublicHomeSectionType.CTA));

  readonly ctaCopy = computed<HomeCtaCopyView | null>(() => {
    const section = this.ctaSection();
    return section
      ? {
          title: section.titulo ?? '',
          // La jerarquía visual migrada corresponde la descripción con `contenido`.
          description: section.contenido ?? '',
        }
      : null;
  });

  readonly ctaBackground = computed(() => this.ctaSection()?.imagenUrl ?? null);

  readonly ctaAction = computed<HomeCtaActionView | null>(() => {
    const action = this.orderedActions(this.ctaSection()?.acciones ?? [])[0];
    if (!action) return null;

    return {
      label: action.texto,
      persistedUrl: action.enlace,
      url: this.resolveCtaUrl(action.enlace),
      order: action.orden,
    };
  });

  readonly showCta = computed(() => this.ctaSection() !== null);

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
          this._home.set(null);
          this._error.set('No pudimos cargar el contenido de la página de inicio.');
        },
      });
  }

  private sectionByType(type: PublicHomeSectionType): PublicHomeSection | null {
    return this.orderedSections().find((section) => section.tipo === type) ?? null;
  }

  private orderedActions(actions: readonly PublicHomeAction[]): PublicHomeAction[] {
    return [...actions].sort(
      (left, right) =>
        left.orden - right.orden ||
        left.texto.localeCompare(right.texto) ||
        left.enlace.localeCompare(right.enlace),
    );
  }

  private sectionContentKey(section: PublicHomeSection): string {
    return [
      section.etiqueta,
      section.titulo,
      section.subtitulo,
      section.contenido,
      section.imagenUrl,
      section.imagenAlt,
      section.textoBoton,
      section.enlaceBoton,
      JSON.stringify(
        [...section.escenas].sort(
          (left, right) =>
            left.orden - right.orden ||
            left.imagenUrl.localeCompare(right.imagenUrl) ||
            (left.alt ?? '').localeCompare(right.alt ?? ''),
        ),
      ),
      JSON.stringify(this.orderedActions(section.acciones)),
    ]
      .map((value) => value ?? '')
      .join('\u0000');
  }

  private optionalText(value: string | null): string | null {
    const normalized = value?.trim();
    return normalized ? normalized : null;
  }

  private projectDateLabel(value: string | null): string | null {
    const normalized = this.optionalText(value);
    if (normalized === null) return null;

    const isoDate = /^(\d{4})-\d{2}-\d{2}(?:T.*)?$/.exec(normalized);
    return isoDate?.[1] ?? normalized;
  }

  private resolveCtaUrl(url: string): string {
    return url.trim().toLowerCase() === '#contacto' ? '/contacto' : url;
  }
}
