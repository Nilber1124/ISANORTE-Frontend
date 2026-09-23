import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { finalize } from 'rxjs';

import { PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import {
  PublicPageResponse,
  PublicPageType,
  PublicProject,
  PublicProjectImage,
} from '../../../data/models/public-content/public-page.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import {
  PublicPageSeoDefaults,
  applyPublicPageSeo,
  clearPublicPageSeo,
} from '../../../shared/utils/public-page-seo.util';

export const ALL_PROJECTS_FILTER = 'all';

export interface PublicProjectFilter {
  slug: string;
  nombre: string;
}

@Injectable()
export class PublicProjectsFacade {
  private readonly api = inject(PublicContentApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT, { optional: true });

  private readonly seoDefaults: PublicPageSeoDefaults = {
    title: 'Proyectos | ISANORTE',
    description:
      'Explora nuestro portafolio de proyectos y obras de construcción y edificación ejecutadas por ISANORTE.',
  };

  private readonly _page = signal<PublicPageResponse | null>(null);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);
  private readonly _activeFilter = signal(ALL_PROJECTS_FILTER);
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
  readonly activeFilter = this._activeFilter.asReadonly();
  readonly content = computed(() => this.page()?.contenido ?? null);
  readonly seo = computed(() => this.page()?.seo ?? null);
  readonly projects = computed<readonly PublicProject[]>(() => this.stableOrder(this.page()?.proyectos ?? []));
  readonly filters = computed<readonly PublicProjectFilter[]>(() => {
    const unique = new Map<string, PublicProjectFilter>();
    for (const project of this.projects()) {
      for (const service of project.servicios ?? []) {
        if (!unique.has(service.slug)) unique.set(service.slug, { slug: service.slug, nombre: service.nombre });
      }
    }
    return [{ slug: ALL_PROJECTS_FILTER, nombre: 'Todos' }, ...unique.values()];
  });
  readonly filteredProjects = computed<readonly PublicProject[]>(() => {
    const activeFilter = this.activeFilter();
    if (activeFilter === ALL_PROJECTS_FILTER) return this.projects();
    return this.projects().filter((project) =>
      (project.servicios ?? []).some((service) => service.slug === activeFilter),
    );
  });
  readonly featuredProjects = computed(() => this.filteredProjects().slice(0, 2));
  readonly secondaryProjects = computed(() => this.filteredProjects().slice(2));
  readonly showFilters = computed(() => this.filters().length > 1);
  readonly showProjects = computed(() => this.projects().length > 0);

  load(): void {
    if (this.destroyed || this.requestInFlight) return;

    this.requestInFlight = true;
    this._loading.set(true);
    this._error.set(null);
    this._activeFilter.set(ALL_PROJECTS_FILTER);

    this.api
      .getPage(PUBLIC_SITE_KEY, PublicPageType.PROYECTOS)
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
          this._error.set('No pudimos cargar los proyectos.');
          applyPublicPageSeo(this.title, this.meta, null, this.seoDefaults, this.document);
        },
      });
  }

  selectFilter(slug: string): void {
    if (this.filters().some((filter) => filter.slug === slug)) this._activeFilter.set(slug);
  }

  coverFor(project: PublicProject): PublicProjectImage | null {
    const images = this.stableOrder(project.imagenes ?? []);
    return images.find((image) => image.esPrincipal) ?? images[0] ?? null;
  }

  private stableOrder<T extends { orden: number }>(values: readonly T[]): T[] {
    return values
      .map((value, sourceIndex) => ({ value, sourceIndex }))
      .sort((left, right) => left.value.orden - right.value.orden || left.sourceIndex - right.sourceIndex)
      .map(({ value }) => value);
  }
}
