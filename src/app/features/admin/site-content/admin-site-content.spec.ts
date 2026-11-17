import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import { AdminSiteContent } from './admin-site-content';
import { SITE_CONTENT_ENTITIES } from './site-content.config';

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
    http.expectOne('/api/faqs').flush([
      { id: '1', pregunta: '¿Cuánto demora?', ambito: 'HOME', activo: true, orden: 0 },
    ]);
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
});
