import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../core/config/api.config';
import {
  PublicContactRequest,
  PublicContactRequestStatus,
  PublicContactResponse,
} from '../models/contact/public-contact-request.model';
import { PublicSiteResponse } from '../models/public-content/public-site.model';
import { PublicPageResponse, PublicPageType } from '../models/public-content/public-page.model';
import { PublicContentApiService } from './public-content-api.service';

const siteResponse: PublicSiteResponse = {
  clave: 'isanorte',
  tituloSitio: 'ISANORTE API',
  descripcionSitio: null,
  logoUrl: '/logo.svg',
  logoBlancoUrl: null,
  faviconUrl: null,
  textoPiePagina: null,
  empresa: {
    nombreComercial: 'ISANORTE Empresa',
    direccion: null,
    ciudad: null,
    telefono: null,
    telefonoSecundario: null,
    email: null,
    emailVentas: null,
    whatsapp: null,
    horarioAtencion: null,
    resumenNosotros: null,
  },
  redes: [],
  unidades: [],
};

const aboutPageResponse: PublicPageResponse = {
  contenido: {
    pagina: PublicPageType.NOSOTROS,
    eyebrow: 'NOSOTROS',
    titulo: 'Título desde API',
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
  proyectos: null,
};

const servicesPageResponse: PublicPageResponse = {
  ...aboutPageResponse,
  contenido: { ...aboutPageResponse.contenido, pagina: PublicPageType.SERVICIOS },
  servicios: [
    {
      nombre: 'Servicio API',
      slug: 'servicio-api',
      etiqueta: null,
      resumen: null,
      descripcion: 'Descripción API',
      imagenUrl: null,
      imagenAlt: null,
      orden: 0,
      beneficios: [{ texto: 'Beneficio API', orden: 0 }],
    },
  ],
};

const projectsPageResponse: PublicPageResponse = {
  ...aboutPageResponse,
  contenido: { ...aboutPageResponse.contenido, pagina: PublicPageType.PROYECTOS },
  proyectos: [
    {
      nombre: 'Proyecto API',
      slug: 'proyecto-api',
      descripcion: null,
      ubicacion: null,
      fechaProyecto: null,
      orden: 0,
      imagenes: [{ url: '/proyecto.jpg', alt: null, esPrincipal: true, orden: 0 }],
      servicios: [{ nombre: 'Servicio API', slug: 'servicio-api' }],
    },
  ],
};

const publicContactRequest: PublicContactRequest = {
  nombre: 'Persona de prueba',
  email: 'persona@example.com',
  telefono: '+51 999 111 222',
  empresa: null,
  mensaje: 'Mensaje de prueba',
};

const publicContactResponse: PublicContactResponse = {
  id: 'c31c49b0-8a7c-4c7c-8c1a-9d9e25c5cb99',
  estado: PublicContactRequestStatus.NUEVA,
  fechaCreacion: '2026-09-21T12:00:00',
};

describe('PublicContentApiService', () => {
  let api: PublicContentApiService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: 'https://backend.example/' },
      ],
    });
    api = TestBed.inject(PublicContentApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses the canonical public Home path and encodes the site key', () => {
    api.getHome('isanorte central').subscribe();

    const request = http.expectOne(
      'https://backend.example/api/publico/sitios/isanorte%20central/home',
    );
    expect(request.request.method).toBe('GET');
    request.flush({ secciones: [], servicios: [], proyectos: [], unidadDestacada: null });
  });

  it('uses the canonical public Site path, encodes the key and returns the exact payload', () => {
    let result: PublicSiteResponse | undefined;
    api.getSite('isanorte central').subscribe((site) => (result = site));

    const request = http.expectOne('https://backend.example/api/publico/sitios/isanorte%20central');
    expect(request.request.method).toBe('GET');
    request.flush(siteResponse);

    expect(result).toEqual(siteResponse);
  });

  it('uses the canonical public Page path, encodes the site key and returns the typed payload', () => {
    let result: PublicPageResponse | undefined;
    api.getPage('isanorte central', PublicPageType.NOSOTROS).subscribe((page) => (result = page));

    const request = http.expectOne(
      'https://backend.example/api/publico/sitios/isanorte%20central/paginas/NOSOTROS',
    );
    expect(request.request.method).toBe('GET');
    request.flush(aboutPageResponse);

    expect(result).toEqual(aboutPageResponse);
  });

  it('returns the typed public Services catalogue from the page aggregate', () => {
    let result: PublicPageResponse | undefined;
    api.getPage('isanorte central', PublicPageType.SERVICIOS).subscribe((page) => (result = page));

    const request = http.expectOne(
      'https://backend.example/api/publico/sitios/isanorte%20central/paginas/SERVICIOS',
    );
    expect(request.request.method).toBe('GET');
    request.flush(servicesPageResponse);

    expect(result?.servicios?.[0]).toEqual(servicesPageResponse.servicios?.[0]);
  });

  it('returns typed public projects, images and associated services from the page aggregate', () => {
    let result: PublicPageResponse | undefined;
    api.getPage('isanorte central', PublicPageType.PROYECTOS).subscribe((page) => (result = page));

    const request = http.expectOne(
      'https://backend.example/api/publico/sitios/isanorte%20central/paginas/PROYECTOS',
    );
    expect(request.request.method).toBe('GET');
    request.flush(projectsPageResponse);

    expect(result?.proyectos?.[0]).toEqual(projectsPageResponse.proyectos?.[0]);
  });

  it('posts only the typed public contact request and returns its public confirmation', () => {
    let result: PublicContactResponse | undefined;
    api.submitContact(publicContactRequest).subscribe((response) => (result = response));

    const request = http.expectOne('https://backend.example/api/publico/contacto');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(publicContactRequest);
    request.flush(publicContactResponse, { status: 201, statusText: 'Created' });

    expect(result).toEqual(publicContactResponse);
  });
});
