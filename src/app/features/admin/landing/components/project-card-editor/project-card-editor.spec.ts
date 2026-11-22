import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { ProjectCardEditor, ProjectCardField } from './project-card-editor';

const project = {
  id: 'p1', nombre: 'Casa campestre', slug: 'casa-campestre', cliente: 'Cliente', ubicacion: 'Baños del Inca',
  fechaProyecto: '2026', areaM2: 120, plazoMeses: 6, alcance: 'Todo', tipoObra: 'VIVIENDA', descripcion: 'Una casa',
  imagenUrl: 'a.jpg', imagenAlt: 'Casa', destacado: true, activo: true, orden: 3,
  servicios: [{ id: 's1', nombre: 'Planos', slug: 'planos' }],
};

describe('ProjectCardEditor', () => {
  let http: HttpTestingController;

  function create(field: ProjectCardField) {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '' }],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ProjectCardEditor);
    fixture.componentRef.setInput('projectId', 'p1');
    fixture.componentRef.setInput('field', field);
    fixture.detectChanges();
    http.expectOne('/api/proyectos').flush([project]);
    fixture.detectChanges();
    return fixture;
  }
  type Api = { saveText(v: string): void; photo: { set(v: string): void }; savePhoto(): void };

  afterEach(() => http?.verify());

  it('saves only the tapped text and sends the rest of the project untouched', () => {
    const c = create('ubicacion').componentInstance as unknown as Api;
    c.saveText('  Cajamarca ');
    const put = http.expectOne('/api/proyectos/p1');
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toMatchObject({ ubicacion: 'Cajamarca', nombre: 'Casa campestre', slug: 'casa-campestre', servicioIds: ['s1'], destacado: true, orden: 3, tipoObra: 'VIVIENDA' });
    put.flush(project);
    http.expectOne('/api/proyectos').flush([project]);
  });

  it('clears an optional text by sending null', () => {
    const c = create('fechaProyecto').componentInstance as unknown as Api;
    c.saveText('   ');
    const put = http.expectOne('/api/proyectos/p1');
    expect(put.request.body.fechaProyecto).toBeNull();
    put.flush(project);
    http.expectOne('/api/proyectos').flush([project]);
  });

  it('changes the cover photo only when a new one is chosen', () => {
    const c = create('imagenUrl').componentInstance as unknown as Api;
    c.savePhoto();
    http.expectNone('/api/proyectos/p1');
    c.photo.set('https://res.cloudinary.com/x/nueva.jpg');
    c.savePhoto();
    const put = http.expectOne('/api/proyectos/p1');
    expect(put.request.body).toMatchObject({ imagenUrl: 'https://res.cloudinary.com/x/nueva.jpg', nombre: 'Casa campestre' });
    put.flush(project);
    http.expectOne('/api/proyectos').flush([project]);
  });
});
