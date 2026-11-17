import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import { Policy } from './policy';

describe('Policy', () => {
  function create(slug: string) {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: API_BASE_URL, useValue: '' },
        { provide: ActivatedRoute, useValue: { paramMap: of(new Map([['slug', slug]])) } },
      ],
    });
    const http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(Policy);
    fixture.detectChanges();
    return { http, fixture };
  }

  const trust = {
    faqs: [],
    equipo: [],
    credenciales: [],
    testimonios: [],
    garantias: [],
    pasos: [],
    galeria: [],
    politicas: [
      {
        slug: 'privacidad',
        titulo: 'Política de privacidad',
        contenido: '1. Uso\nSolo para responder.\n\nTexto suelto.',
      },
    ],
  };

  it('shows the policy text from the API with numbered lines as subtitles', () => {
    const { http, fixture } = create('privacidad');
    http.expectOne('/api/publico/sitios/isanorte/confianza').flush(trust);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('h1')?.textContent).toContain('Política de privacidad');
    expect(element.querySelector('h2')?.textContent).toContain('1. Uso');
    expect(element.textContent).toContain('Texto suelto.');
  });

  it('says the document is not available when the slug does not exist', () => {
    const { http, fixture } = create('otra');
    http.expectOne('/api/publico/sitios/isanorte/confianza').flush(trust);
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Texto no disponible');
  });
});
