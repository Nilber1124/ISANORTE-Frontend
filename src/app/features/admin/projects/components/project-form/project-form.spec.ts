import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProjectResponse } from '../../../../../data/models/project/project-response.model';
import { ServiceResponse } from '../../../../../data/models/service/service-response.model';
import { ProjectForm, ProjectFormSubmission } from './project-form';

const services: ServiceResponse[] = [
  {
    id: 'service-1',
    nombre: 'Arquitectura',
    slug: 'arquitectura',
    resumen: null,
    descripcion: 'Diseño',
    imagenUrl: null,
    etiqueta: null,
    imagenAlt: null,
    activo: true,
    destacado: false,
    orden: 1,
    beneficios: [],
    fechaCreacion: null,
    fechaActualizacion: null,
  },
  {
    id: 'service-2',
    nombre: 'Construcción',
    slug: 'construccion',
    resumen: null,
    descripcion: 'Obra',
    imagenUrl: null,
    etiqueta: null,
    imagenAlt: null,
    activo: true,
    destacado: false,
    orden: 2,
    beneficios: [],
    fechaCreacion: null,
    fechaActualizacion: null,
  },
];
const project: ProjectResponse = {
  id: 'project-1',
  nombre: 'Residencial',
  slug: 'residencial',
  cliente: null,
  ubicacion: null,
  fechaProyecto: 'Año 2026',
  descripcion: 'Proyecto',
  destacado: true,
  activo: false,
  orden: 0,
  servicios: [{ id: services[0].id, nombre: services[0].nombre, slug: services[0].slug }],
  imagenUrl: 'https://images.unsplash.com/photo-1.jpg',
  imagenAlt: 'Foto representativa',
  fechaCreacion: null,
  fechaActualizacion: null,
};

describe('ProjectForm', () => {
  async function createFixture(
    mode: 'create' | 'edit',
    value: ProjectResponse | null = null,
  ): Promise<ComponentFixture<ProjectForm>> {
    await TestBed.configureTestingModule({ imports: [ProjectForm] }).compileComponents();
    const fixture = TestBed.createComponent(ProjectForm);
    fixture.componentRef.setInput('mode', mode);
    fixture.componentRef.setInput('project', value);
    fixture.componentRef.setInput('services', services);
    fixture.detectChanges();
    return fixture;
  }

  it('keeps fechaProyecto as a text input and validates required fields', async () => {
    const fixture = await createFixture('create');
    expect(
      ((fixture.nativeElement as HTMLElement).querySelector('#project-date') as HTMLInputElement)
        .type,
    ).toBe('text');
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Crear proyecto'))
      ?.click();
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Ingresa el nombre');
  });

  it('preselects services, featured and active independently when editing', async () => {
    const fixture = await createFixture('edit', project);
    const element = fixture.nativeElement as HTMLElement;
    const checkboxes = Array.from(
      element.querySelectorAll<HTMLInputElement>('input[type="checkbox"]'),
    );
    expect(checkboxes[0].checked).toBe(true);
    expect(checkboxes.at(-2)?.checked).toBe(true);
    expect(checkboxes.at(-1)?.checked).toBe(false);
  });

  it('emits service UUIDs, imagenUrl and imagenAlt on update', async () => {
    const fixture = await createFixture('edit', project);
    let submission: ProjectFormSubmission | undefined;
    fixture.componentInstance.saved.subscribe((value) => (submission = value));
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Guardar cambios'))
      ?.click();
    expect(submission?.mode).toBe('edit');
    if (submission?.mode === 'edit') {
      expect(submission.request.servicioIds).toEqual([services[0].id]);
      expect(submission.request.imagenUrl).toBe('https://images.unsplash.com/photo-1.jpg');
      expect(submission.request.imagenAlt).toBe('Foto representativa');
      expect(submission.request.fechaProyecto).toBe('Año 2026');
    }
  });
});
