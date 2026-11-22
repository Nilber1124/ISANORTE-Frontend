import { EnvironmentInjector, createEnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { Observable, Subject, throwError } from 'rxjs';

import { SeoRobots } from '../../../data/models/content/page-seo.model';
import {
  PublicPageResponse,
  PublicPageType,
} from '../../../data/models/public-content/public-page.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { PublicSiteFacade } from '../../../layouts/public-layout/public-site.facade';
import { PublicContactFacade, buildContactWhatsappMessage } from './public-contact.facade';

const pageResponse: PublicPageResponse = {
  contenido: {
    pagina: PublicPageType.CONTACTO,
    eyebrow: 'CONTACTO API',
    titulo: 'Título API',
    introduccion: 'Introducción API',
    descripcion: 'Descripción API',
    imagenUrl: null,
    imagenAlt: null,
    imagenFondoUrl: null,
    tags: [],
  },
  seo: null,
  empresa: null,
  servicios: null,
  proyectos: null,
};

class PublicContentApiStub {
  page$: Observable<PublicPageResponse> = new Subject<PublicPageResponse>();
  pageCalls: Array<{ siteKey: string; page: PublicPageType }> = [];

  getPage(siteKey: string, page: PublicPageType): Observable<PublicPageResponse> {
    this.pageCalls.push({ siteKey, page });
    return this.page$;
  }
}

const opened: Array<{ url: string; target: string | undefined; features: string | undefined }> = [];
let whatsappNumber: string | null = '51999888777';
const siteStub = {
  whatsappHrefFor: (message: string) =>
    whatsappNumber ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}` : null,
};

describe('PublicContactFacade', () => {
  let facade: PublicContactFacade;
  let api: PublicContentApiStub;
  let titleService: Title;
  let metaService: Meta;

  beforeEach(() => {
    opened.length = 0;
    vi.spyOn(window, 'open').mockImplementation((url, target, features) => {
      opened.push({ url: String(url), target, features });
      return null;
    });
    whatsappNumber = '51999888777';
    TestBed.configureTestingModule({
      providers: [
        PublicContactFacade,
        PublicContentApiStub,
        { provide: PublicContentApiService, useExisting: PublicContentApiStub },
        { provide: PublicSiteFacade, useValue: siteStub },
      ],
    });
    facade = TestBed.inject(PublicContactFacade);
    api = TestBed.inject(PublicContentApiStub);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
  });

  function fillValidForm(): void {
    facade.nombre.set('  Persona API  ');
    facade.email.set('  persona@example.com ');
    facade.telefono.set(' +51 999 111 222 ');
    facade.empresa.set('   ');
    facade.mensaje.set(' Mensaje API ');
    facade.consentimiento.set(true);
  }

  it('loads CONTACTO once from the centralized site key and exposes editorial content', () => {
    facade.load();
    facade.load();
    expect(api.pageCalls).toEqual([{ siteKey: 'isanorte', page: PublicPageType.CONTACTO }]);
    expect(facade.loading()).toBe(true);

    const page = api.page$ as Subject<PublicPageResponse>;
    page.next(pageResponse);
    page.complete();
    expect(facade.content()).toEqual(pageResponse.contenido);
    expect(facade.seo()).toBeNull();
    expect(facade.error()).toBeNull();
  });

  function sentMessage(): string {
    return decodeURIComponent(opened[0].url.split('?text=')[1]);
  }

  it('opens WhatsApp in a new tab with the typed data and resets the form', () => {
    fillValidForm();
    facade.servicio.set(' Remodelaciones ');
    facade.ubicacion.set(' Cajamarca ');
    facade.submit();

    expect(opened).toHaveLength(1);
    expect(opened[0].url.startsWith('https://wa.me/51999888777?text=')).toBe(true);
    expect(opened[0].target).toBe('_blank');
    expect(opened[0].features).toBe('noopener');
    expect(sentMessage()).toBe(
      [
        'Hola, quisiera cotizar un proyecto con ISANORTE.',
        '',
        '*Nombre:* Persona API',
        '*Teléfono:* +51 999 111 222',
        '*Correo:* persona@example.com',
        '*Servicio de interés:* Remodelaciones',
        '*Ubicación:* Cajamarca',
        '*Mensaje:* Mensaje API',
      ].join('\n'),
    );
    expect(facade.submitSuccess()).toBe(true);
    expect(facade.nombre()).toBe('');
    expect(facade.mensaje()).toBe('');
  });

  it('omits the optional lines that were left empty', () => {
    expect(
      buildContactWhatsappMessage({
        nombre: 'Ana', telefono: '999', email: 'a@b.co', empresa: '', servicio: '  ', ubicacion: '', mensaje: '',
      }),
    ).toBe(
      'Hola, quisiera cotizar un proyecto con ISANORTE.\n\n*Nombre:* Ana\n*Teléfono:* 999\n*Correo:* a@b.co',
    );
  });

  it('requires the data authorization before opening WhatsApp', () => {
    fillValidForm();
    facade.consentimiento.set(false);
    facade.submit();

    expect(opened).toEqual([]);
    expect(facade.consentimientoError()).toContain('aceptar');
  });

  it('does not open WhatsApp with an invalid form and exposes validation', () => {
    facade.submit();

    expect(opened).toEqual([]);
    expect(facade.nombreError()).toContain('nombre');
    expect(facade.emailError()).toContain('correo');
    expect(facade.telefonoError()).toContain('teléfono');
    expect(facade.consentimientoError()).toContain('aceptar');
    // El mensaje es opcional: vacío no es un error.
    expect(facade.mensajeError()).toBeUndefined();

    facade.email.set('invalido');
    expect(facade.emailError()).toContain('válido');
  });

  it('keeps the entered values and explains the problem when the company has no WhatsApp number', () => {
    whatsappNumber = null;
    fillValidForm();
    facade.submit();

    expect(opened).toEqual([]);
    expect(facade.submitSuccess()).toBe(false);
    expect(facade.submitError()).toContain('WhatsApp');
    expect(facade.mensaje()).toBe(' Mensaje API ');
  });

  it('isolates a page load failure from the form', () => {
    api.page$ = throwError(() => new Error('offline'));
    facade.load();
    expect(facade.error()).toContain('No pudimos cargar');
    expect(facade.submitError()).toBeNull();
  });

  it('applies the automatic SEO and ignores the SEO stored in the backend', () => {
    const subject = new Subject<PublicPageResponse>();
    api.page$ = subject;
    facade.load();
    subject.next({
      ...pageResponse,
      seo: {
        title: 'Contacto Directo | ISANORTE',
        description: 'Escríbenos para tu cotización.',
        ogImageUrl: 'https://cdn.isanorte.com/contacto.jpg',
        robots: SeoRobots.INDEX_FOLLOW,
      },
    });

    // SEO automático: se ignora lo guardado en el backend.
    expect(titleService.getTitle()).toBe('Contacto | ISANORTE Cajamarca');
    expect(metaService.getTag('property="og:title"')?.content).toBe('Contacto | ISANORTE Cajamarca');
    expect(metaService.getTag('name="robots"')?.content).toBe('index, follow');
    expect(metaService.getTag('property="og:type"')?.content).toBe('website');
    expect(metaService.getTag('name="description"')?.content).not.toBe('Escríbenos para tu cotización.');
    expect(metaService.getTag('property="og:image"')?.content).not.toBe('https://cdn.isanorte.com/contacto.jpg');
    expect(metaService.getTag('property="og:image"')?.content).toBeTruthy();
  });

  it('applies default SEO for Contacto on error', () => {
    api.page$ = throwError(() => new Error('offline'));
    facade.load();

    expect(titleService.getTitle()).toBe('Contacto | ISANORTE Cajamarca');
    expect(metaService.getTag('name="description"')?.content).toContain('Escríbenos por WhatsApp');
    expect(metaService.getTag('name="robots"')?.content).toBe('index, follow');
  });

  it('cleans up SEO tags when destroyed', () => {
    const parentInjector = TestBed.inject(EnvironmentInjector);
    const childInjector = createEnvironmentInjector([PublicContactFacade], parentInjector);
    const scopedFacade = childInjector.get(PublicContactFacade);

    const subject = new Subject<PublicPageResponse>();
    api.page$ = subject;
    scopedFacade.load();
    subject.next({
      ...pageResponse,
      seo: {
        title: 'Contacto Personalizado',
        description: 'Contáctanos ahora.',
        ogImageUrl: 'https://cdn.isanorte.com/contact.png',
        robots: SeoRobots.INDEX_FOLLOW,
      },
    });

    expect(titleService.getTitle()).toBe('Contacto | ISANORTE Cajamarca');

    childInjector.destroy();

    expect(titleService.getTitle()).toBe('ISANORTE');
    expect(metaService.getTag('property="og:title"')).toBeNull();
    expect(metaService.getTag('property="og:image"')).toBeNull();
    expect(metaService.getTag('name="robots"')).toBeNull();
  });
});
