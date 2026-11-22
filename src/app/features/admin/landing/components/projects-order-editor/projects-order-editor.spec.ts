import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { ProjectsOrderEditor } from './projects-order-editor';

const project = (id: string, nombre: string, orden: number, destacado: boolean) => ({
  id, nombre, slug: nombre.toLowerCase(), cliente: null, ubicacion: 'Cajamarca', fechaProyecto: '2024-01-01',
  descripcion: 'd', imagenUrl: null, imagenAlt: null, destacado, activo: true, orden,
  servicios: [{ id: 's1', nombre: 'Obra', slug: 'obra' }],
});
const list = [project('a', 'A', 0, true), project('b', 'B', 1, true), project('c', 'C', 2, false)];

describe('ProjectsOrderEditor', () => {
  let http: HttpTestingController;

  function create() {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '' }],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ProjectsOrderEditor);
    http.expectOne('/api/proyectos').flush(list);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => http.verify());

  it('lists what the Home shows, in order, and what it does not', () => {
    const el = create().nativeElement as HTMLElement;
    const text = el.textContent ?? '';
    expect(text).toContain('Se muestran');
    expect(text).toContain('No se muestran');
    expect(text.indexOf('A')).toBeLessThan(text.indexOf('B'));
    expect(el.textContent).toContain('Mostrar en la Home');
  });

  it('swaps the order of two shown projects keeping the rest of each project', () => {
    const fixture = create();
    (fixture.componentInstance as unknown as { move(i: number, d: 1 | -1): void }).move(0, 1);
    const requests = http.match('/api/proyectos/a').concat(http.match('/api/proyectos/b'));
    expect(requests).toHaveLength(2);
    const byId = Object.fromEntries(requests.map((r) => [r.request.url, r.request.body]));
    expect(byId['/api/proyectos/a'].orden).toBe(1);
    expect(byId['/api/proyectos/b'].orden).toBe(0);
    expect(byId['/api/proyectos/a'].servicioIds).toEqual(['s1']);
    expect(byId['/api/proyectos/a'].destacado).toBe(true);
    requests[0].flush({ ...list[0], orden: 1 });
    requests[1].flush({ ...list[1], orden: 0 });
  });

  it('shows a hidden project by marking it featured and putting it last', () => {
    const fixture = create();
    (fixture.componentInstance as unknown as { toggle(p: unknown): void }).toggle(list[2]);
    const request = http.expectOne('/api/proyectos/c');
    expect(request.request.body).toMatchObject({ destacado: true, orden: 2 });
    request.flush({ ...list[2], destacado: true, orden: 2 });
  });
});
