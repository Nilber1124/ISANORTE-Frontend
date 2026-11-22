import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { ProjectGalleryManager } from './project-gallery-manager';

const photo = (id: string, orden: number, slug = 'casa', etiqueta = 'ANTES') => ({
  id, proyectoSlug: slug, url: `${id}.jpg`, alt: null, etiqueta, activo: true, orden,
});

describe('ProjectGalleryManager', () => {
  let http: HttpTestingController;

  function create() {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '' }],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ProjectGalleryManager);
    fixture.componentRef.setInput('slug', 'casa');
    fixture.componentRef.setInput('projectName', 'Casa');
    fixture.detectChanges();
    http.expectOne('/api/proyecto-galeria').flush([photo('b', 1), photo('a', 0), photo('x', 0, 'otro')]);
    fixture.detectChanges();
    return fixture;
  }
  type Api = { move(p: unknown, d: -1 | 1): void; changeStage(p: unknown, e: string): void; add(): void; newUrl: { set(v: string): void } };
  afterEach(() => http?.verify());

  it('shows only the photos of this project, in order', () => {
    const el = create().nativeElement as HTMLElement;
    const imgs = Array.from(el.querySelectorAll('[data-gallery-photo] img')).map((i) => i.getAttribute('src'));
    expect(imgs).toEqual(['a.jpg', 'b.jpg']);
  });

  it('adds a photo at the end linked to the project slug', () => {
    const fixture = create();
    const c = fixture.componentInstance as unknown as Api;
    c.newUrl.set('https://res.cloudinary.com/x/nueva.jpg');
    c.add();
    const post = http.expectOne('/api/proyecto-galeria');
    expect(post.request.method).toBe('POST');
    expect(post.request.body).toMatchObject({ proyectoSlug: 'casa', url: 'https://res.cloudinary.com/x/nueva.jpg', etiqueta: 'PROCESO', orden: 2, activo: true });
    post.flush(photo('n', 2));
    http.expectOne('/api/proyecto-galeria').flush([]);
  });

  it('changes the stage and swaps the order with the neighbour', () => {
    const fixture = create();
    const c = fixture.componentInstance as unknown as Api;
    c.changeStage(photo('a', 0), 'FINAL');
    const put = http.expectOne('/api/proyecto-galeria/a');
    expect(put.request.body).toMatchObject({ etiqueta: 'FINAL', orden: 0, proyectoSlug: 'casa' });
    put.flush({});
    http.expectOne('/api/proyecto-galeria').flush([photo('b', 1), photo('a', 0)]);

    c.move(photo('a', 0), 1);
    expect(http.expectOne('/api/proyecto-galeria/a').request.body.orden).toBe(1);
    expect(http.expectOne('/api/proyecto-galeria/b').request.body.orden).toBe(0);
  });
});
