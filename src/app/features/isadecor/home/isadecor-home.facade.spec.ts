import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../core/config/api.config';
import { IsadecorHomeFacade } from './isadecor-home.facade';

const URL = '/api/publico/sitios/isanorte/unidades/isadecor/home';

describe('IsadecorHomeFacade', () => {
  let http: HttpTestingController;
  let facade: IsadecorHomeFacade;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IsadecorHomeFacade,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '' },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    facade = TestBed.inject(IsadecorHomeFacade);
  });

  afterEach(() => http.verify());

  it('loads the whole Home with a single request', () => {
    facade.load();
    expect(facade.loading()).toBe(true);

    http.expectOne(URL).flush({
      hero: { titulo: 'Acabados', subtitulo: 'Paneles' },
      cinta: [{ texto: 'Envíos', enlace: null }],
      promociones: [],
      campana: null,
      tienda: null,
      facil: null,
      servicios: null,
      resenas: [],
    });

    expect(facade.loading()).toBe(false);
    expect(facade.error()).toBeNull();
    expect(facade.content()?.hero?.titulo).toBe('Acabados');
    expect(facade.content()?.cinta.length).toBe(1);
  });

  it('exposes an error and allows retrying', () => {
    facade.load();
    http.expectOne(URL).flush('boom', { status: 500, statusText: 'Server Error' });

    expect(facade.error()).toBeTruthy();
    expect(facade.loading()).toBe(false);

    facade.load();
    expect(facade.error()).toBeNull();
    http
      .expectOne(URL)
      .flush({
        hero: null,
        cinta: [],
        promociones: [],
        campana: null,
        tienda: null,
        facil: null,
        servicios: null,
        resenas: [],
      });
    expect(facade.content()).not.toBeNull();
  });
});
