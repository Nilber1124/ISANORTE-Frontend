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
const services = [{ id: 's1', nombre: 'Planos' }, { id: 's2', nombre: 'Ejecución' }];

describe('ProjectCardEditor', () => {
  let http: HttpTestingController;

  function create(id: string, field: ProjectCardField) {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '' }],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ProjectCardEditor);
    fixture.componentRef.setInput('projectId', id);
    fixture.componentRef.setInput('field', field);
    fixture.detectChanges();
    http.expectOne('/api/proyectos').flush([project, { ...project, id: 'p2', slug: 'otro', orden: 9 }]);
    http.expectOne('/api/servicios').flush(services);
    fixture.detectChanges();
    return fixture;
  }
  type Api = { setValue(k: string, v: string): void; toggleService(id: string, on: boolean): void; save(): void; remove(): void };

  afterEach(() => http?.verify());

  it('saves only the tapped text and sends the rest of the project untouched', () => {
    const fixture = create('p1', 'ubicacion');
    (fixture.componentInstance as unknown as { saveSingle(v: string): void }).saveSingle('  Cajamarca ');
    const put = http.expectOne('/api/proyectos/p1');
    expect(put.request.method).toBe('PUT');
    expect(put.request.body).toMatchObject({ ubicacion: 'Cajamarca', nombre: 'Casa campestre', slug: 'casa-campestre', servicioIds: ['s1'], destacado: true, orden: 3 });
    put.flush(project);
    http.expectOne('/api/proyectos').flush([project]);
    http.expectOne('/api/servicios').flush(services);
  });

  it('changes the applied services from the card', () => {
    const fixture = create('p1', 'servicios');
    const c = fixture.componentInstance as unknown as Api;
    c.toggleService('s2', true);
    c.toggleService('s1', false);
    fixture.detectChanges();
    c.save();
    expect(http.expectOne('/api/proyectos/p1').request.body.servicioIds).toEqual(['s2']);
  });

  it('creates a project at the end with a unique slug and requires a cover photo', () => {
    const fixture = create('new', 'ambos');
    const c = fixture.componentInstance as unknown as Api;
    c.setValue('nombre', 'Casa campestre');
    c.setValue('descripcion', 'Otra casa');
    fixture.detectChanges();
    c.save();
    http.expectNone('/api/proyectos');
    c.setValue('imagenUrl', 'https://res.cloudinary.com/x/casa.jpg');
    fixture.detectChanges();
    c.save();
    const post = http.expectOne('/api/proyectos');
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toMatchObject({ nombre: 'Casa campestre', slug: 'casa-campestre-2', activo: true, orden: 10, imagenUrl: 'https://res.cloudinary.com/x/casa.jpg' });
    post.flush(project);
  });

  it('removes a project from the web by deactivating it (not deleting it)', () => {
    const fixture = create('p1', 'ambos');
    (fixture.componentInstance as unknown as Api).remove();
    const request = http.expectOne('/api/proyectos/p1/activo');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ activo: false });
    request.flush(project);
  });
});
