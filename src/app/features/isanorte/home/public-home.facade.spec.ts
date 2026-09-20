import { TestBed } from '@angular/core/testing';
import { Observable, Subject, throwError } from 'rxjs';

import {
  PublicHomeResponse,
  PublicHomeSection,
  PublicHomeSectionType,
} from '../../../data/models/public-content/public-home.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { HOME_HERO_FALLBACK } from './home-hero-fallback';
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

const homeResponse: PublicHomeResponse = {
  secciones: [
    { ...heroSection, tipo: PublicHomeSectionType.SERVICIOS, titulo: 'No es Hero' },
    heroSection,
  ],
  servicios: [],
  proyectos: [],
  unidadDestacada: null,
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

  it('keeps the transitional Hero fallback when the request fails', () => {
    api.response$ = throwError(() => new Error('offline'));
    facade.load();

    expect(facade.loading()).toBe(false);
    expect(facade.error()).toContain('versión local');
    expect(facade.hero()).toEqual(HOME_HERO_FALLBACK.content);
    expect(facade.heroScenes()).toEqual(HOME_HERO_FALLBACK.scenes);
    expect(facade.heroActions()).toEqual(HOME_HERO_FALLBACK.actions);
  });
});
