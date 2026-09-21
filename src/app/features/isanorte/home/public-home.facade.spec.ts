import { TestBed } from '@angular/core/testing';
import { Observable, Subject, throwError } from 'rxjs';

import {
  PublicBusinessUnitResourceType,
  PublicHomeResponse,
  PublicHomeSection,
  PublicHomeSectionType,
} from '../../../data/models/public-content/public-home.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { PublicHomeFacade } from './public-home.facade';

const heroSection: PublicHomeSection = {
  tipo: PublicHomeSectionType.HERO,
  etiqueta: 'EYEBROW API',
  titulo: 'Título API',
  subtitulo: 'Subtítulo API',
  contenido: null,
  imagenUrl: null,
  imagenAlt: null,
  textoBoton: null,
  enlaceBoton: null,
  orden: 0,
  escenas: [
    { imagenUrl: '/second.jpg', alt: 'Segunda', orden: 2 },
    { imagenUrl: '/first.jpg', alt: null, orden: 0 },
  ],
  acciones: [
    { texto: 'Tercera ignorada', enlace: '/tercera', orden: 3 },
    { texto: 'Secundaria', enlace: '/secundaria', orden: 2 },
    { texto: 'Primaria', enlace: '/primaria', orden: 0 },
  ],
};

const servicesSection: PublicHomeSection = {
  tipo: PublicHomeSectionType.SERVICIOS,
  etiqueta: 'SERVICIOS API',
  titulo: 'Ingeniería desde API',
  subtitulo: null,
  contenido: null,
  imagenUrl: null,
  imagenAlt: null,
  textoBoton: null,
  enlaceBoton: null,
  orden: 1,
  escenas: [],
  acciones: [{ texto: 'Ver servicios API', enlace: '#', orden: 0 }],
};

const businessUnitSection: PublicHomeSection = {
  tipo: PublicHomeSectionType.UNIDAD_NEGOCIO,
  etiqueta: 'UNIDAD DESTACADA API',
  titulo: 'Copy que no sustituye el nombre',
  subtitulo: null,
  contenido: null,
  imagenUrl: null,
  imagenAlt: null,
  textoBoton: null,
  enlaceBoton: null,
  orden: 9,
  escenas: [],
  acciones: [
    { texto: 'Descargar catálogo PDF', enlace: '#catalogo', orden: 2 },
    { texto: 'Conoce la unidad', enlace: '#unidad', orden: 0 },
  ],
};

const projectsSection: PublicHomeSection = {
  tipo: PublicHomeSectionType.PROYECTOS,
  etiqueta: 'PROYECTOS API',
  titulo: 'Obras desde API',
  subtitulo: null,
  contenido: null,
  imagenUrl: null,
  imagenAlt: null,
  textoBoton: null,
  enlaceBoton: null,
  orden: 3,
  escenas: [],
  acciones: [
    { texto: 'Accion posterior', enlace: '/ignorada', orden: 5 },
    { texto: 'Ver todos desde API', enlace: '#', orden: 0 },
  ],
};

const ctaSection: PublicHomeSection = {
  tipo: PublicHomeSectionType.CTA,
  etiqueta: null,
  titulo: 'CTA desde API',
  subtitulo: 'Subtítulo que no corresponde al diseño actual',
  contenido: 'Descripción CTA desde API',
  imagenUrl: '/cta-api.jpg',
  imagenAlt: 'Alt no usado porque el fondo es decorativo',
  textoBoton: null,
  enlaceBoton: null,
  orden: 4,
  escenas: [],
  acciones: [
    { texto: 'Acción posterior', enlace: '/posterior', orden: 5 },
    { texto: 'Contactar API', enlace: '#contacto', orden: 0 },
  ],
};

const homeResponse: PublicHomeResponse = {
  secciones: [projectsSection, ctaSection, servicesSection, heroSection, businessUnitSection],
  servicios: [
    {
      nombre: 'Servicio dos',
      slug: 'servicio-dos',
      resumen: 'Resumen dos',
      descripcion: 'Descripción dos',
      icono: null,
      imagenUrl: '/dos.jpg',
      imagenAlt: 'Alt dos',
      etiqueta: null,
      orden: 2,
      beneficios: [],
    },
    {
      nombre: 'Servicio cero',
      slug: 'servicio-cero',
      resumen: 'Resumen cero',
      descripcion: 'Descripción cero',
      icono: null,
      imagenUrl: '/cero.jpg',
      imagenAlt: null,
      etiqueta: null,
      orden: 0,
      beneficios: [],
    },
  ],
  proyectos: [
    {
      nombre: 'Proyecto dos',
      slug: 'proyecto-dos',
      ubicacion: null,
      fechaProyecto: 'Proyecto 2023',
      descripcion: 'Descripcion dos',
      orden: 2,
      imagenes: [{ url: '/dos.jpg', alt: null, esPrincipal: false, orden: 0 }],
    },
    {
      nombre: 'Proyecto cero',
      slug: 'proyecto-cero',
      ubicacion: 'Quito',
      fechaProyecto: '2026-05-10',
      descripcion: 'Descripcion cero',
      orden: 0,
      imagenes: [
        { url: '/fallback-image.jpg', alt: 'Fallback', esPrincipal: false, orden: 0 },
        { url: '/principal-late.jpg', alt: 'Principal tardia', esPrincipal: true, orden: 3 },
        { url: '/principal.jpg', alt: 'Principal', esPrincipal: true, orden: 1 },
      ],
    },
  ],
  unidadDestacada: {
    nombre: 'Unidad Demo',
    slug: 'unidad-demo',
    descripcion: 'Descripción de la unidad',
    icono: null,
    imagenUrl: '/principal-no-usada.jpg',
    imagenAlt: 'Imagen principal',
    orden: 0,
    recursos: [
      {
        tipo: PublicBusinessUnitResourceType.IMAGEN_EDITORIAL,
        url: '/editorial-3.jpg',
        alt: 'Editorial tres',
        etiqueta: null,
        orden: 3,
      },
      {
        tipo: PublicBusinessUnitResourceType.CATALOGO,
        url: '/catalogo.pdf',
        alt: null,
        etiqueta: 'Ficha PDF',
        orden: 4,
      },
      {
        tipo: PublicBusinessUnitResourceType.IMAGEN_EDITORIAL,
        url: '/editorial-1.jpg',
        alt: 'Editorial uno',
        etiqueta: null,
        orden: 1,
      },
      {
        tipo: PublicBusinessUnitResourceType.IMAGEN_FONDO,
        url: '/fondo.jpg',
        alt: null,
        etiqueta: null,
        orden: 0,
      },
      {
        tipo: PublicBusinessUnitResourceType.IMAGEN_EDITORIAL,
        url: '/editorial-2.jpg',
        alt: null,
        etiqueta: null,
        orden: 2,
      },
      {
        tipo: PublicBusinessUnitResourceType.IMAGEN_EDITORIAL,
        url: '/editorial-extra.jpg',
        alt: 'No entra en los slots',
        etiqueta: null,
        orden: 5,
      },
    ],
  },
};

class PublicContentApiStub {
  response$: Observable<PublicHomeResponse> = new Subject<PublicHomeResponse>();
  siteKeys: string[] = [];

  getHome(siteKey: string): Observable<PublicHomeResponse> {
    this.siteKeys.push(siteKey);
    return this.response$;
  }
}

describe('PublicHomeFacade', () => {
  let facade: PublicHomeFacade;
  let api: PublicContentApiStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PublicHomeFacade,
        PublicContentApiStub,
        { provide: PublicContentApiService, useExisting: PublicContentApiStub },
      ],
    });
    facade = TestBed.inject(PublicHomeFacade);
    api = TestBed.inject(PublicContentApiStub);
  });

  it('loads the centralized site key and exposes loading state', () => {
    facade.load();
    expect(api.siteKeys).toEqual(['isanorte']);
    expect(facade.loading()).toBe(true);
  });

  it('stores success and derives Hero by type rather than position', () => {
    const response = new Subject<PublicHomeResponse>();
    api.response$ = response;
    facade.load();
    response.next(homeResponse);
    response.complete();

    expect(facade.loading()).toBe(false);
    expect(facade.error()).toBeNull();
    expect(facade.home()).toEqual(homeResponse);
    expect(facade.hero()?.title).toBe('Título API');
    expect(facade.heroScenes().map((scene) => scene.imageUrl)).toEqual([
      '/first.jpg',
      '/second.jpg',
    ]);
    expect(facade.heroActions().map((action) => action.label)).toEqual(['Primaria', 'Secundaria']);
  });

  it('does not invent a Hero when a successful response omits it', () => {
    const response = new Subject<PublicHomeResponse>();
    api.response$ = response;
    facade.load();
    response.next({ ...homeResponse, secciones: [homeResponse.secciones[0]] });
    response.complete();

    expect(facade.hero()).toBeNull();
    expect(facade.heroScenes()).toEqual([]);
    expect(facade.heroActions()).toEqual([]);
  });

  it('derives the Services section by type and preserves service order zero', () => {
    const response = new Subject<PublicHomeResponse>();
    api.response$ = response;
    facade.load();
    response.next(homeResponse);
    response.complete();

    expect(facade.servicesSection()).toBe(servicesSection);
    expect(facade.servicesHeader()).toEqual({
      eyebrow: 'SERVICIOS API',
      title: 'Ingeniería desde API',
    });
    expect(facade.servicesAction()).toEqual({ label: 'Ver servicios API', url: '#', order: 0 });
    expect(facade.services().map((service) => [service.slug, service.order])).toEqual([
      ['servicio-cero', 0],
      ['servicio-dos', 2],
    ]);
    expect(facade.showServices()).toBe(true);
  });

  it('keeps Services hidden after a successful empty response', () => {
    const response = new Subject<PublicHomeResponse>();
    api.response$ = response;
    facade.load();
    response.next({ ...homeResponse, servicios: [] });
    response.complete();

    expect(facade.services()).toEqual([]);
    expect(facade.showServices()).toBe(false);
  });

  it('derives the featured business unit, resources and routes without positional lookup', () => {
    const response = new Subject<PublicHomeResponse>();
    api.response$ = response;
    facade.load();
    response.next(homeResponse);
    response.complete();

    expect(facade.businessUnitSection()).toBe(businessUnitSection);
    expect(facade.featuredBusinessUnit()?.nombre).toBe('Unidad Demo');
    expect(facade.businessUnitBackground()?.url).toBe('/fondo.jpg');
    expect(facade.businessUnitBackground()?.orden).toBe(0);
    expect(facade.businessUnitEditorialImages().map((resource) => resource.url)).toEqual([
      '/editorial-1.jpg',
      '/editorial-2.jpg',
      '/editorial-3.jpg',
    ]);
    expect(facade.businessUnitCatalogResource()).toEqual(
      expect.objectContaining({ url: '/catalogo.pdf', etiqueta: 'Ficha PDF' }),
    );
    expect(facade.businessUnitActions().map((action) => action.texto)).toEqual([
      'Conoce la unidad',
      'Descargar catálogo PDF',
    ]);
    expect(facade.businessUnitWebUrl()).toBe('/unidad-demo');
    expect(facade.businessUnitCatalogUrl()).toBe('/unidad-demo/catalogo');
    expect(facade.businessUnitPrimaryAction()).toEqual({
      label: 'Conoce la unidad',
      url: '/unidad-demo',
    });
    expect(facade.businessUnitCatalogAction()).toEqual({
      label: 'Descargar catálogo PDF',
      url: '/unidad-demo/catalogo',
    });
    expect(facade.showBusinessUnit()).toBe(true);
  });

  it('hides the business-unit section after a valid response with no featured unit', () => {
    const response = new Subject<PublicHomeResponse>();
    api.response$ = response;
    facade.load();
    response.next({ ...homeResponse, unidadDestacada: null });
    response.complete();

    expect(facade.featuredBusinessUnit()).toBeNull();
    expect(facade.showBusinessUnit()).toBe(false);
  });

  it('derives Projects by type, action and ordered cards without section-index coupling', () => {
    const response = new Subject<PublicHomeResponse>();
    api.response$ = response;
    facade.load();
    response.next(homeResponse);
    response.complete();

    expect(facade.projectsSection()).toBe(projectsSection);
    expect(facade.projectsHeader()).toEqual({
      eyebrow: 'PROYECTOS API',
      title: 'Obras desde API',
    });
    expect(facade.projectsAction()).toEqual({
      label: 'Ver todos desde API',
      url: '/proyectos',
      order: 0,
    });
    expect(facade.projects().map((project) => [project.slug, project.order])).toEqual([
      ['proyecto-cero', 0],
      ['proyecto-dos', 2],
    ]);
    expect(facade.projects()[0]).toEqual(
      expect.objectContaining({
        location: 'Quito',
        dateLabel: '2026',
        metadata: 'Quito - 2026',
        imageUrl: '/principal.jpg',
        imageAlt: 'Principal',
      }),
    );
    expect(facade.projects()[1]).toEqual(
      expect.objectContaining({ metadata: 'Proyecto 2023', imageUrl: '/dos.jpg' }),
    );
    expect(facade.showProjects()).toBe(true);
  });

  it('keeps Projects hidden after a successful empty response', () => {
    const response = new Subject<PublicHomeResponse>();
    api.response$ = response;
    facade.load();
    response.next({ ...homeResponse, proyectos: [] });
    response.complete();

    expect(facade.projects()).toEqual([]);
    expect(facade.showProjects()).toBe(false);
  });

  it('derives CTA by type rather than array position and preserves action order zero', () => {
    const response = new Subject<PublicHomeResponse>();
    api.response$ = response;
    facade.load();
    response.next(homeResponse);
    response.complete();

    expect(facade.ctaSection()).toBe(ctaSection);
    expect(facade.ctaCopy()).toEqual({
      title: 'CTA desde API',
      description: 'Descripción CTA desde API',
    });
    expect(facade.ctaBackground()).toBe('/cta-api.jpg');
    expect(facade.ctaAction()).toEqual({
      label: 'Contactar API',
      persistedUrl: '#contacto',
      url: '/contacto',
      order: 0,
    });
    expect(facade.showCta()).toBe(true);
  });

  it('hides CTA after a successful response without a CTA section', () => {
    const response = new Subject<PublicHomeResponse>();
    api.response$ = response;
    facade.load();
    response.next({
      ...homeResponse,
      secciones: homeResponse.secciones.filter(
        (section) => section.tipo !== PublicHomeSectionType.CTA,
      ),
    });
    response.complete();

    expect(facade.ctaSection()).toBeNull();
    expect(facade.ctaCopy()).toBeNull();
    expect(facade.ctaBackground()).toBeNull();
    expect(facade.ctaAction()).toBeNull();
    expect(facade.showCta()).toBe(false);
  });

  it('keeps CTA content but does not invent an action after a successful empty action list', () => {
    const response = new Subject<PublicHomeResponse>();
    api.response$ = response;
    facade.load();
    response.next({
      ...homeResponse,
      secciones: homeResponse.secciones.map((section) =>
        section.tipo === PublicHomeSectionType.CTA ? { ...section, acciones: [] } : section,
      ),
    });
    response.complete();

    expect(facade.ctaCopy()?.title).toBe('CTA desde API');
    expect(facade.ctaAction()).toBeNull();
    expect(facade.showCta()).toBe(true);
  });

  it('orders supported sections, preserves order zero and ignores legacy types', () => {
    const response = new Subject<PublicHomeResponse>();
    api.response$ = response;
    facade.load();
    response.next({
      ...homeResponse,
      secciones: [
        { ...heroSection, orden: 4 },
        { ...servicesSection, orden: 0 },
        { ...ctaSection, orden: 2 },
        { ...projectsSection, orden: 3 },
        { ...businessUnitSection, orden: 1 },
        { ...servicesSection, tipo: PublicHomeSectionType.EMPRESA, orden: -1 },
        { ...ctaSection, tipo: PublicHomeSectionType.CONTACTO, orden: -2 },
        { ...heroSection, tipo: PublicHomeSectionType.PERSONALIZADA, orden: -3 },
      ],
    });
    response.complete();

    expect(facade.orderedSections().map((section) => [section.tipo, section.orden])).toEqual([
      [PublicHomeSectionType.SERVICIOS, 0],
      [PublicHomeSectionType.UNIDAD_NEGOCIO, 1],
      [PublicHomeSectionType.CTA, 2],
      [PublicHomeSectionType.PROYECTOS, 3],
      [PublicHomeSectionType.HERO, 4],
    ]);
  });

  it('uses type and content as deterministic tie-breakers and keeps one section per type', () => {
    const response = new Subject<PublicHomeResponse>();
    api.response$ = response;
    facade.load();
    response.next({
      ...homeResponse,
      secciones: [
        { ...heroSection, titulo: 'Zulu duplicado', orden: 0 },
        { ...projectsSection, orden: 0 },
        { ...ctaSection, orden: 0 },
        { ...heroSection, titulo: 'Alpha elegido', orden: 0 },
      ],
    });
    response.complete();

    expect(facade.orderedSections().map((section) => section.tipo)).toEqual([
      PublicHomeSectionType.CTA,
      PublicHomeSectionType.HERO,
      PublicHomeSectionType.PROYECTOS,
    ]);
    expect(facade.hero()?.title).toBe('Alpha elegido');
    expect(facade.orderedSections().filter((section) => section.tipo === 'HERO')).toHaveLength(1);
  });

  it('exposes no commercial sections while loading', () => {
    facade.load();

    expect(facade.loading()).toBe(true);
    expect(facade.orderedSections()).toEqual([]);
    expect(facade.hero()).toBeNull();
    expect(facade.services()).toEqual([]);
    expect(facade.featuredBusinessUnit()).toBeNull();
    expect(facade.projects()).toEqual([]);
    expect(facade.ctaCopy()).toBeNull();
  });

  it('exposes an error without restoring transitional commercial fallbacks', () => {
    api.response$ = throwError(() => new Error('offline'));
    facade.load();

    expect(facade.loading()).toBe(false);
    expect(facade.error()).toContain('No pudimos cargar');
    expect(facade.orderedSections()).toEqual([]);
    expect(facade.hero()).toBeNull();
    expect(facade.heroScenes()).toEqual([]);
    expect(facade.heroActions()).toEqual([]);
    expect(facade.services()).toEqual([]);
    expect(facade.showServices()).toBe(false);
    expect(facade.featuredBusinessUnit()).toBeNull();
    expect(facade.showBusinessUnit()).toBe(false);
    expect(facade.projects()).toEqual([]);
    expect(facade.showProjects()).toBe(false);
    expect(facade.ctaCopy()).toBeNull();
    expect(facade.ctaAction()).toBeNull();
    expect(facade.showCta()).toBe(false);
  });
});
