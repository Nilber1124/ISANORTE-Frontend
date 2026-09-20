import { TestBed } from '@angular/core/testing';
import { Observable, Subject, throwError } from 'rxjs';

import {
  PublicBusinessUnitResourceType,
  PublicHomeResponse,
  PublicHomeSection,
  PublicHomeSectionType,
} from '../../../data/models/public-content/public-home.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { HOME_BUSINESS_UNIT_FALLBACK } from './home-business-unit-fallback';
import { HOME_HERO_FALLBACK } from './home-hero-fallback';
import { HOME_SERVICES_FALLBACK } from './home-services-fallback';
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

const homeResponse: PublicHomeResponse = {
  secciones: [servicesSection, heroSection, businessUnitSection],
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
  proyectos: [],
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
      label: 'VER CATÁLOGO',
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

  it('keeps the transitional Hero fallback when the request fails', () => {
    api.response$ = throwError(() => new Error('offline'));
    facade.load();

    expect(facade.loading()).toBe(false);
    expect(facade.error()).toContain('versión local');
    expect(facade.hero()).toEqual(HOME_HERO_FALLBACK.content);
    expect(facade.heroScenes()).toEqual(HOME_HERO_FALLBACK.scenes);
    expect(facade.heroActions()).toEqual(HOME_HERO_FALLBACK.actions);
    expect(facade.servicesHeader()).toEqual(HOME_SERVICES_FALLBACK.header);
    expect(facade.services()).toEqual(HOME_SERVICES_FALLBACK.services);
    expect(facade.showServices()).toBe(true);
    expect(facade.businessUnitSection()).toEqual(HOME_BUSINESS_UNIT_FALLBACK.section);
    expect(facade.featuredBusinessUnit()).toEqual(HOME_BUSINESS_UNIT_FALLBACK.unit);
    expect(facade.businessUnitWebUrl()).toBe('/isadecor');
    expect(facade.businessUnitCatalogUrl()).toBe('/isadecor/catalogo');
    expect(facade.showBusinessUnit()).toBe(true);
  });
});
