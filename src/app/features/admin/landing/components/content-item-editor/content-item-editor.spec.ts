import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { ContentItemEditor } from './content-item-editor';

const list = [
  { id: 't0', autor: 'Otra', cargo: null, texto: 'x', proyectoSlug: null, fotoUrl: null, fotoAlt: null, activo: true, orden: 0 },
  { id: 't1', autor: 'Ana Lucía', cargo: 'Empresaria', texto: 'Remodelaron la casona.', proyectoSlug: 'casona', fotoUrl: null, fotoAlt: null, activo: true, orden: 2, fechaCreacion: '2026-01-01' },
];

describe('ContentItemEditor', () => {
  let http: HttpTestingController;

  function create(kind: string, field: string) {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '' }],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ContentItemEditor);
    fixture.componentRef.setInput('kind', kind);
    fixture.componentRef.setInput('itemId', 't1');
    fixture.componentRef.setInput('field', field);
    fixture.detectChanges();
    http.expectOne('/api/testimonios').flush(list);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => http.verify());

  it('shows only the tapped field of the right testimonial', () => {
    const el = create('testimonio', 'autor').nativeElement as HTMLElement;
    expect(el.querySelectorAll('input, textarea')).toHaveLength(1);
    expect((el.querySelector('input') as HTMLInputElement).value).toBe('Ana Lucía');
    expect(el.textContent).toContain('Testimonio · Nombre');
  });

  it('shows all the texts when the card was tapped and saves keeping the rest of the record', () => {
    const fixture = create('testimonio', 'ambos');
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('input, textarea')).toHaveLength(3);
    const c = fixture.componentInstance as unknown as { setValue(k: string, v: string): void; saveAll(): void };
    c.setValue('cargo', 'Empresaria · Cajamarca');
    fixture.detectChanges();
    c.saveAll();
    const request = http.expectOne('/api/testimonios/t1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      autor: 'Ana Lucía', cargo: 'Empresaria · Cajamarca', texto: 'Remodelaron la casona.',
      proyectoSlug: 'casona', fotoUrl: null, fotoAlt: null, activo: true, orden: 2,
    });
    request.flush({ ...list[1], cargo: 'Empresaria · Cajamarca' });
  });
});

describe('ContentItemEditor · contenido de página', () => {
  it('localiza el contenido por página (no por id) y guarda conservando el resto', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '' }],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ContentItemEditor);
    fixture.componentRef.setInput('kind', 'pagina');
    fixture.componentRef.setInput('itemId', 'NOSOTROS');
    fixture.componentRef.setInput('field', 'introduccion');
    fixture.detectChanges();
    const nosotros = { id: 'c2', configuracionSitioId: 's1', pagina: 'NOSOTROS', eyebrow: null, titulo: 'Titulo', introduccion: 'Intro', descripcion: 'Desc', imagenUrl: null, imagenAlt: null, imagenFondoUrl: null, activo: true, tags: ['A'] };
    http.expectOne('/api/contenidos-pagina').flush([{ ...nosotros, id: 'c1', pagina: 'CONTACTO' }, nosotros]);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('textarea')?.value).toBe('Intro');

    (fixture.componentInstance as unknown as { saveSingle(v: string): void }).saveSingle('Nueva intro');
    const request = http.expectOne('/api/contenidos-pagina/c2');
    expect(request.request.body).toMatchObject({ introduccion: 'Nueva intro', titulo: 'Titulo', tags: ['A'], pagina: 'NOSOTROS', activo: true });
    request.flush({ ...nosotros, introduccion: 'Nueva intro' });
    http.verify();
  });
});

describe('ContentItemEditor · empresa', () => {
  it('muestra los valores uno por línea, guarda unidos y solo envía los campos de la empresa', () => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '' }],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ContentItemEditor);
    fixture.componentRef.setInput('kind', 'empresa');
    fixture.componentRef.setInput('itemId', '*');
    fixture.componentRef.setInput('field', 'valores');
    fixture.detectChanges();
    const company = {
      id: 'e1', razonSocial: 'ISANORTE SAC', nombreComercial: 'ISANORTE', ruc: '1', direccion: null, ciudad: null, telefono: null,
      telefonoSecundario: null, email: null, emailVentas: null, whatsapp: null, horarioAtencion: null, anioFundacion: 2012,
      zonaCobertura: 'Cajamarca', tiempoRespuesta: null, latitud: null, longitud: null, mision: 'm', vision: 'v',
      valores: 'Seguridad | Costos', resumenNosotros: null, redesSociales: [{ id: 'r1' }], estadisticas: [{ id: 's1' }],
    };
    http.expectOne('/api/empresa').flush([company]);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect((el.querySelector('textarea') as HTMLTextAreaElement).value).toBe('Seguridad\nCostos');

    (fixture.componentInstance as unknown as { saveSingle(v: string): void }).saveSingle('Seguridad\n\nPlazos\nComunidad');
    const request = http.expectOne('/api/empresa/e1');
    expect(request.request.body.valores).toBe('Seguridad | Plazos | Comunidad');
    expect(request.request.body.anioFundacion).toBe(2012);
    expect(request.request.body.redesSociales).toBeUndefined();
    expect(request.request.body.estadisticas).toBeUndefined();
    request.flush(company);
    http.verify();
  });
});

describe('ContentItemEditor · equipo y credenciales', () => {
  function setup(kind: string, itemId: string, field: string, endpoint: string, list: unknown[]) {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '' }],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ContentItemEditor);
    fixture.componentRef.setInput('kind', kind);
    fixture.componentRef.setInput('itemId', itemId);
    fixture.componentRef.setInput('field', field);
    fixture.detectChanges();
    http.expectOne(`/api/${endpoint}`).flush(list);
    fixture.detectChanges();
    return { http, fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('creates a team member at the end of the list with the filled fields', () => {
    const { http, fixture, el } = setup('miembro', 'new', 'ambos', 'equipo', [{ id: 'a', orden: 0 }, { id: 'b', orden: 3 }]);
    expect(el.textContent).toContain('Nuevo · Miembro del equipo');
    const c = fixture.componentInstance as unknown as { setValue(k: string, v: string): void; saveAll(): void };
    c.setValue('nombre', 'Ing. Ana Pérez');
    c.setValue('cargo', 'Residente');
    fixture.detectChanges();
    const saved: number[] = [];
    fixture.componentInstance.closed.subscribe(() => saved.push(1));
    c.saveAll();
    const request = http.expectOne('/api/equipo');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toMatchObject({ nombre: 'Ing. Ana Pérez', cargo: 'Residente', activo: true, orden: 4, especialidad: null, fotoUrl: null });
    request.flush({ id: 'n' });
    expect(saved).toHaveLength(1);
    http.verify();
  });

  it('does not create a credential until the required fields are filled, and starts with a type', () => {
    const { http, fixture } = setup('credencial', 'new', 'ambos', 'credenciales', []);
    const c = fixture.componentInstance as unknown as { values(): Record<string, string>; invalid(): boolean };
    expect(c.values()['tipo']).toBe('LICENCIA');
    expect(c.invalid()).toBe(true);
    http.verify();
  });

  it('deletes a member only after confirming', () => {
    const member = { id: 'm1', nombre: 'Carlos', cargo: 'Gerente', especialidad: null, biografia: null, fotoUrl: null, fotoAlt: null, activo: true, orden: 0 };
    const { http, fixture, el } = setup('miembro', 'm1', 'fotoUrl', 'equipo', [member]);
    expect(el.textContent).toContain('Foto');
    const c = fixture.componentInstance as unknown as { confirmDelete: { set(v: boolean): void }; remove(): void };
    http.expectNone('/api/equipo/m1');
    c.confirmDelete.set(true);
    fixture.detectChanges();
    expect(el.textContent).toContain('¿Eliminar este elemento?');
    c.remove();
    const request = http.expectOne('/api/equipo/m1');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
    http.verify();
  });
});
