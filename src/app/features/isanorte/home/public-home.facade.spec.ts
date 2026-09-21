import { TestBed } from '@angular/core/testing';
import { Observable, Subject, throwError } from 'rxjs';

import {
  PublicBusinessUnitResourceType,
  PublicHomeResponse,
  PublicHomeSection,
  PublicHomeSectionType,
} from '../../../data/models/public-content/public-home.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { HOME_HERO_FALLBACK } from './home-hero-fallback';
import { PublicHomeFacade } from './public-home.facade';

const section = (
  tipo: PublicHomeSectionType,
  overrides: Partial<PublicHomeSection> = {},
): PublicHomeSection => ({
  tipo,
  etiqueta: null,
  titulo: null,
  subtitulo: null,
  contenido: null,
  imagenUrl: null,
  imagenAlt: null,
  textoBoton: null,
  enlaceBoton: null,
  orden: 0,
  escenas: [],
  acciones: [],
  ...overrides,
});

const response: PublicHomeResponse = {
  // Servicios no está primero: garantiza que no se usa un índice fijo.
  secciones: [
    section(PublicHomeSectionType.HERO, {
      etiqueta: 'Hero API',
      titulo: 'Hero dinámico',
      subtitulo: 'Subtítulo',
      escenas: [
        { imagenUrl: '/second.jpg', alt: null, orden: 2 },
        { imagenUrl: '/first.jpg', alt: null, orden: 0 },
      ],
      acciones: [
        { texto: 'Segunda', enlace: '/segunda', orden: 2 },
        { texto: 'Primera', enlace: '/primera', orden: 0 },
      ],
    }),
    section(PublicHomeSectionType.SERVICIOS, {
      etiqueta: 'Servicios API',
      titulo: 'Soluciones API',
      acciones: [{ texto: 'Ver todos API', enlace: '/servicios', orden: 0 }],
    }),
    section(PublicHomeSectionType.UNIDAD_NEGOCIO, {
      etiqueta: 'Unidad API',
      titulo: 'Espacios desde sección API',
      acciones: [
        { texto: 'Segunda unidad', enlace: '#catalogo', orden: 2 },
        { texto: 'Primera unidad', enlace: '#isadecor', orden: 0 },
      ],
    }),
  ],
  servicios: [
    {
      nombre: 'Servicio dos',
      slug: 'servicio-dos',
      resumen: 'Resumen dos',
      descripcion: 'Completa dos',
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
      descripcion: 'Completa cero',
      icono: null,
      imagenUrl: null,
      imagenAlt: null,
      etiqueta: null,
      orden: 0,
      beneficios: [],
    },
  ],
  proyectos: [],
  unidadDestacada: {
    nombre: 'Unidad destacada API',
    slug: 'unidad-api',
    descripcion: 'Descripción de unidad API',
    icono: null,
    imagenUrl: '/unidad-principal-no-usada.jpg',
    imagenAlt: 'No se usa para la composición',
    orden: 0,
    recursos: [
      {
        tipo: PublicBusinessUnitResourceType.IMAGEN_EDITORIAL,
        url: '/editorial-dos.jpg',
        alt: 'Editorial dos',
        etiqueta: null,
        orden: 2,
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
        url: '/editorial-cero.jpg',
        alt: null,
        etiqueta: null,
        orden: 0,
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

  it('uses one centralized Home request and derives Hero and Services by type', () => {
    const source = new Subject<PublicHomeResponse>();
    api.response$ = source;
    facade.load();
    source.next(response);
    source.complete();

    expect(api.siteKeys).toEqual(['isanorte']);
    expect(facade.home()).toEqual(response);
    expect(facade.hero()?.title).toBe('Hero dinámico');
    expect(facade.heroScenes().map((scene) => scene.imageUrl)).toEqual([
      '/first.jpg',
      '/second.jpg',
    ]);
    expect(facade.heroActions().map((action) => action.label)).toEqual(['Primera', 'Segunda']);
    expect(facade.servicesSection()?.titulo).toBe('Soluciones API');
    expect(facade.servicesHeader()).toEqual({ eyebrow: 'Servicios API', title: 'Soluciones API' });
    expect(facade.servicesAction()).toEqual({
      label: 'Ver todos API',
      url: '/servicios',
      order: 0,
    });
  });

  it('preserves orden zero and maps only Home service card fields', () => {
    const source = new Subject<PublicHomeResponse>();
    api.response$ = source;
    facade.load();
    source.next(response);
    source.complete();

    expect(facade.services().map((service) => [service.slug, service.order])).toEqual([
      ['servicio-cero', 0],
      ['servicio-dos', 2],
    ]);
    expect(facade.services()[1]).toEqual({
      id: 'servicio-dos',
      slug: 'servicio-dos',
      name: 'Servicio dos',
      summary: 'Resumen dos',
      imageUrl: '/dos.jpg',
      imageAlt: 'Alt dos',
      linkUrl: '#',
      order: 2,
      benefits: [],
    });
    expect(facade.showServices()).toBe(true);
  });

  it('hides services after a valid empty collection instead of restoring demo content', () => {
    const source = new Subject<PublicHomeResponse>();
    api.response$ = source;
    facade.load();
    source.next({ ...response, servicios: [] });
    source.complete();

    expect(facade.services()).toEqual([]);
    expect(facade.showServices()).toBe(false);
    expect(facade.error()).toBeNull();
  });

  it('derives the featured unit, section, actions and resources by type instead of index', () => {
    const source = new Subject<PublicHomeResponse>();
    api.response$ = source;
    facade.load();
    source.next(response);
    source.complete();

    expect(facade.businessUnitSection()?.titulo).toBe('Espacios desde sección API');
    expect(facade.businessUnitHeader()).toEqual({
      eyebrow: 'Unidad API',
      title: 'Espacios desde sección API',
    });
    expect(facade.featuredBusinessUnit()?.nombre).toBe('Unidad destacada API');
    expect(facade.businessUnitActions()).toEqual([
      { label: 'Primera unidad', url: '#isadecor', order: 0 },
      { label: 'Segunda unidad', url: '#catalogo', order: 2 },
    ]);
    expect(facade.businessUnitBackgroundResource()).toEqual(
      expect.objectContaining({ url: '/fondo.jpg', orden: 0 }),
    );
    expect(
      facade.businessUnitEditorialResources().map((resource) => [resource.url, resource.orden]),
    ).toEqual([
      ['/editorial-cero.jpg', 0],
      ['/editorial-dos.jpg', 2],
    ]);
    expect(facade.businessUnitCatalogResource()).toBeNull();
    expect(facade.showBusinessUnit()).toBe(true);
  });

  it('hides the unit after a valid null response without restoring ISADECOR', () => {
    const source = new Subject<PublicHomeResponse>();
    api.response$ = source;
    facade.load();
    source.next({ ...response, unidadDestacada: null });
    source.complete();

    expect(facade.featuredBusinessUnit()).toBeNull();
    expect(facade.businessUnitBackgroundResource()).toBeNull();
    expect(facade.businessUnitEditorialResources()).toEqual([]);
    expect(facade.showBusinessUnit()).toBe(false);
  });

  it('keeps a valid unit visible with empty resources without inventing images', () => {
    const source = new Subject<PublicHomeResponse>();
    api.response$ = source;
    facade.load();
    source.next({
      ...response,
      unidadDestacada: { ...response.unidadDestacada!, recursos: [] },
    });
    source.complete();

    expect(facade.showBusinessUnit()).toBe(true);
    expect(facade.businessUnitBackgroundResource()).toBeNull();
    expect(facade.businessUnitEditorialResources()).toEqual([]);
    expect(facade.businessUnitCatalogResource()).toBeNull();
  });

  it('keeps the controlled Hero fallback and exposes an error when Home fails', () => {
    api.response$ = throwError(() => new Error('offline'));
    facade.load();

    expect(facade.loading()).toBe(false);
    expect(facade.error()).toContain('versión local');
    expect(facade.hero()).toEqual(HOME_HERO_FALLBACK.content);
    expect(facade.heroScenes()).toHaveLength(5);
    expect(facade.services()).toEqual([]);
    expect(facade.showServices()).toBe(false);
    expect(facade.featuredBusinessUnit()).toBeNull();
    expect(facade.showBusinessUnit()).toBe(false);
  });

  it('derives dynamic projects from Home response and falls back when empty', () => {
    const source = new Subject<PublicHomeResponse>();
    api.response$ = source;
    facade.load();
    source.next({
      ...response,
      proyectos: [
        {
          nombre: 'Edificio Alpha',
          slug: 'edificio-alpha',
          ubicacion: 'Quito Norte',
          fechaProyecto: '2025',
          descripcion: 'Edificio de oficinas',
          orden: 1,
          imagenes: [{ url: '/alpha.jpg', alt: 'Alpha', esPrincipal: true, orden: 0 }],
        },
      ],
    });
    source.complete();

    expect(facade.projects()).toHaveLength(1);
    expect(facade.projects()[0].name).toBe('Edificio Alpha');
    expect(facade.projects()[0].metadata).toBe('Quito Norte - 2025');
    expect(facade.projects()[0].imageUrl).toBe('/alpha.jpg');
    expect(facade.showProjects()).toBe(true);
  });

  it('derives CTA section and statistics correctly', () => {
    const source = new Subject<PublicHomeResponse>();
    api.response$ = source;
    facade.load();
    source.next({
      ...response,
      secciones: [
        ...response.secciones,
        section(PublicHomeSectionType.CTA, {
          titulo: '¿Listo para transformar tu espacio?',
          subtitulo: 'Agenda una llamada con nuestro equipo técnico.',
          imagenUrl: '/cta-bg.jpg',
          acciones: [{ texto: 'CONTACTAR AHORA', enlace: '/contacto', orden: 0 }],
        }),
      ],
    });
    source.complete();

    expect(facade.cta().copy.title).toBe('¿Listo para transformar tu espacio?');
    expect(facade.cta().copy.description).toBe('Agenda una llamada con nuestro equipo técnico.');
    expect(facade.cta().action.label).toBe('CONTACTAR AHORA');
    expect(facade.cta().bgImageUrl).toBe('/cta-bg.jpg');
    expect(facade.statistics().length).toBeGreaterThan(0);
    expect(facade.showStatistics()).toBe(true);
  });
});
