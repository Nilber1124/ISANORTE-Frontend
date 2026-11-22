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
