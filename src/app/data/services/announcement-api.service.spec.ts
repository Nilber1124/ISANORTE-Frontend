import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { AnnouncementRequest } from '../models/announcement/announcement.model';
import { AnnouncementApiService } from './announcement-api.service';

describe('AnnouncementApiService', () => {
  let api: AnnouncementApiService;
  let http: HttpTestingController;

  const request: AnnouncementRequest = {
    titulo: 'Anuncio',
    descripcionResumida: 'Resumen',
    contenidoDetallado: 'Detalle',
    condiciones: null,
    imagenUrl: 'https://cdn.example/anuncio.webp',
    etiqueta: 'Nuevo',
    destino: 'AMBOS',
    tipoAccion: 'RUTA_INTERNA',
    destinoAccion: '/contacto',
    textoBoton: 'Abrir',
    fechaInicio: null,
    fechaFin: null,
    activo: true,
    orden: 0,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    api = TestBed.inject(AnnouncementApiService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses the public destination endpoint', () => {
    api.getPublic('ISADECOR').subscribe();
    const call = http.expectOne('/api/publico/anuncios/ISADECOR');
    expect(call.request.method).toBe('GET');
    call.flush([]);
  });

  it('uses exact administrative CRUD and active paths', () => {
    api.create(request).subscribe();
    const create = http.expectOne('/api/anuncios');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(request);
    create.flush({ id: 'announcement-1', ...request, fechaCreacion: '', fechaActualizacion: '' });

    api.changeActive('announcement 1', { activo: false }).subscribe();
    const active = http.expectOne('/api/anuncios/announcement%201/activo');
    expect(active.request.method).toBe('PATCH');
    expect(active.request.body).toEqual({ activo: false });
    active.flush({
      id: 'announcement-1',
      ...request,
      activo: false,
      fechaCreacion: '',
      fechaActualizacion: '',
    });

    api.delete('announcement 1').subscribe();
    const remove = http.expectOne('/api/anuncios/announcement%201');
    expect(remove.request.method).toBe('DELETE');
    remove.flush(null);
  });
});
