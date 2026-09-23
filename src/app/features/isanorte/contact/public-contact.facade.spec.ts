import { HttpErrorResponse } from '@angular/common/http';
import { EnvironmentInjector, createEnvironmentInjector } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';
import { Observable, Subject, throwError } from 'rxjs';

import { SeoRobots } from '../../../data/models/content/page-seo.model';
import {
  PublicContactRequest,
  PublicContactRequestStatus,
  PublicContactResponse,
} from '../../../data/models/contact/public-contact-request.model';
import {
  PublicPageResponse,
  PublicPageType,
} from '../../../data/models/public-content/public-page.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { PublicContactFacade } from './public-contact.facade';

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

const confirmation: PublicContactResponse = {
  id: 'c31c49b0-8a7c-4c7c-8c1a-9d9e25c5cb99',
  estado: PublicContactRequestStatus.NUEVA,
  fechaCreacion: '2026-09-21T12:00:00',
};

class PublicContentApiStub {
  page$: Observable<PublicPageResponse> = new Subject<PublicPageResponse>();
  submit$: Observable<PublicContactResponse> = new Subject<PublicContactResponse>();
  pageCalls: Array<{ siteKey: string; page: PublicPageType }> = [];
  requests: PublicContactRequest[] = [];

  getPage(siteKey: string, page: PublicPageType): Observable<PublicPageResponse> {
    this.pageCalls.push({ siteKey, page });
    return this.page$;
  }

  submitContact(request: PublicContactRequest): Observable<PublicContactResponse> {
    this.requests.push(request);
    return this.submit$;
  }
}

describe('PublicContactFacade', () => {
  let facade: PublicContactFacade;
  let api: PublicContentApiStub;
  let titleService: Title;
  let metaService: Meta;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PublicContactFacade,
        PublicContentApiStub,
        { provide: PublicContentApiService, useExisting: PublicContentApiStub },
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

  it('uses the exact public request, prevents a duplicate submit and resets only after success', () => {
    fillValidForm();
    facade.submit();
    facade.submit();

    expect(facade.submitting()).toBe(true);
    expect(api.requests).toEqual([
      {
        nombre: 'Persona API',
        email: 'persona@example.com',
        telefono: '+51 999 111 222',
        empresa: null,
        mensaje: 'Mensaje API',
      },
    ]);

    const submit = api.submit$ as Subject<PublicContactResponse>;
    submit.next(confirmation);
    submit.complete();

    expect(facade.submitting()).toBe(false);
    expect(facade.submitSuccess()).toBe(true);
    expect(facade.nombre()).toBe('');
    expect(facade.mensaje()).toBe('');
  });

  it('does not send an invalid request and exposes contract-aligned validation', () => {
    facade.submit();

    expect(api.requests).toEqual([]);
    expect(facade.nombreError()).toContain('nombre');
    expect(facade.emailError()).toContain('correo');
    expect(facade.telefonoError()).toContain('teléfono');
    expect(facade.mensajeError()).toContain('Cuéntanos');

    facade.email.set('invalido');
    expect(facade.emailError()).toContain('válido');
  });

  it('keeps entered values and shows a generic validation error for HTTP 400', () => {
    fillValidForm();
    api.submit$ = throwError(() => new HttpErrorResponse({ status: 400 }));
    facade.submit();

    expect(facade.submitting()).toBe(false);
    expect(facade.submitSuccess()).toBe(false);
    expect(facade.submitError()).toContain('Revisa');
    expect(facade.nombre()).toBe('  Persona API  ');
  });

  it('shows a neutral transport error while retaining the form and isolates page failure', () => {
    fillValidForm();
    api.submit$ = throwError(() => new Error('offline'));
    facade.submit();
    expect(facade.submitError()).toContain('No pudimos enviar');
    expect(facade.mensaje()).toBe(' Mensaje API ');

    api.page$ = throwError(() => new Error('offline'));
    facade.load();
    expect(facade.error()).toContain('No pudimos cargar');
    expect(facade.submitError()).toContain('No pudimos enviar');
  });

  it('applies dynamic SEO from backend on load', () => {
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

    expect(titleService.getTitle()).toBe('Contacto Directo | ISANORTE');
    expect(metaService.getTag('name="description"')?.content).toBe('Escríbenos para tu cotización.');
    expect(metaService.getTag('name="robots"')?.content).toBe('index, follow');
    expect(metaService.getTag('property="og:title"')?.content).toBe('Contacto Directo | ISANORTE');
    expect(metaService.getTag('property="og:image"')?.content).toBe('https://cdn.isanorte.com/contacto.jpg');
  });

  it('applies default SEO for Contacto on error', () => {
    api.page$ = throwError(() => new Error('offline'));
    facade.load();

    expect(titleService.getTitle()).toBe('Contacto | ISANORTE');
    expect(metaService.getTag('name="description"')?.content).toContain('Ponte en contacto con ISANORTE');
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

    expect(titleService.getTitle()).toBe('Contacto Personalizado');

    childInjector.destroy();

    expect(titleService.getTitle()).toBe('ISANORTE');
    expect(metaService.getTag('property="og:title"')).toBeNull();
    expect(metaService.getTag('property="og:image"')).toBeNull();
    expect(metaService.getTag('name="robots"')).toBeNull();
  });
});

