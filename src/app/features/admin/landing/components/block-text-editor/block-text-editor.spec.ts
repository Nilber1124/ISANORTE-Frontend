import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { BlockTextEditor } from './block-text-editor';

describe('BlockTextEditor', () => {
  let http: HttpTestingController;

  function create(rows: unknown[], field: 'etiqueta' | 'titulo' | 'subtitulo' = 'titulo') {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '' }],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(BlockTextEditor);
    fixture.componentRef.setInput('blockKey', 'garantias');
    fixture.componentRef.setInput('field', field);
    fixture.detectChanges();
    http.expectOne('/api/textos-bloque').flush(rows);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => http.verify());

  it('starts from the default text when the block has nothing saved', () => {
    const el = create([]).nativeElement as HTMLElement;
    expect((el.querySelector('textarea') as HTMLTextAreaElement).value).toBe('Por qué elegir a ISANORTE');
  });

  it('starts from the saved text and saves keeping the other texts of the block', () => {
    const saved = { clave: 'garantias', etiqueta: 'Compromiso', titulo: 'Guardado', subtitulo: null };
    const fixture = create([saved]);
    const el = fixture.nativeElement as HTMLElement;
    expect((el.querySelector('textarea') as HTMLTextAreaElement).value).toBe('Guardado');

    (fixture.componentInstance as unknown as { save(v: string): void }).save('Nuevo título');
    const request = http.expectOne('/api/textos-bloque/garantias');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ etiqueta: 'Compromiso', titulo: 'Nuevo título', subtitulo: null });
    request.flush({ ...saved, titulo: 'Nuevo título' });
  });
});
