import { TestBed } from '@angular/core/testing';
import { Observable, Subject, throwError } from 'rxjs';

import { PublicSiteResponse } from '../../data/models/public-content/public-site.model';
import { PublicContentApiService } from '../../data/services/public-content-api.service';
import { PublicSiteFacade } from './public-site.facade';

const siteResponse: PublicSiteResponse = {
  clave: 'isanorte',
  tituloSitio: 'Sitio API',
  descripcionSitio: 'Descripción del sitio',
  logoUrl: '/logo.svg',
  logoBlancoUrl: '/logo-white.svg',
  faviconUrl: '/favicon.ico',
  textoPiePagina: '© 2024 Texto legal API',
  empresa: {
    nombreComercial: 'Empresa API',
    direccion: 'Av. API 123',
    ciudad: 'Ciudad API',
    telefono: '+51 111 222',
    telefonoSecundario: '+51 333 444',
    email: 'contacto@example.com',
    emailVentas: 'email-invalido',
    whatsapp: null,
    horarioAtencion: null,
    resumenNosotros: 'Resumen API',
  },
  redes: [
    { nombre: 'Posterior', url: 'https://social.example/posterior', icono: null, orden: 3 },
    { nombre: 'Primera', url: 'https://social.example/primera', icono: 'uno', orden: 0 },
    { nombre: 'Sin URL real', url: '#', icono: null, orden: 1 },
  ],
  unidades: [
    {
      nombre: 'Unidad posterior',
      slug: 'unidad-posterior',
      descripcion: null,
      icono: null,
      imagenUrl: null,
      imagenAlt: null,
      orden: 4,
    },
    {
      nombre: 'Unidad cero',
      slug: 'unidad-cero',
      descripcion: null,
      icono: null,
      imagenUrl: null,
      imagenAlt: null,
      orden: 0,
    },
  ],
};

class PublicContentApiStub {
  response$: Observable<PublicSiteResponse> = new Subject<PublicSiteResponse>();
  siteKeys: string[] = [];

  getSite(siteKey: string): Observable<PublicSiteResponse> {
    this.siteKeys.push(siteKey);
    return this.response$;
  }
}

describe('PublicSiteFacade', () => {
  let facade: PublicSiteFacade;
  let api: PublicContentApiStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PublicSiteFacade,
        PublicContentApiStub,
        { provide: PublicContentApiService, useExisting: PublicContentApiStub },
      ],
    });
    facade = TestBed.inject(PublicSiteFacade);
    api = TestBed.inject(PublicContentApiStub);
  });

  it('loads the centralized site key once and exposes loading', () => {
    facade.load();
    facade.load();

    expect(api.siteKeys).toEqual(['isanorte']);
    expect(facade.loading()).toBe(true);
    expect(facade.site()).toBeNull();
  });

  it('stores success and derives configuration, company and branding', () => {
    const response = new Subject<PublicSiteResponse>();
    api.response$ = response;
    facade.load();
    response.next(siteResponse);
    response.complete();

    expect(facade.loading()).toBe(false);
    expect(facade.error()).toBeNull();
    expect(facade.site()).toEqual(siteResponse);
    expect(facade.configuration()).toEqual({
      key: 'isanorte',
      title: 'Sitio API',
      description: 'Descripción del sitio',
      logoUrl: '/logo.svg',
      logoWhiteUrl: '/logo-white.svg',
      faviconUrl: '/favicon.ico',
      footerText: '© 2024 Texto legal API',
    });
    expect(facade.company()).toEqual(siteResponse.empresa);
    expect(facade.brandLogo()).toBe('/logo.svg');
    expect(facade.brandLogoWhite()).toBe('/logo-white.svg');
    expect(facade.siteName()).toBe('Sitio API');
    expect(facade.companyName()).toBe('Empresa API');
    expect(facade.companySummary()).toBe('Resumen API');
    expect(facade.footerText()).toBe('Texto legal API');
  });

  it('orders networks and business units defensively while preserving order zero', () => {
    const response = new Subject<PublicSiteResponse>();
    api.response$ = response;
    facade.load();
    response.next(siteResponse);
    response.complete();

    expect(facade.socialNetworks().map((network) => network.nombre)).toEqual([
      'Primera',
      'Sin URL real',
      'Posterior',
    ]);
    expect(facade.presentableSocialNetworks().map((network) => network.nombre)).toEqual([
      'Primera',
      'Posterior',
    ]);
    expect(facade.businessUnits().map((unit) => [unit.nombre, unit.orden])).toEqual([
      ['Unidad cero', 0],
      ['Unidad posterior', 4],
    ]);
    expect(facade.businessUnitLinks()).toEqual([
      { name: 'Unidad cero', slug: 'unidad-cero', url: '/unidad-cero', order: 0 },
      {
        name: 'Unidad posterior',
        slug: 'unidad-posterior',
        url: '/unidad-posterior',
        order: 4,
      },
    ]);
  });

  it('derives only presentable contact values without replacing invalid backend data', () => {
    const response = new Subject<PublicSiteResponse>();
    api.response$ = response;
    facade.load();
    response.next(siteResponse);
    response.complete();

    expect(facade.contactEmails()).toEqual(['contacto@example.com']);
    expect(facade.contactPhones()).toEqual(['+51 111 222', '+51 333 444']);
    expect(facade.address()).toBe('Av. API 123');
    expect(facade.city()).toBe('Ciudad API');
    expect(facade.hasContactDetails()).toBe(true);
  });

  it('respects successful empty arrays and absent optional data without demo fallbacks', () => {
    const response = new Subject<PublicSiteResponse>();
    api.response$ = response;
    facade.load();
    response.next({
      ...siteResponse,
      tituloSitio: null,
      descripcionSitio: null,
      logoUrl: null,
      logoBlancoUrl: null,
      textoPiePagina: null,
      empresa: {
        ...siteResponse.empresa,
        nombreComercial: '',
        direccion: null,
        ciudad: null,
        telefono: null,
        telefonoSecundario: null,
        email: null,
        emailVentas: null,
        resumenNosotros: null,
      },
      redes: [],
      unidades: [],
    });
    response.complete();

    expect(facade.siteName()).toBe('');
    expect(facade.brandLogo()).toBeNull();
    expect(facade.companySummary()).toBeNull();
    expect(facade.socialNetworks()).toEqual([]);
    expect(facade.businessUnits()).toEqual([]);
    expect(facade.businessUnitLinks()).toEqual([]);
    expect(facade.contactEmails()).toEqual([]);
    expect(facade.hasContactDetails()).toBe(false);
    expect(facade.footerText()).toBeNull();
  });

  it('uses only minimal centralized branding and no units after a total error', () => {
    api.response$ = throwError(() => new Error('offline'));
    facade.load();

    expect(facade.loading()).toBe(false);
    expect(facade.error()).toContain('branding mínimo');
    expect(facade.site()).toBeNull();
    expect(facade.siteName()).toBe('ISANORTE');
    expect(facade.companyName()).toBe('ISANORTE');
    expect(facade.businessUnits()).toEqual([]);
    expect(facade.socialNetworks()).toEqual([]);
    expect(facade.hasContactDetails()).toBe(false);
  });
});
