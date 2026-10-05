import { EnvironmentInjector, createEnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { Observable, Subject, throwError } from 'rxjs';

import { SeoRobots } from '../../../data/models/content/page-seo.model';
import {
  PublicPageResponse,
  PublicPageType,
  PublicProject,
} from '../../../data/models/public-content/public-page.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { ALL_PROJECTS_FILTER, PublicProjectsFacade } from './public-projects.facade';

const projects: PublicProject[] = [
  {
    nombre: 'Segundo API',
    slug: 'segundo-api',
    descripcion: null,
    ubicacion: null,
    fechaProyecto: null,
    orden: 2,
    imagenes: [{ url: '/second.jpg', alt: null, esPrincipal: false, orden: 1 }],
    servicios: [{ nombre: 'Construcción API', slug: 'construccion-api' }],
  },
  {
    nombre: 'Cero API',
    slug: 'cero-api',
    descripcion: 'Descripción API',
    ubicacion: 'Ubicación API',
    fechaProyecto: '2026',
    orden: 0,
    imagenes: [
      { url: '/secondary.jpg', alt: null, esPrincipal: false, orden: 0 },
      { url: '/principal.jpg', alt: 'Portada API', esPrincipal: true, orden: 1 },
    ],
    servicios: [
      { nombre: 'Construcción API', slug: 'construccion-api' },
      { nombre: 'Decoración API', slug: 'decoracion-api' },
    ],
  },
  {
    nombre: 'Sin servicio API',
    slug: 'sin-servicio-api',
    descripcion: null,
    ubicacion: null,
    fechaProyecto: null,
    orden: 1,
    imagenes: [],
    servicios: [],
  },
];

const response: PublicPageResponse = {
  contenido: {
    pagina: PublicPageType.PROYECTOS,
    eyebrow: 'EYEBROW API',
    titulo: 'Título API',
    introduccion: null,
    descripcion: null,
    imagenUrl: null,
    imagenAlt: null,
    imagenFondoUrl: null,
    tags: [],
  },
  seo: null,
  empresa: null,
  servicios: null,
  proyectos: projects,
};

class PublicContentApiStub {
  response$: Observable<PublicPageResponse> = new Subject<PublicPageResponse>();
  calls: Array<{ siteKey: string; page: PublicPageType }> = [];

  getPage(siteKey: string, page: PublicPageType): Observable<PublicPageResponse> {
    this.calls.push({ siteKey, page });
    return this.response$;
  }
}

describe('PublicProjectsFacade', () => {
  let facade: PublicProjectsFacade;
  let api: PublicContentApiStub;
  let titleService: Title;
  let metaService: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PublicProjectsFacade,
        PublicContentApiStub,
        { provide: PublicContentApiService, useExisting: PublicContentApiStub },
      ],
    });
    facade = TestBed.inject(PublicProjectsFacade);
    api = TestBed.inject(PublicContentApiStub);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
  });

  it('loads PROYECTOS once from the centralized site key and exposes loading', () => {
    facade.load();
    facade.load();

    expect(api.calls).toEqual([{ siteKey: 'isanorte', page: PublicPageType.PROYECTOS }]);
    expect(facade.loading()).toBe(true);
  });

  it('orders projects, selects a principal cover and derives deduplicated real-service filters', () => {
    const subject = new Subject<PublicPageResponse>();
    api.response$ = subject;
    facade.load();
    subject.next(response);
    subject.complete();

    expect(facade.projects().map((project) => project.slug)).toEqual([
      'cero-api',
      'sin-servicio-api',
      'segundo-api',
    ]);
    expect(facade.projects()[0].orden).toBe(0);
    expect(facade.coverFor(facade.projects()[0])?.url).toBe('/principal.jpg');
    expect(facade.coverFor(facade.projects()[2])?.url).toBe('/second.jpg');
    expect(facade.coverFor(facade.projects()[1])).toBeNull();
    expect(facade.filters()).toEqual([
      { slug: ALL_PROJECTS_FILTER, nombre: 'Todos' },
      { slug: 'construccion-api', nombre: 'Construcción API' },
      { slug: 'decoracion-api', nombre: 'Decoración API' },
    ]);
  });

  it('filters client-side by every real association while retaining projects without services in Todos', () => {
    const subject = new Subject<PublicPageResponse>();
    api.response$ = subject;
    facade.load();
    subject.next(response);
    subject.complete();

    facade.selectFilter('decoracion-api');
    expect(facade.activeFilter()).toBe('decoracion-api');
    expect(facade.filteredProjects().map((project) => project.slug)).toEqual(['cero-api']);

    facade.selectFilter(ALL_PROJECTS_FILTER);
    expect(facade.filteredProjects().map((project) => project.slug)).toEqual([
      'cero-api',
      'sin-servicio-api',
      'segundo-api',
    ]);
    facade.selectFilter('categoria-demo');
    expect(facade.activeFilter()).toBe(ALL_PROJECTS_FILTER);
  });

  it('treats null and empty catalogues as valid success without content fallback or empty filters', () => {
    const subject = new Subject<PublicPageResponse>();
    api.response$ = subject;
    facade.load();
    subject.next({ ...response, proyectos: null });
    subject.complete();

    expect(facade.content()?.titulo).toBe('Título API');
    expect(facade.projects()).toEqual([]);
    expect(facade.filters()).toEqual([{ slug: ALL_PROJECTS_FILTER, nombre: 'Todos' }]);
    expect(facade.showFilters()).toBe(false);
    expect(facade.showProjects()).toBe(false);
  });

  it('exposes a neutral error without a projects baseline', () => {
    api.response$ = throwError(() => new Error('offline'));
    facade.load();

    expect(facade.loading()).toBe(false);
    expect(facade.error()).toContain('No pudimos cargar');
    expect(facade.content()).toBeNull();
    expect(facade.projects()).toEqual([]);
  });

  it('applies dynamic SEO from backend on load', () => {
    const subject = new Subject<PublicPageResponse>();
    api.response$ = subject;
    facade.load();
    subject.next({
      ...response,
      seo: {
        title: 'Portafolio de Obras | ISANORTE',
        description: 'Proyectos arquitectónicos y civiles.',
        ogImageUrl: 'https://cdn.isanorte.com/proyectos.jpg',
        robots: SeoRobots.INDEX_FOLLOW,
      },
    });

    expect(titleService.getTitle()).toBe('Portafolio de Obras | ISANORTE');
    expect(metaService.getTag('name="description"')?.content).toBe('Proyectos arquitectónicos y civiles.');
    expect(metaService.getTag('name="robots"')?.content).toBe('index, follow');
    expect(metaService.getTag('property="og:title"')?.content).toBe('Portafolio de Obras | ISANORTE');
    expect(metaService.getTag('property="og:image"')?.content).toBe('https://cdn.isanorte.com/proyectos.jpg');
  });

  it('applies default SEO for Proyectos on error', () => {
    api.response$ = throwError(() => new Error('offline'));
    facade.load();

    expect(titleService.getTitle()).toBe('Proyectos | ISANORTE');
    expect(metaService.getTag('name="description"')?.content).toContain('Explora nuestro portafolio de proyectos');
    expect(metaService.getTag('name="robots"')?.content).toBe('index, follow');
  });

  it('cleans up SEO tags and restores baseline title when destroyed', () => {
    const parentInjector = TestBed.inject(EnvironmentInjector);
    const childInjector = createEnvironmentInjector([PublicProjectsFacade], parentInjector);
    const scopedFacade = childInjector.get(PublicProjectsFacade);

    const subject = new Subject<PublicPageResponse>();
    api.response$ = subject;
    scopedFacade.load();
    subject.next({
      ...response,
      seo: {
        title: 'Proyectos de Infraestructura',
        description: 'Construcción civil.',
        ogImageUrl: 'https://cdn.isanorte.com/infra.jpg',
        robots: SeoRobots.INDEX_FOLLOW,
      },
    });

    expect(titleService.getTitle()).toBe('Proyectos de Infraestructura');

    childInjector.destroy();

    expect(titleService.getTitle()).toBe('ISANORTE');
    expect(metaService.getTag('property="og:title"')).toBeNull();
    expect(metaService.getTag('property="og:image"')).toBeNull();
    expect(metaService.getTag('name="robots"')).toBeNull();
  });
});

