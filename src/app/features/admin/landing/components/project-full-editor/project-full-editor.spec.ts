import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { ProjectFullEditor } from './project-full-editor';

const project = { id: 'p1', nombre: 'Casa', slug: 'casa', descripcion: 'D', orden: 4, servicios: [] };

describe('ProjectFullEditor', () => {
  let http: HttpTestingController;

  function create(id: string) {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_BASE_URL, useValue: '' }],
    });
    http = TestBed.inject(HttpTestingController);
    const fixture = TestBed.createComponent(ProjectFullEditor);
    fixture.componentRef.setInput('projectId', id);
    fixture.detectChanges();
    http.expectOne('/api/proyectos').flush([project]);
    http.expectOne('/api/servicios').flush([]);
    fixture.detectChanges();
    return fixture;
  }
  afterEach(() => http?.verify());

  it('opens the full project form (with tabs) to edit an existing project', () => {
    const el = create('p1').nativeElement as HTMLElement;
    expect(el.querySelector('#project-form')).toBeTruthy();
    expect(el.querySelectorAll('[role=tab]')).toHaveLength(3);
    expect((el.querySelector('#project-name') as HTMLInputElement).value).toBe('Casa');
  });

  it('opens an empty form for a new project, ordered at the end, without tabs', () => {
    const el = create('new').nativeElement as HTMLElement;
    expect(el.querySelectorAll('[role=tab]')).toHaveLength(0);
    expect((el.querySelector('#project-order') as HTMLInputElement).value).toBe('5');
  });

  it('saves an edit with PUT and reports it', () => {
    const fixture = create('p1');
    const saved = vi.fn();
    fixture.componentInstance.saved.subscribe(saved);
    (fixture.componentInstance as unknown as { save(s: unknown): void }).save({ mode: 'edit', request: { nombre: 'Casa 2' } });
    const put = http.expectOne('/api/proyectos/p1');
    expect(put.request.method).toBe('PUT');
    put.flush({});
    expect(saved).toHaveBeenCalled();
  });
});
