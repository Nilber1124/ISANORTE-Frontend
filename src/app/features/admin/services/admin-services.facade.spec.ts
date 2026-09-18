import { HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';

import { ActiveRequest } from '../../../data/models/common/active-request.model';
import { ServiceCreateRequest } from '../../../data/models/service/service-create-request.model';
import { ServiceResponse } from '../../../data/models/service/service-response.model';
import { ServiceUpdateRequest } from '../../../data/models/service/service-update-request.model';
import { ServiceApiService } from '../../../data/services/service-api.service';
import { AdminServicesFacade } from './admin-services.facade';

const service: ServiceResponse = {
  id: 'service-1',
  nombre: 'Arquitectura',
  slug: 'arquitectura',
  resumen: 'Diseño y planificación',
  descripcion: 'Descripción',
  icono: 'architecture',
  imagenUrl: null,
  activo: true,
  destacado: true,
  orden: 1,
  fechaCreacion: null,
  fechaActualizacion: null,
};

const createRequest: ServiceCreateRequest = {
  nombre: 'Construcción',
  slug: 'construccion',
  resumen: null,
  descripcion: 'Ejecución de obras',
  icono: null,
  imagenUrl: null,
  activo: true,
  destacado: false,
  orden: 2,
};

const updateRequest: ServiceUpdateRequest = {
  nombre: 'Arquitectura actualizada',
  slug: 'arquitectura',
  resumen: null,
  descripcion: 'Descripción actualizada',
  icono: null,
  imagenUrl: null,
  activo: false,
  destacado: false,
  orden: 0,
};

class ServiceApiStub {
  getAllResponse$: Observable<ServiceResponse[]> = of([service]);
  createResponse$: Observable<ServiceResponse> = of({
    ...service,
    id: 'service-2',
    ...createRequest,
  });
  updateResponse$: Observable<ServiceResponse> = of({ ...service, ...updateRequest });
  activeResponse$: Observable<ServiceResponse> = of({ ...service, activo: false });
  createRequests: ServiceCreateRequest[] = [];
  updateRequests: Array<{ id: string; request: ServiceUpdateRequest }> = [];
  activeRequests: Array<{ id: string; request: ActiveRequest }> = [];

  getAll(): Observable<ServiceResponse[]> {
    return this.getAllResponse$;
  }

  create(request: ServiceCreateRequest): Observable<ServiceResponse> {
    this.createRequests.push(request);
    return this.createResponse$;
  }

  update(id: string, request: ServiceUpdateRequest): Observable<ServiceResponse> {
    this.updateRequests.push({ id, request });
    return this.updateResponse$;
  }

  changeActive(id: string, request: ActiveRequest): Observable<ServiceResponse> {
    this.activeRequests.push({ id, request });
    return this.activeResponse$;
  }
}

describe('AdminServicesFacade', () => {
  let facade: AdminServicesFacade;
  let serviceApi: ServiceApiStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminServicesFacade,
        ServiceApiStub,
        { provide: ServiceApiService, useExisting: ServiceApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    facade = TestBed.inject(AdminServicesFacade);
    serviceApi = TestBed.inject(ServiceApiStub);
  });

  it('loads all services and leaves loading idle', () => {
    facade.load();
    expect(facade.services()).toEqual([service]);
    expect(facade.loading()).toBe(false);
  });

  it('supports an empty service list', () => {
    serviceApi.getAllResponse$ = of([]);
    facade.load();
    expect(facade.services()).toEqual([]);
  });

  it('creates a service and updates the list', () => {
    facade.openCreate();
    facade.create(createRequest);
    expect(serviceApi.createRequests).toEqual([createRequest]);
    expect(facade.services()).toHaveLength(1);
    expect(facade.formOpen()).toBe(false);
  });

  it('updates the selected service preserving false and zero values', () => {
    facade.load();
    facade.openEdit(service);
    facade.update(updateRequest);
    expect(serviceApi.updateRequests).toEqual([{ id: service.id, request: updateRequest }]);
    expect(serviceApi.updateRequests[0].request.activo).toBe(false);
    expect(serviceApi.updateRequests[0].request.destacado).toBe(false);
    expect(serviceApi.updateRequests[0].request.orden).toBe(0);
    expect(facade.services()[0].orden).toBe(0);
  });

  it('activates and deactivates only through the active patch', () => {
    facade.changeActive(service, false);
    facade.changeActive({ ...service, activo: false }, true);
    expect(serviceApi.activeRequests).toEqual([
      { id: service.id, request: { activo: false } },
      { id: service.id, request: { activo: true } },
    ]);
  });

  it.each([
    [400, 'Revisa los datos'],
    [404, 'ya no existe'],
    [409, 'slug'],
  ])('maps status %s without closing the form', (status, message) => {
    serviceApi.createResponse$ = throwError(() => new HttpErrorResponse({ status }));
    facade.openCreate();
    facade.create(createRequest);
    expect(facade.error()).toContain(message);
    expect(facade.formOpen()).toBe(true);
  });

  it('maps load and unexpected mutation errors', () => {
    serviceApi.getAllResponse$ = throwError(() => new HttpErrorResponse({ status: 500 }));
    facade.load();
    expect(facade.error()).toContain('cargar');
    serviceApi.createResponse$ = throwError(() => new HttpErrorResponse({ status: 500 }));
    facade.openCreate();
    facade.create(createRequest);
    expect(facade.error()).toContain('guardar');
  });

  it('prevents duplicate submission and always returns submitting to false', () => {
    const pending = new Subject<ServiceResponse>();
    serviceApi.createResponse$ = pending;
    facade.openCreate();
    facade.create(createRequest);
    facade.create(createRequest);
    expect(serviceApi.createRequests).toHaveLength(1);
    expect(facade.submitting()).toBe(true);
    pending.next(service);
    pending.complete();
    expect(facade.submitting()).toBe(false);
  });

  it('returns changingActiveId to idle after an error', () => {
    serviceApi.activeResponse$ = throwError(() => new HttpErrorResponse({ status: 404 }));
    facade.changeActive(service, false);
    expect(facade.changingActiveId()).toBeNull();
    expect(facade.error()).toContain('ya no existe');
  });
});
