import { HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';

import { BusinessUnitResponse } from '../../../data/models/business-unit/business-unit-response.model';
import { CategoryCreateRequest } from '../../../data/models/category/category-create-request.model';
import { CategoryResponse } from '../../../data/models/category/category-response.model';
import { CategoryUpdateRequest } from '../../../data/models/category/category-update-request.model';
import { ActiveRequest } from '../../../data/models/common/active-request.model';
import { BusinessUnitApiService } from '../../../data/services/business-unit-api.service';
import { CategoryApiService } from '../../../data/services/category-api.service';
import { AdminCategoriesFacade } from './admin-categories.facade';

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
  empresa: { id: 'company-1', nombreComercial: 'ISANORTE' },
  recursos: [],
  fechaCreacion: null,
  fechaActualizacion: null,
};
const category: CategoryResponse = {
  id: 'category-1',
  nombre: 'Wall Panels',
  slug: 'wall-panels',
  descripcion: null,
  imagenUrl: null,
  activo: true,
  orden: 1,
  unidadNegocio: { id: unit.id, nombre: unit.nombre, slug: unit.slug },
  fechaCreacion: null,
  fechaActualizacion: null,
};
const createRequest: CategoryCreateRequest = {
  nombre: 'Pisos',
  slug: 'pisos',
  descripcion: null,
  imagenUrl: null,
  activo: true,
  orden: 2,
  unidadNegocioId: unit.id,
};
const updateRequest: CategoryUpdateRequest = {
  ...createRequest,
  nombre: 'Pisos SPC',
  activo: true,
  orden: 2,
};

class CategoryApiStub {
  getAllResponse$: Observable<CategoryResponse[]> = of([category]);
  createResponse$: Observable<CategoryResponse> = of({
    ...category,
    id: 'category-2',
    ...createRequest,
    unidadNegocio: category.unidadNegocio,
  });
  updateResponse$: Observable<CategoryResponse> = of({ ...category, ...updateRequest });
  activeResponse$: Observable<CategoryResponse> = of({ ...category, activo: false });
  createRequests: CategoryCreateRequest[] = [];
  updateRequests: Array<{ id: string; request: CategoryUpdateRequest }> = [];
  activeRequests: Array<{ id: string; request: ActiveRequest }> = [];
  getAll(): Observable<CategoryResponse[]> {
    return this.getAllResponse$;
  }
  create(request: CategoryCreateRequest): Observable<CategoryResponse> {
    this.createRequests.push(request);
    return this.createResponse$;
  }
  update(id: string, request: CategoryUpdateRequest): Observable<CategoryResponse> {
    this.updateRequests.push({ id, request });
    return this.updateResponse$;
  }
  changeActive(id: string, request: ActiveRequest): Observable<CategoryResponse> {
    this.activeRequests.push({ id, request });
    return this.activeResponse$;
  }
}
class BusinessUnitApiStub {
  response$: Observable<BusinessUnitResponse[]> = of([unit]);
  calls = 0;
  getAll(): Observable<BusinessUnitResponse[]> {
    this.calls += 1;
    return this.response$;
  }
}

describe('AdminCategoriesFacade', () => {
  let facade: AdminCategoriesFacade;
  let categoryApi: CategoryApiStub;
  let businessUnitApi: BusinessUnitApiStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminCategoriesFacade,
        CategoryApiStub,
        BusinessUnitApiStub,
        { provide: CategoryApiService, useExisting: CategoryApiStub },
        { provide: BusinessUnitApiService, useExisting: BusinessUnitApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    facade = TestBed.inject(AdminCategoriesFacade);
    categoryApi = TestBed.inject(CategoryApiStub);
    businessUnitApi = TestBed.inject(BusinessUnitApiStub);
  });

  it('loads all categories and business units', () => {
    facade.load();
    expect(facade.categories()).toEqual([category]);
    expect(facade.businessUnits()).toEqual([unit]);
    expect(businessUnitApi.calls).toBe(1);
    expect(facade.loading()).toBe(false);
    expect(facade.loadingFormData()).toBe(false);
  });

  it('creates a category and adds the response to the list', () => {
    facade.load();
    facade.openCreate();
    facade.create(createRequest);
    expect(categoryApi.createRequests).toEqual([createRequest]);
    expect(facade.categories().some((item) => item.slug === 'pisos')).toBe(true);
    expect(facade.formOpen()).toBe(false);
    expect(facade.success()).toContain('creada');
  });

  it('updates only the selected category by its id', () => {
    facade.load();
    facade.openEdit(category);
    facade.update(updateRequest);
    expect(categoryApi.updateRequests).toEqual([{ id: category.id, request: updateRequest }]);
    expect(facade.categories()[0].nombre).toBe('Pisos SPC');
    expect(facade.success()).toContain('actualizada');
  });

  it('changes active state using the ActiveRequest contract', () => {
    facade.load();
    facade.changeActive(category, false);
    expect(categoryApi.activeRequests).toEqual([{ id: category.id, request: { activo: false } }]);
    expect(facade.categories()[0].activo).toBe(false);
  });

  it('exposes a safe error when initial category loading fails', () => {
    categoryApi.getAllResponse$ = throwError(() => new HttpErrorResponse({ status: 500 }));
    facade.load();
    expect(facade.error()).toContain('No pudimos cargar');
    expect(facade.loading()).toBe(false);
  });

  it('keeps the form open and explains a duplicate slug conflict', () => {
    categoryApi.createResponse$ = throwError(() => new HttpErrorResponse({ status: 409 }));
    facade.openCreate();
    facade.create(createRequest);
    expect(facade.error()).toBe('Ya existe una categoría con ese slug.');
    expect(facade.formOpen()).toBe(true);
    expect(facade.submitting()).toBe(false);
  });

  it('keeps submitting true until creation completes and blocks duplicate requests', () => {
    const pending = new Subject<CategoryResponse>();
    categoryApi.createResponse$ = pending;
    facade.openCreate();
    facade.create(createRequest);
    facade.create(createRequest);
    expect(facade.submitting()).toBe(true);
    expect(categoryApi.createRequests).toHaveLength(1);
    pending.next({ ...category, id: 'category-2' });
    pending.complete();
    expect(facade.submitting()).toBe(false);
  });

  it('returns active-changing state to idle after an error', () => {
    categoryApi.activeResponse$ = throwError(() => new HttpErrorResponse({ status: 404 }));
    facade.changeActive(category, false);
    expect(facade.error()).toContain('ya no existe');
    expect(facade.changingActiveId()).toBeNull();
  });
});
