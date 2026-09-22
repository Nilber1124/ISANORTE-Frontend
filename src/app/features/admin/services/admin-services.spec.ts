import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceResponse } from '../../../data/models/service/service-response.model';
import { AdminServices } from './admin-services';
import { AdminServicesFacade, ServiceFormMode } from './admin-services.facade';

const service: ServiceResponse = {
  id: 'service-1',
  nombre: 'Arquitectura',
  slug: 'arquitectura',
  resumen: 'Diseño y planificación',
  descripcion: 'Descripción',
  imagenUrl: null,
  etiqueta: null,
  imagenAlt: null,
  activo: true,
  destacado: true,
  orden: 1,
  beneficios: [],
  fechaCreacion: null,
  fechaActualizacion: null,
};

class FacadeStub {
  readonly services = signal<readonly ServiceResponse[]>([service]);
  readonly loading = signal(false);
  readonly submitting = signal(false);
  readonly changingActiveId = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly selectedService = signal<ServiceResponse | null>(null);
  readonly formMode = signal<ServiceFormMode>('create');
  readonly formOpen = signal(false);
  readonly managedService = signal<ServiceResponse | null>(null);
  readonly childSaving = signal(false);
  createCalls = 0;
  edits: ServiceResponse[] = [];
  activeChanges: Array<{ service: ServiceResponse; active: boolean }> = [];
  load(): void {}
  openCreate(): void {
    this.createCalls += 1;
  }
  openEdit(value: ServiceResponse): void {
    this.edits.push(value);
  }
  closeForm(): void {}
  create(): void {}
  update(): void {}
  changeActive(value: ServiceResponse, active: boolean): void {
    this.activeChanges.push({ service: value, active });
  }
  clearFeedback(): void {}
  openBenefits(): void {}
  closeBenefits(): void {}
  saveBenefit(): void {}
  deleteBenefit(): void {}
}

describe('AdminServices', () => {
  let fixture: ComponentFixture<AdminServices>;
  let facade: FacadeStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AdminServices] })
      .overrideComponent(AdminServices, {
        set: { providers: [{ provide: AdminServicesFacade, useClass: FacadeStub }] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(AdminServices);
    facade = fixture.debugElement.injector.get(AdminServicesFacade) as unknown as FacadeStub;
    fixture.detectChanges();
  });

  it('renders the semantic table with order, featured and active states', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('table caption')?.textContent).toContain('Listado administrativo');
    expect(element.textContent).toContain('Arquitectura');
    expect(element.textContent).toContain('arquitectura');
    expect(element.textContent).toContain('Sí');
    expect(element.textContent).toContain('Activo');
  });

  it('shows EmptyState and opens creation', () => {
    facade.services.set([]);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No hay servicios registrados',
    );
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Nuevo servicio'))
      ?.click();
    expect(facade.createCalls).toBe(1);
  });

  it('opens editing from a real button', () => {
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Editar'))
      ?.click();
    expect(facade.edits).toEqual([service]);
  });

  it('requires confirmation before deactivating', () => {
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Desactivar'))
      ?.click();
    fixture.detectChanges();
    expect(facade.activeChanges).toEqual([]);
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .filter((button) => button.textContent?.includes('Desactivar'))
      .at(-1)
      ?.click();
    expect(facade.activeChanges).toEqual([{ service, active: false }]);
  });
});
