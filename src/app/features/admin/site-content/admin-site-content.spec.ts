import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import { AdminSiteContent } from './admin-site-content';
import { ISADECOR_HOME_ENTITIES, SITE_CONTENT_ENTITIES } from './site-content.config';

describe('AdminSiteContent', () => {
  let http: HttpTestingController;

  function create(entity: string) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '' },
        { provide: ActivatedRoute, useValue: { data: of({ entity }) } },
      ],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(AdminSiteContent);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => http.verify());

  it('lists the records of the entity chosen by the route', () => {
    const fixture = create('faqs');
    http
      .expectOne('/api/faqs')
      .flush([{ id: '1', pregunta: '¿Cuánto demora?', ambito: 'HOME', activo: true, orden: 0 }]);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('¿Cuánto demora?');
  });

  it('creates a record with the required fields and the visibility flags', () => {
    const fixture = create('pasos-proceso');
    http.expectOne('/api/pasos-proceso').flush([]);
    const component = fixture.componentInstance;

    component.openNew();
    expect(component.valid()).toBe(false);
    component.set('titulo', ' Consulta ');
    component.set('texto', 'Visitamos el terreno.');
    expect(component.valid()).toBe(true);
    component.save();

    const request = http.expectOne('/api/pasos-proceso');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      activo: true,
      orden: 0,
      titulo: 'Consulta',
      texto: 'Visitamos el terreno.',
    });
    request.flush({});
    http.expectOne('/api/pasos-proceso').flush([]);
  });

  it('describes every content entity with a required title field', () => {
    for (const entity of SITE_CONTENT_ENTITIES) {
      expect(entity.fields.some((field) => field.key === entity.titleKey)).toBe(true);
    }
  });

  it('describes every ISADECOR Home entity with a title field and valid refs', () => {
    for (const entity of ISADECOR_HOME_ENTITIES) {
      expect(entity.fields.some((field) => field.key === entity.titleKey)).toBe(true);
      expect(entity.fields.filter((field) => field.type === 'ref').every((f) => f.ref)).toBe(true);
    }
  });

  it('sends the business unit and omits the order for single-record entities', () => {
    const fixture = create('isadecor-hero');
    http.expectOne('/api/unidades-negocio/activas/slug/isadecor').flush({ id: 'unit-1' });
    http.expectOne('/api/isadecor/hero').flush([]);
    const component = fixture.componentInstance;

    component.openNew();
    component.set('titulo', 'Acabados');
    component.set('subtitulo', 'Paneles y pisos');
    component.save();

    const request = http.expectOne('/api/isadecor/hero');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({
      activo: true,
      titulo: 'Acabados',
      subtitulo: 'Paneles y pisos',
      unidadNegocioId: 'unit-1',
    });
    request.flush({});
    http.expectOne('/api/isadecor/hero').flush([]);
  });

  it('saves pinned and excluded products of a section', () => {
    const fixture = create('isadecor-secciones');
    http.expectOne('/api/unidades-negocio/activas/slug/isadecor').flush({ id: 'unit-1' });
    http.expectOne('/api/productos').flush([
      { id: 'a', nombre: 'A' },
      { id: 'b', nombre: 'B' },
    ]);
    http
      .expectOne('/api/isadecor/secciones')
      .flush([{ id: 's1', titulo: 'Tienda', modo: 'MIXTO' }]);
    const component = fixture.componentInstance;

    component.openEdit(component.rows()[0]);
    http.expectOne('/api/isadecor/secciones/s1/fijados').flush([]);
    http.expectOne('/api/isadecor/secciones/s1/excluidos').flush([]);
    component.pin('a');
    component.toggleExcluded('b', true);
    expect(component.pinnable()).toEqual([]);
    component.saveSelection();

    const pinned = http.expectOne('/api/isadecor/secciones/s1/fijados');
    expect(pinned.request.method).toBe('PUT');
    expect(pinned.request.body).toEqual({ productoIds: ['a'] });
    pinned.flush([]);
    const excluded = http.expectOne('/api/isadecor/secciones/s1/excluidos');
    expect(excluded.request.body).toEqual({ productoIds: ['b'] });
    excluded.flush([]);
  });

  it('asks for confirmation in a modal before deleting a record', () => {
    const fixture = create('faqs');
    http.expectOne('/api/faqs').flush([{ id: '1', pregunta: 'Uno', activo: true, orden: 0 }]);
    const component = fixture.componentInstance;

    component.remove(component.rows()[0]);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('¿Eliminar este registro?');
    http.expectNone('/api/faqs/1');

    component.confirmRemove();
    const request = http.expectOne('/api/faqs/1');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
    http.expectOne('/api/faqs').flush([]);
  });

  it('moves a record up by swapping its order with the previous one', () => {
    const fixture = create('pasos-proceso');
    http.expectOne('/api/pasos-proceso').flush([
      { id: 'a', titulo: 'Primero', texto: 'x', activo: true, orden: 0 },
      { id: 'b', titulo: 'Segundo', texto: 'y', activo: true, orden: 1 },
    ]);
    const component = fixture.componentInstance;

    component.move(component.rows()[1], -1);

    const moved = http.expectOne('/api/pasos-proceso/b');
    const neighbor = http.expectOne('/api/pasos-proceso/a');
    expect(moved.request.method).toBe('PUT');
    expect(moved.request.body.orden).toBe(0);
    expect(neighbor.request.body.orden).toBe(1);
    moved.flush({});
    neighbor.flush({});
    http.expectOne('/api/pasos-proceso').flush([]);
  });
});
