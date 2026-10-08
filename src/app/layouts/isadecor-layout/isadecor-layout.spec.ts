import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PublicSiteResponse } from '../../data/models/public-content/public-site.model';
import { IsadecorLayout } from './isadecor-layout';

const mockSite: PublicSiteResponse = {
  clave: 'isanorte',
  tituloSitio: 'ISANORTE',
  descripcionSitio: null,
  logoUrl: null,
  logoBlancoUrl: null,
  faviconUrl: null,
  textoPiePagina: null,
  empresa: {
    nombreComercial: 'ISANORTE',
    direccion: 'Av. Test 123',
    ciudad: 'Quito',
    telefono: '+593 99 999 9999',
    telefonoSecundario: null,
    email: 'contacto@isanorte.com',
    emailVentas: null,
    whatsapp: null,
    horarioAtencion: null,
    resumenNosotros: null,
  },
  redes: [],
  unidades: [],
};

describe('IsadecorLayout', () => {
  it('coordinates site request for footer dynamic contact', async () => {
    await TestBed.configureTestingModule({
      imports: [IsadecorLayout],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();
    const http = TestBed.inject(HttpTestingController);

    const fixture = TestBed.createComponent(IsadecorLayout);
    fixture.detectChanges();

    const siteRequest = http.expectOne('/api/publico/sitios/isanorte');
    expect(siteRequest.request.method).toBe('GET');
    siteRequest.flush(mockSite);

    const categoriesRequest = http.expectOne(
      '/api/publico/sitios/isanorte/unidades/isadecor/catalogo',
    );
    expect(categoriesRequest.request.method).toBe('GET');
    categoriesRequest.flush({
      unidad: { nombre: 'ISADECOR', slug: 'isadecor' },
      categorias: [],
      productos: [],
    });

    const announcementsRequest = http.expectOne('/api/publico/anuncios/ISADECOR');
    expect(announcementsRequest.request.method).toBe('GET');
    announcementsRequest.flush([]);

    fixture.detectChanges();

    http.expectNone('/api/publico/sitios/isanorte');
    http.expectNone('/api/publico/sitios/isanorte/unidades/isadecor/catalogo');
    http.expectNone('/api/publico/anuncios/ISADECOR');
    http.verify();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('a[href="mailto:contacto@isanorte.com"]')).toBeTruthy();
  });
});
