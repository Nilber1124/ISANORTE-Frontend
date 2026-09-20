import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../core/config/api.config';
import { PublicContentApiService } from './public-content-api.service';

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
});
