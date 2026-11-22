import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { StatisticEditor, parseFigure } from './statistic-editor';

const stats = [
  { id: 's1', valor: 12, prefijo: '+', sufijo: ' años', etiqueta: 'DE EXPERIENCIA', orden: 0, activo: true },
  { id: 's2', valor: 85, prefijo: '+', sufijo: null, etiqueta: 'OBRAS ENTREGADAS', orden: 1, activo: true },
];

describe('StatisticEditor', () => {
  let http: HttpTestingController;

  function create(field: 'etiqueta' | 'valor' | 'ambos') {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '' }],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(StatisticEditor);
    fixture.componentRef.setInput('orden', 1);
    fixture.componentRef.setInput('field', field);
    fixture.detectChanges();
    http.expectOne('/api/empresa').flush([{ id: 'e1', estadisticas: stats }]);
    fixture.detectChanges();
    return fixture;
  }

  afterEach(() => http.verify());

  it('locates the statistic by its order and shows the whole figure as ONE field when the figure was tapped', () => {
    const el = create('valor').nativeElement as HTMLElement;
    expect(el.querySelectorAll('input')).toHaveLength(1);
    expect((el.querySelector('#stat-cifra') as HTMLInputElement).value).toBe('+85');
  });

  it('streams the combined figure as a live draft and saves the full statistic', () => {
    const fixture = create('ambos');
    const drafts: unknown[] = [];
    fixture.componentInstance.draftChanged.subscribe((d) => drafts.push(d));
    const c = fixture.componentInstance as unknown as { setValue(k: string, v: string): void; save(): void };
    c.setValue('cifra', '+90 obras');
    fixture.detectChanges();
    expect(drafts.at(-1)).toEqual({ valor: '+90 obras', etiqueta: 'OBRAS ENTREGADAS' });

    c.save();
    const request = http.expectOne('/api/empresa/e1/estadisticas/s2');
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual({ valor: 90, prefijo: '+', sufijo: ' obras', etiqueta: 'OBRAS ENTREGADAS', orden: 1, activo: true });
    request.flush({ ...stats[1], valor: 90 });
  });

  it('only shows the label when the label was tapped', () => {
    const fixture = create('etiqueta');
    expect((fixture.nativeElement as HTMLElement).querySelectorAll('input')).toHaveLength(1);
  });

  it('splits the typed figure into prefix, number and suffix, and refuses text without a number', () => {
    expect(parseFigure('+12 años')).toEqual({ prefijo: '+', valor: 12, sufijo: ' años' });
    expect(parseFigure('38 mil m²')).toEqual({ prefijo: null, valor: 38, sufijo: ' mil m²' });
    expect(parseFigure('6')).toEqual({ prefijo: null, valor: 6, sufijo: null });
    expect(parseFigure('S/ 1,5 M')).toEqual({ prefijo: 'S/', valor: 1.5, sufijo: ' M' });
    expect(parseFigure('muchos')).toBeNull();
    expect(parseFigure('')).toBeNull();
  });
});
