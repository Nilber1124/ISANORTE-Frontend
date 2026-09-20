import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BusinessUnitResponse } from '../../../data/models/business-unit/business-unit-response.model';
import { CompanyResponse } from '../../../data/models/company/company-response.model';
import { AdminBusinessUnits } from './admin-business-units';
import { AdminBusinessUnitsFacade, BusinessUnitFormMode } from './admin-business-units.facade';
const company: CompanyResponse = {
  id: 'company-1',
  razonSocial: 'ISANORTE',
  nombreComercial: 'ISANORTE',
  ruc: '123',
  direccion: null,
  ciudad: null,
  telefono: null,
  telefonoSecundario: null,
  email: null,
  emailVentas: null,
  whatsapp: null,
  horarioAtencion: null,
  mision: null,
  vision: null,
  valores: null,
  resumenNosotros: null,
  redesSociales: null,
  estadisticas: [],
  fechaCreacion: null,
  fechaActualizacion: null,
};
const unit: BusinessUnitResponse = {
  id: 'unit-1',
  nombre: 'ISADECOR',
  slug: 'isadecor',
  descripcion: null,
  icono: null,
  imagenUrl: null,
  imagenAlt: null,
  activo: true,
  destacado: false,
  orden: 1,
  empresa: { id: company.id, nombreComercial: company.nombreComercial },
  recursos: [],
  fechaCreacion: null,
  fechaActualizacion: null,
};
class FacadeStub {
  readonly businessUnits = signal<readonly BusinessUnitResponse[]>([unit]);
  readonly companies = signal<readonly CompanyResponse[]>([company]);
  readonly loading = signal(false);
  readonly loadingFormData = signal(false);
  readonly submitting = signal(false);
  readonly changingActiveId = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly selectedBusinessUnit = signal<BusinessUnitResponse | null>(null);
  readonly formMode = signal<BusinessUnitFormMode>('create');
  readonly formOpen = signal(false);
  readonly managedBusinessUnit = signal<BusinessUnitResponse | null>(null);
  readonly childSaving = signal(false);
  creates = 0;
  edits: BusinessUnitResponse[] = [];
  changes: Array<{ unit: BusinessUnitResponse; active: boolean }> = [];
  load() {}
  openCreate() {
    this.creates++;
  }
  openEdit(value: BusinessUnitResponse) {
    this.edits.push(value);
  }
  closeForm() {}
  create() {}
  update() {}
  changeActive(value: BusinessUnitResponse, active: boolean) {
    this.changes.push({ unit: value, active });
  }
  clearFeedback() {}
  openResources() {}
  closeResources() {}
  saveResource() {}
  deleteResource() {}
}
describe('AdminBusinessUnits', () => {
  let fixture: ComponentFixture<AdminBusinessUnits>;
  let facade: FacadeStub;
  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AdminBusinessUnits] })
      .overrideComponent(AdminBusinessUnits, {
        set: { providers: [{ provide: AdminBusinessUnitsFacade, useClass: FacadeStub }] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(AdminBusinessUnits);
    facade = fixture.debugElement.injector.get(AdminBusinessUnitsFacade) as unknown as FacadeStub;
    fixture.detectChanges();
  });
  it('renders the administrative table', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('table caption')?.textContent).toContain('Listado administrativo');
    expect(element.textContent).toContain('ISADECOR');
    expect(element.textContent).toContain('ISANORTE');
  });
  it('shows EmptyState and opens creation', () => {
    facade.businessUnits.set([]);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No hay unidades de negocio registradas',
    );
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((item) => item.textContent?.includes('Nueva unidad'))
      ?.click();
    expect(facade.creates).toBe(1);
  });
  it('opens edit and confirms deactivation', () => {
    const element = fixture.nativeElement as HTMLElement;
    Array.from(element.querySelectorAll('button'))
      .find((item) => item.textContent?.includes('Editar'))
      ?.click();
    expect(facade.edits).toEqual([unit]);
    Array.from(element.querySelectorAll('button'))
      .find((item) => item.textContent?.includes('Desactivar'))
      ?.click();
    fixture.detectChanges();
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .filter((item) => item.textContent?.includes('Desactivar'))
      .at(-1)
      ?.click();
    expect(facade.changes).toEqual([{ unit, active: false }]);
  });
});
