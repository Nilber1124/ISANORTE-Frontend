import { EnvironmentInjector, createEnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { Observable, Subject, throwError } from 'rxjs';

import {
  PublicPageResponse,
  PublicPageType,
} from '../../../data/models/public-content/public-page.model';
import { SeoRobots } from '../../../data/models/content/page-seo.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { PublicAboutFacade } from './public-about.facade';

const response: PublicPageResponse = {
  contenido: {
    pagina: PublicPageType.NOSOTROS,
    eyebrow: 'EYEBROW API',
    titulo: 'Título API',
    introduccion: 'Introducción API',
    descripcion: 'Descripción API',
    imagenUrl: '/imagen-api.jpg',
    imagenAlt: 'Alt API',
    imagenFondoUrl: '/fondo-api.jpg',
    tags: ['SEGUNDO', 'PRIMERO'],
  },
  seo: {
    title: 'SEO API',
    description: 'Descripción SEO API',
    ogImageUrl: null,
    robots: SeoRobots.INDEX_FOLLOW,
  },
  empresa: {
    mision: 'Misión API',
    vision: 'Visión API',
    valores: 'Valores API',
    estadisticas: [
      { valor: 98, prefijo: null, sufijo: '%', etiqueta: 'SATISFACCIÓN', orden: 2 },
      { valor: 0, prefijo: null, sufijo: null, etiqueta: 'CERO', orden: 0 },
      { valor: 15, prefijo: '+', sufijo: null, etiqueta: 'AÑOS', orden: 1 },
    ],
  },
  servicios: null,
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

describe('PublicAboutFacade', () => {
  let facade: PublicAboutFacade;
  let api: PublicContentApiStub;
  let titleService: Title;
  let metaService: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PublicAboutFacade,
        PublicContentApiStub,
        { provide: PublicContentApiService, useExisting: PublicContentApiStub },
      ],
    });
    facade = TestBed.inject(PublicAboutFacade);
    api = TestBed.inject(PublicContentApiStub);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
  });

  it('loads NOSOTROS once from the centralized site key and exposes loading', () => {
    facade.load();
    facade.load();

    expect(api.calls).toEqual([{ siteKey: 'isanorte', page: PublicPageType.NOSOTROS }]);
    expect(facade.loading()).toBe(true);
  });

  it('derives editorial, SEO, tags, statistics and corporate values from the response', () => {
    const subject = new Subject<PublicPageResponse>();
    api.response$ = subject;
    facade.load();
    subject.next(response);
    subject.complete();

    expect(facade.loading()).toBe(false);
    expect(facade.error()).toBeNull();
    expect(facade.content()).toEqual(response.contenido);
    expect(facade.seo()).toEqual(response.seo);
    expect(facade.tags()).toEqual(['SEGUNDO', 'PRIMERO']);
    expect(facade.statistics().map((stat) => stat.etiqueta)).toEqual([
      'CERO',
      'AÑOS',
      'SATISFACCIÓN',
    ]);
    expect(facade.statistics()[0]).toMatchObject({
      valor: 0,
      prefijo: null,
      sufijo: null,
      orden: 0,
    });
    expect(facade.values().map((item) => [item.label, item.description])).toEqual([
      ['Misión', 'Misión API'],
      ['Visión', 'Visión API'],
      ['Valores', 'Valores API'],
    ]);
  });

  it('keeps editorial content while hiding corporate blocks for empresa=null or empty fields', () => {
    const subject = new Subject<PublicPageResponse>();
    api.response$ = subject;
    facade.load();
    subject.next({ ...response, empresa: null, contenido: { ...response.contenido, tags: [] } });
    subject.complete();

    expect(facade.content()?.titulo).toBe('Título API');
    expect(facade.tags()).toEqual([]);
    expect(facade.showStatistics()).toBe(false);
    expect(facade.showValues()).toBe(false);
  });

  it('omits null, empty and whitespace corporate items without hiding editorial content', () => {
    const subject = new Subject<PublicPageResponse>();
    api.response$ = subject;
    facade.load();
    subject.next({
      ...response,
      empresa: {
        mision: '  ',
        vision: '',
        valores: null,
        estadisticas: [],
      },
    });
    subject.complete();

    expect(facade.content()?.titulo).toBe('Título API');
    expect(facade.statistics()).toEqual([]);
    expect(facade.values()).toEqual([]);
    expect(facade.showStatistics()).toBe(false);
    expect(facade.showValues()).toBe(false);
  });

  it('exposes a neutral error without baseline content', () => {
    api.response$ = throwError(() => new Error('offline'));
    facade.load();

    expect(facade.loading()).toBe(false);
    expect(facade.error()).toContain('No pudimos cargar');
    expect(facade.content()).toBeNull();
    expect(facade.statistics()).toEqual([]);
    expect(facade.values()).toEqual([]);
  });

  it('applies dynamic SEO to document Title and Meta on successful load', () => {
    const subject = new Subject<PublicPageResponse>();
    api.response$ = subject;
    facade.load();
    subject.next({
      ...response,
      seo: {
        title: 'Nosotros Especial | ISANORTE',
        description: 'Historia y valores de ISANORTE.',
        ogImageUrl: 'https://cdn.isanorte.com/about.jpg',
        robots: SeoRobots.INDEX_FOLLOW,
      },
    });

    expect(titleService.getTitle()).toBe('Nosotros Especial | ISANORTE');
    expect(metaService.getTag('name="description"')?.content).toBe('Historia y valores de ISANORTE.');
    expect(metaService.getTag('name="robots"')?.content).toBe('index, follow');
    expect(metaService.getTag('property="og:title"')?.content).toBe('Nosotros Especial | ISANORTE');
    expect(metaService.getTag('property="og:description"')?.content).toBe('Historia y valores de ISANORTE.');
    expect(metaService.getTag('property="og:type"')?.content).toBe('website');
    expect(metaService.getTag('property="og:image"')?.content).toBe('https://cdn.isanorte.com/about.jpg');
  });

  it('applies default SEO on API error', () => {
    api.response$ = throwError(() => new Error('offline'));
    facade.load();

    expect(titleService.getTitle()).toBe('Nosotros | ISANORTE');
    expect(metaService.getTag('name="description"')?.content).toContain('Conoce la trayectoria');
    expect(metaService.getTag('name="robots"')?.content).toBe('index, follow');
    expect(metaService.getTag('property="og:image"')).toBeNull();
  });

  it('cleans up SEO tags and restores defaults when destroyed', () => {
    const parentInjector = TestBed.inject(EnvironmentInjector);
    const childInjector = createEnvironmentInjector([PublicAboutFacade], parentInjector);
    const scopedFacade = childInjector.get(PublicAboutFacade);

    const subject = new Subject<PublicPageResponse>();
    api.response$ = subject;
    scopedFacade.load();
    subject.next(response);

    expect(titleService.getTitle()).toBe('SEO API');
    expect(metaService.getTag('property="og:title"')?.content).toBe('SEO API');

    childInjector.destroy();

    expect(titleService.getTitle()).toBe('ISANORTE');
    expect(metaService.getTag('property="og:title"')).toBeNull();
    expect(metaService.getTag('property="og:description"')).toBeNull();
    expect(metaService.getTag('property="og:type"')).toBeNull();
    expect(metaService.getTag('property="og:image"')).toBeNull();
    expect(metaService.getTag('name="robots"')).toBeNull();
  });

  it('ignores responses arriving after facade is destroyed', () => {
    const parentInjector = TestBed.inject(EnvironmentInjector);
    const childInjector = createEnvironmentInjector([PublicAboutFacade], parentInjector);
    const scopedFacade = childInjector.get(PublicAboutFacade);

    const subject = new Subject<PublicPageResponse>();
    api.response$ = subject;
    scopedFacade.load();

    childInjector.destroy();
    expect(titleService.getTitle()).toBe('ISANORTE');

    subject.next(response);

    expect(titleService.getTitle()).toBe('ISANORTE');
    expect(metaService.getTag('property="og:title"')).toBeNull();
  });
});

