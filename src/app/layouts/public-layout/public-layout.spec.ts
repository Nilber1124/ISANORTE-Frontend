import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PublicSiteResponse } from '../../data/models/public-content/public-site.model';
import { PublicLayout } from './public-layout';

const emptySite: PublicSiteResponse = {
  clave: 'isanorte',
  tituloSitio: null,
  descripcionSitio: null,
  logoUrl: null,
  logoBlancoUrl: null,
  faviconUrl: null,
  textoPiePagina: null,
  empresa: {
    nombreComercial: '',
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

describe('PublicLayout', () => {
  it('coordinates one shared Site request for Navbar and Footer', async () => {
    await TestBed.configureTestingModule({
      imports: [PublicLayout],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(PublicLayout);
    fixture.detectChanges();

    const request = http.expectOne('/api/publico/sitios/isanorte');
    expect(request.request.method).toBe('GET');
    request.flush(emptySite);
    fixture.detectChanges();

    http.expectNone('/api/publico/sitios/isanorte');
    http.verify();
  });
});
