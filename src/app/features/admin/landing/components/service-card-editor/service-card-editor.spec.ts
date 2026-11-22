import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { ServiceCardEditor, slugify } from './service-card-editor';

const service = {
  id: 's1', nombre: 'Diseño y planos', slug: 'diseno-y-planos', resumen: 'Resumen', descripcion: 'Descripción larga',
  imagenUrl: 'a.jpg', etiqueta: null, imagenAlt: null, activo: true, destacado: false, orden: 2,
  beneficios: [
    { id: 'b1', texto: 'Uno', orden: 0, activo: true },
    { id: 'b2', texto: 'Dos', orden: 1, activo: true },
    { id: 'b3', texto: 'Tres', orden: 2, activo: true },
  ],
};

describe('ServiceCardEditor', () => {
  let http: HttpTestingController;

  function create(id: string, field: 'nombre' | 'descripcion' | 'imagenUrl' | 'beneficios' | 'ambos') {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '' }],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ServiceCardEditor);
    fixture.componentRef.setInput('serviceId', id);
    fixture.componentRef.setInput('field', field);
    fixture.detectChanges();
    http.expectOne('/api/servicios').flush([service, { ...service, id: 's9', orden: 7, beneficios: [] }]);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => http?.verify());

  it('slugifies names without accents or symbols', () => {
    expect(slugify('Diseño y elaboración de planos')).toBe('diseno-y-elaboracion-de-planos');
    expect(slugify('  ¡Obra civil! ')).toBe('obra-civil');
  });

  it('shows only the points (one per line) when the list was tapped', () => {
    const el = create('s1', 'beneficios').nativeElement as HTMLElement;
    expect(el.querySelectorAll('textarea')).toHaveLength(1);
    expect((el.querySelector('textarea') as HTMLTextAreaElement).value).toBe('Uno\nDos\nTres');
  });

  it('syncs the points: edits the changed one, adds the new one and removes the missing ones', () => {
    const fixture = create('s1', 'beneficios');
    const c = fixture.componentInstance as unknown as { setValue(k: string, v: string): void; save(): void };
    c.setValue('beneficios', 'Uno\nDos cambiado\nCuatro nuevo\nQuinto');
    fixture.detectChanges();
    c.save();
    http.expectOne('/api/servicios/s1').flush(service);
    const put = http.expectOne('/api/servicios/s1/beneficios/b2');
    expect(put.request.body).toEqual({ texto: 'Dos cambiado', orden: 1, activo: true });
    const putThree = http.expectOne('/api/servicios/s1/beneficios/b3');
    expect(putThree.request.body.texto).toBe('Cuatro nuevo');
    const post = http.expectOne('/api/servicios/s1/beneficios');
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toEqual({ texto: 'Quinto', orden: 3, activo: true });
    put.flush({}); putThree.flush({}); post.flush({});
    http.expectOne('/api/servicios').flush([service]);
  });

  it('creates a service at the end with a slug and its points', () => {
    const fixture = create('new', 'ambos');
    const c = fixture.componentInstance as unknown as { setValue(k: string, v: string): void; save(): void };
    c.setValue('nombre', 'Obras civiles');
    c.setValue('descripcion', 'Todo tipo de obras.');
    c.setValue('beneficios', 'Rápido\nSeguro');
    fixture.detectChanges();
    c.save();
    // Sin foto no se puede crear: la petición no sale.
    http.expectNone('/api/servicios');
    c.setValue('imagenUrl', 'https://res.cloudinary.com/x/obras.jpg');
    fixture.detectChanges();
    c.save();
    http.expectOne((r) => r.url === '/api/servicios/slug-disponible' && r.params.get('slug') === 'obras-civiles').flush({ available: true });
    const post = http.expectOne('/api/servicios');
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toMatchObject({ nombre: 'Obras civiles', slug: 'obras-civiles', imagenUrl: 'https://res.cloudinary.com/x/obras.jpg', activo: true, orden: 8 });
    post.flush({ ...service, id: 'n1' });
    const points = http.match('/api/servicios/n1/beneficios');
    expect(points.map((r) => r.request.body)).toEqual([
      { texto: 'Rápido', orden: 0, activo: true },
      { texto: 'Seguro', orden: 1, activo: true },
    ]);
    points.forEach((r) => r.flush({}));
  });

  it('removes a service from the web by deactivating it (not deleting it)', () => {
    const fixture = create('s1', 'ambos');
    (fixture.componentInstance as unknown as { remove(): void }).remove();
    const request = http.expectOne('/api/servicios/s1/activo');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ activo: false });
    request.flush(service);
  });
});
