import { NgClass, NgTemplateOutlet } from '@angular/common';
import { Component, computed, input, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import {
  PublicPageContent,
  PublicPageType,
  PublicProject,
  PublicProjectImage,
} from '../../../data/models/public-content/public-page.model';
import { Alert } from '../../../shared/components/alert/alert';
import {
  ALL_PROJECTS_FILTER,
  PublicProjectFilter,
  PublicProjectsFacade,
} from './public-projects.facade';
import { Projects } from './projects';

@Component({ selector: 'app-card', template: '<ng-content />' })
class CardStub {
  readonly padding = input('medium');
}

class PublicProjectsFacadeStub {
  readonly content = signal<PublicPageContent | null>({
    pagina: PublicPageType.PROYECTOS,
    eyebrow: 'EYEBROW API',
    titulo: 'Título API',
    introduccion: null,
    descripcion: null,
    imagenUrl: null,
    imagenAlt: null,
    imagenFondoUrl: null,
    tags: [],
  });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly activeFilter = signal(ALL_PROJECTS_FILTER);
  readonly projects = signal<readonly PublicProject[]>([
    {
      nombre: 'Proyecto API',
      slug: 'proyecto-api',
      descripcion: 'Descripción API',
      ubicacion: 'Ubicación API',
      fechaProyecto: '2026',
      orden: 0,
      imagenes: [
        { url: '/secondary.jpg', alt: null, esPrincipal: false, orden: 0 },
        { url: '/cover.jpg', alt: 'Alt API', esPrincipal: true, orden: 1 },
      ],
      servicios: [
        { nombre: 'Construcción API', slug: 'construccion-api' },
        { nombre: 'Decoración API', slug: 'decoracion-api' },
      ],
    },
    {
      nombre: 'Proyecto sin servicio',
      slug: 'sin-servicio',
      descripcion: null,
      ubicacion: null,
      fechaProyecto: null,
      orden: 1,
      imagenes: [],
      servicios: [],
    },
  ]);
  readonly filters = signal<readonly PublicProjectFilter[]>([
    { slug: ALL_PROJECTS_FILTER, nombre: 'Todos' },
    { slug: 'construccion-api', nombre: 'Construcción API' },
    { slug: 'decoracion-api', nombre: 'Decoración API' },
  ]);
  readonly filteredProjects = computed(() =>
    this.activeFilter() === ALL_PROJECTS_FILTER
      ? this.projects()
      : this.projects().filter((project) => project.servicios.some((service) => service.slug === this.activeFilter())),
  );
  readonly featuredProjects = computed(() => this.filteredProjects().slice(0, 2));
  readonly secondaryProjects = computed(() => this.filteredProjects().slice(2));
  readonly showFilters = computed(() => this.filters().length > 1);
  readonly showProjects = computed(() => this.projects().length > 0);

  load(): void {}

  selectFilter(slug: string): void {
    this.activeFilter.set(slug);
  }

  coverFor(project: PublicProject): PublicProjectImage | null {
    return project.imagenes.find((image) => image.esPrincipal) ?? project.imagenes[0] ?? null;
  }
}

describe('Projects', () => {
  let facade: PublicProjectsFacadeStub;

  beforeEach(async () => {
    facade = new PublicProjectsFacadeStub();
    await TestBed.configureTestingModule({ imports: [Projects] })
      .overrideComponent(Projects, {
        set: {
          imports: [NgClass, NgTemplateOutlet, Alert, CardStub],
          providers: [{ provide: PublicProjectsFacade, useValue: facade }],
        },
      })
      .compileComponents();
  });

  it('renders backend projects, real filters and metadata without a card route', () => {
    const fixture = TestBed.createComponent(Projects);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const card = element.querySelector('[data-project-slug="proyecto-api"]') as HTMLElement;

    expect(element.querySelector('h1')?.textContent).toContain('Título API');
    expect(element.querySelector('[data-project-filters]')?.textContent).toContain('Todos');
    expect(element.querySelector('[data-project-filters]')?.textContent).toContain('Construcción API');
    expect(card.textContent).toContain('Descripción API');
    expect(card.textContent).toContain('Ubicación API');
    expect(card.textContent).toContain('2026');
    expect(card.querySelector('img')?.getAttribute('src')).toBe('/cover.jpg');
    expect(card.querySelector('img')?.getAttribute('alt')).toBe('Alt API');
    expect(card.querySelector('a')).toBeNull();
  });

  it('filters a multi-service project client-side and keeps a project without services in Todos', () => {
    const fixture = TestBed.createComponent(Projects);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    const buttons = [...element.querySelectorAll<HTMLButtonElement>('[data-project-filters] button')];
    buttons.find((button) => button.textContent?.includes('Decoración API'))?.click();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelectorAll('[data-project-slug]').length).toBe(1);
    expect(fixture.nativeElement.querySelector('[data-project-slug="proyecto-api"]')).toBeTruthy();

    buttons.find((button) => button.textContent?.includes('Todos'))?.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('[data-project-slug]').length).toBe(2);
  });

  it('hides catalogue and filters for a valid empty success without restoring static projects', () => {
    facade.projects.set([]);
    facade.filters.set([{ slug: ALL_PROJECTS_FILTER, nombre: 'Todos' }]);
    const fixture = TestBed.createComponent(Projects);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('h1')?.textContent).toContain('Título API');
    expect(fixture.nativeElement.querySelector('[data-projects-list]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[data-project-filters]')).toBeNull();
  });

  it('renders neutral loading and error states without commercial baseline', () => {
    facade.loading.set(true);
    const fixture = TestBed.createComponent(Projects);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-projects-loading]')).toBeTruthy();

    facade.loading.set(false);
    facade.error.set('Error API');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-projects-error]')?.textContent).toContain('Error API');
    expect(fixture.nativeElement.querySelector('[data-projects-list]')).toBeNull();
  });
});
