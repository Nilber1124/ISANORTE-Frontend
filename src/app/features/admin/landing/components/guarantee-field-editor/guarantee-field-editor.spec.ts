import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { GuaranteeFieldEditor } from './guarantee-field-editor';

const list = [
  { id: 'g0', titulo: 'Otra', texto: 'x', enHero: false, orden: 0, activo: true },
  { id: 'g1', titulo: 'Plazos acordados', texto: 'Cronograma firmado.', enHero: true, orden: 3, activo: true },
];

describe('GuaranteeFieldEditor', () => {
  let http: HttpTestingController;

  function create(field: 'titulo' | 'texto' | 'ambos') {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '' }],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(GuaranteeFieldEditor);
    fixture.componentRef.setInput('guaranteeId', 'g1');
    fixture.componentRef.setInput('field', field);
    fixture.detectChanges();
    http.expectOne('/api/garantias').flush(list);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => http.verify());

  it('shows only the tapped field of the right guarantee', () => {
    const el = create('texto').nativeElement as HTMLElement;
    expect(el.querySelectorAll('input, textarea')).toHaveLength(1);
    expect((el.querySelector('textarea') as HTMLTextAreaElement).value).toBe('Cronograma firmado.');
  });

  it('saves both fields keeping the rest of the guarantee', () => {
    const fixture = create('ambos');
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('input, textarea')).toHaveLength(2);
    const c = fixture.componentInstance as unknown as { textoText: { set(v: string): void }; saveBoth(): void };
    c.textoText.set('Cronograma firmado y reportes.');
    fixture.detectChanges();
    c.saveBoth();
    const request = http.expectOne('/api/garantias/g1');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({
      titulo: 'Plazos acordados', texto: 'Cronograma firmado y reportes.', enHero: true, orden: 3, activo: true,
    });
    request.flush({ ...list[1], texto: 'Cronograma firmado y reportes.' });
  });
});
