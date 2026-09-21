import { TestBed } from '@angular/core/testing';
import { Observable, Subject, throwError } from 'rxjs';

import {
  PublicPageResponse,
  PublicPageType,
} from '../../../data/models/public-content/public-page.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { PublicServicesFacade } from './public-services.facade';

const response: PublicPageResponse = {
  contenido: {
    pagina: PublicPageType.SERVICIOS,
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
  servicios: [
    {
      nombre: 'Segundo API',
      slug: 'segundo-api',
      etiqueta: null,
      resumen: null,
      descripcion: 'Descripción segunda',
      imagenUrl: null,
      imagenAlt: null,
      orden: 2,
      beneficios: [
        { texto: 'Segundo beneficio', orden: 2 },
        { texto: 'Cero beneficio', orden: 0 },
      ],
    },
    {
      nombre: 'Cero API',
      slug: 'cero-api',
      etiqueta: 'Etiqueta API',
      resumen: 'Resumen API',
      descripcion: null,
      imagenUrl: '/cero-api.jpg',
      imagenAlt: null,
      orden: 0,
      beneficios: [],
    },
  ],
  proyectos: null,
};

class PublicContentApiStub {
  response$: Observable<PublicPageResponse> = new Subject<PublicPageResponse>();
  calls: Array<{ siteKey: string; page: PublicPageType }> = [];

  getPage(siteKey: string, page: PublicPageType): Observable<PublicPageResponse> {
    this.calls.push({ siteKey, page });
    return this.response$;
  }
}

describe('PublicServicesFacade', () => {
  let facade: PublicServicesFacade;
  let api: PublicContentApiStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PublicServicesFacade,
        PublicContentApiStub,
        { provide: PublicContentApiService, useExisting: PublicContentApiStub },
      ],
    });
    facade = TestBed.inject(PublicServicesFacade);
    api = TestBed.inject(PublicContentApiStub);
  });

  it('loads the public SERVICIOS page once and exposes loading', () => {
    facade.load();
    facade.load();

    expect(api.calls).toEqual([{ siteKey: 'isanorte', page: PublicPageType.SERVICIOS }]);
    expect(facade.loading()).toBe(true);
  });

  it('derives content and deterministically orders public services and benefits', () => {
    const subject = new Subject<PublicPageResponse>();
    api.response$ = subject;
    facade.load();
    subject.next(response);
    subject.complete();

    expect(facade.loading()).toBe(false);
    expect(facade.error()).toBeNull();
    expect(facade.content()).toEqual(response.contenido);
    expect(facade.services().map((service) => service.slug)).toEqual(['cero-api', 'segundo-api']);
    expect(facade.services()[0]).toMatchObject({ orden: 0, imagenAlt: null });
    expect(facade.services()[1].beneficios.map((benefit) => benefit.texto)).toEqual([
      'Cero beneficio',
      'Segundo beneficio',
    ]);
    expect(facade.services()[1].beneficios[0].orden).toBe(0);
  });

  it('treats null and empty catalogues as valid success without content fallback', () => {
    const subject = new Subject<PublicPageResponse>();
    api.response$ = subject;
    facade.load();
    subject.next({ ...response, servicios: null });
    subject.complete();

    expect(facade.content()?.titulo).toBe('Título API');
    expect(facade.services()).toEqual([]);
    expect(facade.showServices()).toBe(false);
  });

  it('exposes a neutral error without services baseline', () => {
    api.response$ = throwError(() => new Error('offline'));
    facade.load();

    expect(facade.loading()).toBe(false);
    expect(facade.error()).toContain('No pudimos cargar');
    expect(facade.content()).toBeNull();
    expect(facade.services()).toEqual([]);
  });
});
