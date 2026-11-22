import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { ProjectTestimonialManager } from './project-testimonial-manager';

const t = (id: string, slug: string | null, orden = 0) => ({
  id, autor: 'Roberto', cargo: 'Administrador', texto: 'Muy bien', proyectoSlug: slug, fotoUrl: 'f.jpg', fotoAlt: 'F', activo: true, orden,
});

describe('ProjectTestimonialManager', () => {
  let http: HttpTestingController;

  function create() {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '' }],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ProjectTestimonialManager);
    fixture.componentRef.setInput('slug', 'casa');
    fixture.detectChanges();
    http.expectOne('/api/testimonios').flush([t('1', 'casa', 0), t('2', 'otro', 4), t('3', null, 5)]);
    fixture.detectChanges();
    return fixture;
  }
  type Api = { startNew(): void; startEdit(x: unknown): void; set(k: string, v: string): void; save(): void; remove(x: unknown): void };
  afterEach(() => http?.verify());

  it('lists only the testimonial linked to this project', () => {
    const el = create().nativeElement as HTMLElement;
    expect(el.querySelectorAll('[data-project-testimonial-item]')).toHaveLength(1);
  });

  it('creates a testimonial linked to the project and ordered at the end', () => {
    const fixture = create();
    const c = fixture.componentInstance as unknown as Api;
    c.startNew();
    c.set('autor', 'Ana');
    c.set('texto', 'Excelente');
    c.save();
    const post = http.expectOne('/api/testimonios');
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toMatchObject({ autor: 'Ana', texto: 'Excelente', cargo: null, proyectoSlug: 'casa', activo: true, orden: 6 });
    post.flush(t('n', 'casa'));
    http.expectOne('/api/testimonios').flush([]);
  });

  it('edits keeping photo and order, and deletes', () => {
    const fixture = create();
    const c = fixture.componentInstance as unknown as Api;
    c.startEdit(t('1', 'casa'));
    c.set('texto', 'Mejor aún');
    c.save();
    const put = http.expectOne('/api/testimonios/1');
    expect(put.request.body).toMatchObject({ texto: 'Mejor aún', fotoUrl: 'f.jpg', orden: 0, proyectoSlug: 'casa' });
    put.flush({});
    http.expectOne('/api/testimonios').flush([]);
    c.remove(t('1', 'casa'));
    expect(http.expectOne('/api/testimonios/1').request.method).toBe('DELETE');
  });
});
