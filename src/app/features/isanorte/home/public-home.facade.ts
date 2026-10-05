import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { finalize } from 'rxjs';

import { PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import {
  PublicBusinessUnitResourceType,
  PublicHomeAction,
  PublicHomeResponse,
  PublicHomeSection,
  PublicHomeSectionType,
} from '../../../data/models/public-content/public-home.model';
import { PublicCompanyStatistic } from '../../../data/models/public-content/public-page.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { CinematicScene } from '../../../shared/components/cinematic-tour/cinematic-tour';
import {
  PublicPageSeoDefaults,
  applyPublicPageSeo,
  clearPublicPageSeo,
} from '../../../shared/utils/public-page-seo.util';
import { HOME_HERO_FALLBACK, HeroActionViewData, HeroViewData } from './home-hero-fallback';
import { HOME_PROJECTS_FALLBACK } from './home-projects-fallback';
import { HOME_CTA_FALLBACK } from './home-cta-fallback';
import { HOME_STATISTICS_FALLBACK } from './home-statistics-fallback';
import {
  HomeBusinessUnitActionView,
  HomeCtaActionView,
  HomeCtaCopyView,
  HomeProjectCardView,
  HomeProjectsActionView,
  HomeProjectsHeaderView,
  HomeServiceActionView,
  HomeServiceCardView,
  HomeServicesHeaderView,
} from './home-view.model';

@Injectable()
export class PublicHomeFacade {
  private readonly api = inject(PublicContentApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT, { optional: true });

  private readonly seoDefaults: PublicPageSeoDefaults = {
    title: 'ISANORTE | Construcción e Ingeniería',
    description:
      'Empresa líder en construcción, diseño arquitectónico, ingeniería y desarrollo de proyectos integrales.',
  };

  private readonly _home = signal<PublicHomeResponse | null>(null);
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

  readonly home = this._home.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly seo = computed(() => this._home()?.seo ?? null);

  readonly heroSection = computed(() => this.sectionByType(PublicHomeSectionType.HERO));

  readonly hero = computed<HeroViewData | null>(() => {
    if (this._home() === null) return HOME_HERO_FALLBACK.content;

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
    if (this._home() === null) return HOME_HERO_FALLBACK.scenes;

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

  readonly heroActions = computed<readonly HeroActionViewData[]>(() => {
    if (this._home() === null) return HOME_HERO_FALLBACK.actions;

    return this.orderedActions(this.heroSection()?.acciones ?? [])
      .slice(0, 2)
      .map((action) => ({ label: action.texto, url: action.enlace, order: action.orden }));
  });

  /** La sección se identifica por contrato, nunca por su posición en `secciones`. */
  readonly servicesSection = computed(() => this.sectionByType(PublicHomeSectionType.SERVICIOS));

  readonly servicesHeader = computed<HomeServicesHeaderView | null>(() => {
    const section = this.servicesSection();
    return section ? { eyebrow: section.etiqueta ?? '', title: section.titulo ?? '' } : null;
  });

  /** La primera acción activa ya viene seleccionada por el backend. */
  readonly servicesAction = computed<HomeServiceActionView | null>(() => {
    const action = this.orderedActions(this.servicesSection()?.acciones ?? [])[0];
    return action ? { label: action.texto, url: action.enlace, order: action.orden } : null;
  });

  /**
   * El backend decide qué servicios llegan a Home. Sólo se ordena
   * defensivamente por `orden`; no se refiltra por activo ni destacado.
   */
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
        // La baseline no tiene detalle /servicios/:slug; conserva su enlace sin destino.
        linkUrl: '#',
        order: service.orden,
        benefits: service.beneficios ?? [],
      })),
  );

  /** Una respuesta correcta vacía no activa contenido demo. */
  readonly showServices = computed(
    () => this._home() !== null && this.servicesSection() !== null && this.services().length > 0,
  );

  /** La unidad visual de Home se localiza por tipo, nunca por posición. */
  readonly businessUnitSection = computed(() =>
    this.sectionByType(PublicHomeSectionType.UNIDAD_NEGOCIO),
  );

  readonly businessUnitHeader = computed(() => {
    const section = this.businessUnitSection();
    return section ? { eyebrow: section.etiqueta ?? '', title: section.titulo ?? '' } : null;
  });

  /** La selección de la unidad es responsabilidad exclusiva del backend. */
  readonly featuredBusinessUnit = computed(() => this._home()?.unidadDestacada ?? null);

  readonly businessUnitActions = computed<readonly HomeBusinessUnitActionView[]>(() =>
    this.orderedActions(this.businessUnitSection()?.acciones ?? []).map((action) => ({
      label: action.texto,
      url: action.enlace,
      order: action.orden,
    })),
  );

  /** Conserva el orden recibido entre recursos con el mismo `orden`. */
  private readonly orderedBusinessUnitResources = computed(() =>
    [...(this.featuredBusinessUnit()?.recursos ?? [])].sort(
      (left, right) => left.orden - right.orden,
    ),
  );

  readonly businessUnitBackgroundResource = computed(
    () =>
      this.orderedBusinessUnitResources().find(
        (resource) => resource.tipo === PublicBusinessUnitResourceType.IMAGEN_FONDO,
      ) ?? null,
  );

  readonly businessUnitEditorialResources = computed(() =>
    this.orderedBusinessUnitResources()
      .filter((resource) => resource.tipo === PublicBusinessUnitResourceType.IMAGEN_EDITORIAL)
      .slice(0, 3),
  );

  /** Se deriva para distinguir un PDF/recurso comercial de la UI de catálogo web. */
  readonly businessUnitCatalogResource = computed(
    () =>
      this.orderedBusinessUnitResources().find(
        (resource) => resource.tipo === PublicBusinessUnitResourceType.CATALOGO,
      ) ?? null,
  );

  /** Una respuesta válida sin unidad o sin sección no tiene fallback comercial. */
  readonly showBusinessUnit = computed(
    () =>
      this._home() !== null &&
      this.businessUnitSection() !== null &&
      this.featuredBusinessUnit() !== null,
  );

  readonly projectsSection = computed(() => this.sectionByType(PublicHomeSectionType.PROYECTOS));

  readonly projectsHeader = computed<HomeProjectsHeaderView>(() => {
    const section = this.projectsSection();
    return {
      eyebrow: section?.etiqueta ?? HOME_PROJECTS_FALLBACK.header.eyebrow,
      title: section?.titulo ?? HOME_PROJECTS_FALLBACK.header.title,
    };
  });

  readonly projectsAction = computed<HomeProjectsActionView>(() => {
    const action = this.orderedActions(this.projectsSection()?.acciones ?? [])[0];
    return action
      ? { label: action.texto, url: action.enlace, order: action.orden }
      : HOME_PROJECTS_FALLBACK.action;
  });

  readonly projects = computed<readonly HomeProjectCardView[]>(() => {
    const rawProjects = this._home()?.proyectos;
    if (!rawProjects || rawProjects.length === 0) {
      return HOME_PROJECTS_FALLBACK.projects;
    }
    return [...rawProjects]
      .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre))
      .map((project) => {
        const mainImg = project.imagenes?.find((img) => img.esPrincipal) ?? project.imagenes?.[0];
        const metadata = [project.ubicacion, project.fechaProyecto].filter(Boolean).join(' - ');
        return {
          id: project.slug,
          slug: project.slug,
          name: project.nombre,
          location: project.ubicacion ?? null,
          dateLabel: project.fechaProyecto ?? null,
          metadata: metadata || project.nombre,
          imageUrl: mainImg?.url ?? null,
          imageAlt: mainImg?.alt ?? project.nombre,
          order: project.orden,
        };
      });
  });

  readonly showProjects = computed(() => this.projects().length > 0);

  readonly ctaSection = computed(() => this.sectionByType(PublicHomeSectionType.CTA));

  readonly ctaAction = computed<HomeCtaActionView>(() => {
    const action = this.orderedActions(this.ctaSection()?.acciones ?? [])[0];
    return action
      ? {
          label: action.texto,
          url: action.enlace,
          persistedUrl: action.enlace,
          order: action.orden,
        }
      : HOME_CTA_FALLBACK.action;
  });

  readonly cta = computed(() => {
    const section = this.ctaSection();
    if (!section && this._home() === null) {
      return HOME_CTA_FALLBACK;
    }
    return {
      copy: {
        title: section?.titulo || HOME_CTA_FALLBACK.copy.title,
        description: section?.subtitulo || section?.contenido || HOME_CTA_FALLBACK.copy.description,
      },
      action: this.ctaAction(),
      bgImageUrl: section?.imagenUrl || HOME_CTA_FALLBACK.bgImageUrl,
    };
  });

  readonly companySection = computed(() => this.sectionByType(PublicHomeSectionType.EMPRESA));

  readonly statistics = computed<readonly PublicCompanyStatistic[]>(() => {
    return HOME_STATISTICS_FALLBACK;
  });

  readonly showStatistics = computed(() => this.statistics().length > 0);

  load(): void {
    if (this.destroyed || this.requestInFlight) return;

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
        next: (home) => {
          if (this.destroyed) return;
          this._home.set(home);
          applyPublicPageSeo(this.title, this.meta, home, this.seoDefaults, this.document);
        },
        error: () => {
          if (this.destroyed) return;
          this._home.set(null);
          this._error.set(
            'No pudimos cargar el contenido actualizado. Mostramos temporalmente la versión local.',
          );
          applyPublicPageSeo(this.title, this.meta, null, this.seoDefaults, this.document);
        },
      });
  }

  private sectionByType(type: PublicHomeSectionType): PublicHomeSection | null {
    return this._home()?.secciones.find((section) => section.tipo === type) ?? null;
  }

  private orderedActions(actions: readonly PublicHomeAction[]): PublicHomeAction[] {
    return [...actions].sort(
      (left, right) =>
        left.orden - right.orden ||
        left.texto.localeCompare(right.texto) ||
        left.enlace.localeCompare(right.enlace),
    );
  }
}
