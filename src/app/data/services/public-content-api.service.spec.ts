import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../core/config/api.config';
import { PublicSiteResponse } from '../models/public-content/public-site.model';
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
});
