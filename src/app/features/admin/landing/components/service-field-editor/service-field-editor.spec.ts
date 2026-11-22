import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { ServiceFieldEditor } from './service-field-editor';

const service = {
  id: 's1',
  nombre: 'Remodelaciones',
  slug: 'remodelaciones',
  resumen: 'Renovamos viviendas.',
  descripcion: 'Detalle largo',
  imagenUrl: null,
  etiqueta: null,
  imagenAlt: null,
  activo: true,
  destacado: false,
  orden: 5,
  beneficios: [],
};

describe('ServiceFieldEditor', () => {
  let http: HttpTestingController;

  function create(field: 'nombre' | 'resumen' | 'ambos') {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '' }],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ServiceFieldEditor);
    fixture.componentRef.setInput('serviceSlug', 'remodelaciones');
    fixture.componentRef.setInput('field', field);
    fixture.detectChanges();
    http.expectOne('/api/servicios/slug/remodelaciones').flush(service);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => http.verify());

  it('shows only the tapped field of the service', () => {
    const fixture = create('resumen');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Remodelaciones · Descripción corta');
    expect(el.querySelectorAll('textarea, input')).toHaveLength(1);
    expect((el.querySelector('textarea') as HTMLTextAreaElement).value).toBe('Renovamos viviendas.');
  });

  it('saves the whole service unchanged except the edited field', () => {
    const fixture = create('nombre');
    const saved: number[] = [];
    fixture.componentInstance.saved.subscribe(() => saved.push(1));

    (fixture.componentInstance as unknown as { save(v: string): void }).save('Remodelación y ampliación');
    const request = http.expectOne('/api/servicios/s1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      nombre: 'Remodelación y ampliación',
      slug: 'remodelaciones',
      resumen: 'Renovamos viviendas.',
      descripcion: 'Detalle largo',
      imagenUrl: null,
      etiqueta: null,
      imagenAlt: null,
      activo: true,
      destacado: false,
      orden: 5,
    });
    request.flush({ ...service, nombre: 'Remodelación y ampliación' });
    expect(saved).toHaveLength(1);
  });

  it('shows name and short description together when the card itself was tapped', () => {
    const fixture = create('ambos');
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('input, textarea')).toHaveLength(2);
    const drafts: unknown[] = [];
    fixture.componentInstance.draftChanged.subscribe((d) => drafts.push(d));
    (fixture.componentInstance as unknown as { resumenText: { set(v: string): void } }).resumenText.set('Nuevo resumen');
    fixture.detectChanges();
    expect(drafts.at(-1)).toEqual({ nombre: 'Remodelaciones', resumen: 'Nuevo resumen' });

    (fixture.componentInstance as unknown as { saveBoth(): void }).saveBoth();
    const request = http.expectOne('/api/servicios/s1');
    expect(request.request.body).toMatchObject({ nombre: 'Remodelaciones', resumen: 'Nuevo resumen', slug: 'remodelaciones' });
    request.flush({ ...service, resumen: 'Nuevo resumen' });
  });
});
