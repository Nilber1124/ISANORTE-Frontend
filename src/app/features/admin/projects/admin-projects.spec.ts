import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ProjectResponse } from '../../../data/models/project/project-response.model';
import { ServiceResponse } from '../../../data/models/service/service-response.model';
import { AdminProjects } from './admin-projects';
import { AdminProjectsFacade, ProjectFormMode } from './admin-projects.facade';

const project: ProjectResponse = {
  id: 'project-1',
  nombre: 'Residencial',
  slug: 'residencial',
  cliente: 'Cliente',
  ubicacion: 'Cajamarca',
  fechaProyecto: '2026',
  descripcion: 'Proyecto',
  destacado: true,
  activo: true,
  orden: 1,
  servicios: [{ id: 'service-1', nombre: 'Arquitectura', slug: 'arquitectura' }],
  imagenUrl: null,
  imagenAlt: null,
  fechaCreacion: null,
  fechaActualizacion: null,
};

class FacadeStub {
  readonly projects = signal<readonly ProjectResponse[]>([project]);
  readonly services = signal<readonly ServiceResponse[]>([]);
  readonly loading = signal(false);
  readonly loadingFormData = signal(false);
  readonly submitting = signal(false);
  readonly changingActiveId = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly selectedProject = signal<ProjectResponse | null>(null);
  readonly formMode = signal<ProjectFormMode>('create');
  readonly formOpen = signal(false);
  createCalls = 0;
  edits: ProjectResponse[] = [];
  activeChanges: ProjectResponse[] = [];
  load(): void {}
  openCreate(): void {
    this.createCalls += 1;
  }
  openEdit(value: ProjectResponse): void {
    this.edits.push(value);
  }
  closeForm(): void {}
  create(): void {}
  update(): void {}
  changeActive(value: ProjectResponse): void {
    this.activeChanges.push(value);
  }
  clearFeedback(): void {}
}

describe('AdminProjects', () => {
  let fixture: ComponentFixture<AdminProjects>;
  let facade: FacadeStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProjects],
      providers: [provideRouter([])],
    })
      .overrideComponent(AdminProjects, {
        set: { providers: [{ provide: AdminProjectsFacade, useClass: FacadeStub }] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(AdminProjects);
    facade = fixture.debugElement.injector.get(AdminProjectsFacade) as unknown as FacadeStub;
    fixture.detectChanges();
  });

  it('renders the project table, independent featured and active states', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('table caption')?.textContent).toContain('Listado administrativo');
    expect(element.textContent).toContain('Residencial');
    expect(element.textContent).toContain('Arquitectura');
    expect(element.textContent).toContain('Sí');
    expect(element.textContent).toContain('Activo');
  });

  it('shows EmptyState and opens a new project', () => {
    facade.projects.set([]);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No hay proyectos registrados',
    );
    const button = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((item) => item.textContent?.includes('Nuevo proyecto'));
    button?.click();
    expect(facade.createCalls).toBe(1);
  });

  it('opens editing for the selected project', () => {
    const element = fixture.nativeElement as HTMLElement;
    Array.from(element.querySelectorAll('button'))
      .find((item) => item.textContent?.includes('Editar'))
      ?.click();
    expect(facade.edits).toEqual([project]);
  });

  it('requires confirmation before deactivating', () => {
    const button = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((item) => item.textContent?.includes('Desactivar'));
    button?.click();
    fixture.detectChanges();
    expect(facade.activeChanges).toEqual([]);
    const confirm = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .filter((item) => item.textContent?.includes('Desactivar'))
      .at(-1);
    confirm?.click();
    expect(facade.activeChanges).toEqual([project]);
  });
});
