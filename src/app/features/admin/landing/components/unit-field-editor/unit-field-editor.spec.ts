import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { UnitFieldEditor } from './unit-field-editor';

const unit = {
  id: 'u1', nombre: 'ISADECOR', slug: 'isadecor', descripcion: 'La línea de acabados.', icono: null, imagenUrl: null,
  imagenAlt: null, ofertas: 'Mobiliario a medida | Cocinas y closets', activo: true, destacado: true, orden: 1,
  empresa: { id: 'e1' },
};

describe('UnitFieldEditor', () => {
  let http: HttpTestingController;

  function create(field: 'descripcion' | 'ofertas' | 'ambos') {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '' }],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(UnitFieldEditor);
    fixture.componentRef.setInput('unitSlug', 'isadecor');
    fixture.componentRef.setInput('field', field);
    fixture.detectChanges();
    http.expectOne('/api/unidades-negocio/slug/isadecor').flush(unit);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => http.verify());

  it('shows the offers one per line', () => {
    const el = create('ofertas').nativeElement as HTMLElement;
    expect((el.querySelector('textarea') as HTMLTextAreaElement).value).toBe('Mobiliario a medida\nCocinas y closets');
  });

  it('saves the offers joined with the separator and keeps the rest of the unit', () => {
    const fixture = create('ambos');
    const c = fixture.componentInstance as unknown as { ofertasText: { set(v: string): void }; saveBoth(): void };
    c.ofertasText.set('Pisos y acabados\n\n  Cocinas y closets  \nRevestimientos');
    fixture.detectChanges();
    c.saveBoth();
    const request = http.expectOne('/api/unidades-negocio/u1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      nombre: 'ISADECOR', slug: 'isadecor', descripcion: 'La línea de acabados.', icono: null, imagenUrl: null,
      imagenAlt: null, ofertas: 'Pisos y acabados | Cocinas y closets | Revestimientos', activo: true,
      destacado: true, orden: 1, empresaId: 'e1',
    });
    request.flush(unit);
  });

  it('only streams the description as a live draft (the offers are a list)', () => {
    const fixture = create('ambos');
    const drafts: unknown[] = [];
    fixture.componentInstance.draftChanged.subscribe((d) => drafts.push(d));
    const c = fixture.componentInstance as unknown as { descripcionText: { set(v: string): void }; ofertasText: { set(v: string): void } };
    c.ofertasText.set('Otro punto');
    fixture.detectChanges();
    expect(drafts.at(-1) ?? null).toBeNull();
    c.descripcionText.set('Nueva descripción');
    fixture.detectChanges();
    expect(drafts.at(-1)).toEqual({ descripcion: 'Nueva descripción' });
  });
});
