import { HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';
import { BusinessUnitCreateRequest } from '../../../data/models/business-unit/business-unit-create-request.model';
import { BusinessUnitResponse } from '../../../data/models/business-unit/business-unit-response.model';
import { BusinessUnitUpdateRequest } from '../../../data/models/business-unit/business-unit-update-request.model';
import { CompanyResponse } from '../../../data/models/company/company-response.model';
import { BusinessUnitApiService } from '../../../data/services/business-unit-api.service';
import { CompanyApiService } from '../../../data/services/company-api.service';
import { AdminBusinessUnitsFacade } from './admin-business-units.facade';

const company: CompanyResponse = {
  id: 'company-1',
  razonSocial: 'ISANORTE SAC',
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
  activo: true,
  orden: 1,
  empresa: { id: company.id, nombreComercial: company.nombreComercial },
  fechaCreacion: null,
  fechaActualizacion: null,
};
const createRequest: BusinessUnitCreateRequest = {
  nombre: 'Temporal',
  slug: 'temporal',
  descripcion: null,
  icono: null,
  imagenUrl: null,
  activo: true,
  orden: null,
  empresaId: company.id,
};
const updateRequest: BusinessUnitUpdateRequest = {
  nombre: 'Temporal',
  slug: 'temporal',
  descripcion: null,
  icono: null,
  imagenUrl: null,
  activo: false,
  orden: 0,
  empresaId: company.id,
};
class UnitApiStub {
  getAllResponse$: Observable<BusinessUnitResponse[]> = of([unit]);
  createResponse$: Observable<BusinessUnitResponse> = of({
    ...unit,
    id: 'unit-2',
    ...createRequest,
    empresa: unit.empresa,
  });
  updateResponse$: Observable<BusinessUnitResponse> = of({
    ...unit,
    ...updateRequest,
    empresa: unit.empresa,
  });
  activeResponse$: Observable<BusinessUnitResponse> = of({ ...unit, activo: false });
  createRequests: BusinessUnitCreateRequest[] = [];
  updateRequests: Array<{ id: string; request: BusinessUnitUpdateRequest }> = [];
  activeRequests: Array<{ id: string; active: boolean }> = [];
  getAll() {
    return this.getAllResponse$;
  }
  create(request: BusinessUnitCreateRequest) {
    this.createRequests.push(request);
    return this.createResponse$;
  }
  update(id: string, request: BusinessUnitUpdateRequest) {
    this.updateRequests.push({ id, request });
    return this.updateResponse$;
  }
  changeActive(id: string, request: { activo: boolean }) {
    this.activeRequests.push({ id, active: request.activo });
    return this.activeResponse$;
  }
}
class CompanyApiStub {
  response$: Observable<CompanyResponse[]> = of([company]);
  getAll() {
    return this.response$;
  }
}
describe('AdminBusinessUnitsFacade', () => {
  let facade: AdminBusinessUnitsFacade;
  let unitApi: UnitApiStub;
  let companyApi: CompanyApiStub;
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminBusinessUnitsFacade,
        UnitApiStub,
        CompanyApiStub,
        { provide: BusinessUnitApiService, useExisting: UnitApiStub },
        { provide: CompanyApiService, useExisting: CompanyApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    facade = TestBed.inject(AdminBusinessUnitsFacade);
    unitApi = TestBed.inject(UnitApiStub);
    companyApi = TestBed.inject(CompanyApiStub);
  });
  it('loads units and companies', () => {
    facade.load();
    expect(facade.businessUnits()).toEqual([unit]);
    expect(facade.companies()).toEqual([company]);
    expect(facade.loading()).toBe(false);
    expect(facade.loadingFormData()).toBe(false);
  });
  it('creates with the selected company UUID', () => {
    facade.openCreate();
    facade.create(createRequest);
    expect(unitApi.createRequests[0].empresaId).toBe(company.id);
    expect(facade.formOpen()).toBe(false);
  });
  it('updates with the existing company UUID and preserves false and zero', () => {
    facade.openEdit(unit);
    facade.update(updateRequest);
    expect(unitApi.updateRequests).toEqual([{ id: unit.id, request: updateRequest }]);
    expect(unitApi.updateRequests[0].request.empresaId).toBe(unit.empresa.id);
    expect(unitApi.updateRequests[0].request.activo).toBe(false);
    expect(unitApi.updateRequests[0].request.orden).toBe(0);
  });
  it('activates and deactivates through PATCH', () => {
    facade.changeActive(unit, false);
    facade.changeActive({ ...unit, activo: false }, true);
    expect(unitApi.activeRequests).toEqual([
      { id: unit.id, active: false },
      { id: unit.id, active: true },
    ]);
  });
  it.each([
    [400, 'Revisa'],
    [404, 'empresa'],
    [409, 'conflicto'],
  ])('maps %s errors safely', (status, text) => {
    unitApi.createResponse$ = throwError(() => new HttpErrorResponse({ status }));
    facade.openCreate();
    facade.create(createRequest);
    expect(facade.error()).toContain(text);
    expect(facade.formOpen()).toBe(true);
  });
  it('returns submitting to false and blocks duplicate create', () => {
    const pending = new Subject<BusinessUnitResponse>();
    unitApi.createResponse$ = pending;
    facade.openCreate();
    facade.create(createRequest);
    facade.create(createRequest);
    expect(unitApi.createRequests).toHaveLength(1);
    pending.next(unit);
    pending.complete();
    expect(facade.submitting()).toBe(false);
  });
  it('can represent empty form data', () => {
    companyApi.response$ = of([]);
    unitApi.getAllResponse$ = of([]);
    facade.load();
    expect(facade.companies()).toEqual([]);
    expect(facade.businessUnits()).toEqual([]);
  });
});
