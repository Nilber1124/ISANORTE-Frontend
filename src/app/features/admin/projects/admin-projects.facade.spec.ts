import { HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';

import { ProjectCreateRequest } from '../../../data/models/project/project-create-request.model';
import { ProjectResponse } from '../../../data/models/project/project-response.model';
import { ProjectUpdateRequest } from '../../../data/models/project/project-update-request.model';
import { ServiceResponse } from '../../../data/models/service/service-response.model';
import { ActiveRequest } from '../../../data/models/common/active-request.model';
import { ProjectApiService } from '../../../data/services/project-api.service';
import { ServiceApiService } from '../../../data/services/service-api.service';
import { AdminProjectsFacade } from './admin-projects.facade';

const service: ServiceResponse = {
  id: 'service-1',
  nombre: 'Arquitectura',
  slug: 'arquitectura',
  resumen: null,
  descripcion: 'Diseño',
  icono: null,
  imagenUrl: null,
  activo: true,
  destacado: false,
  orden: 1,
  fechaCreacion: null,
  fechaActualizacion: null,
};
const project: ProjectResponse = {
  id: 'project-1',
  nombre: 'Residencial',
  slug: 'residencial',
  cliente: 'Cliente',
  ubicacion: 'Cajamarca',
  fechaProyecto: '2026',
  descripcion: 'Proyecto residencial',
  destacado: false,
  activo: true,
  servicios: [{ id: service.id, nombre: service.nombre, slug: service.slug }],
  imagenes: [],
  fechaCreacion: null,
  fechaActualizacion: null,
};
const createRequest: ProjectCreateRequest = {
  nombre: 'Nuevo',
  slug: 'nuevo',
  cliente: null,
  ubicacion: null,
  fechaProyecto: null,
  descripcion: 'Descripción',
  destacado: false,
  activo: true,
  servicioIds: [service.id],
};
const updateRequest: ProjectUpdateRequest = {
  nombre: 'Editado',
  slug: 'editado',
  cliente: 'Otro',
  ubicacion: 'Lima',
  fechaProyecto: '2027',
  descripcion: 'Editado',
  destacado: true,
  activo: true,
  servicioIds: [service.id],
};

class ProjectApiStub {
  getAllResponse$: Observable<ProjectResponse[]> = of([project]);
  createResponse$: Observable<ProjectResponse> = of({
    ...project,
    id: 'project-2',
    nombre: createRequest.nombre,
    slug: createRequest.slug,
    descripcion: createRequest.descripcion,
  });
  updateResponse$: Observable<ProjectResponse> = of({ ...project, ...updateRequest });
  activeResponse$: Observable<ProjectResponse> = of({ ...project, activo: false });
  createRequests: ProjectCreateRequest[] = [];
  updateRequests: Array<{ id: string; request: ProjectUpdateRequest }> = [];
  activeRequests: Array<{ id: string; request: ActiveRequest }> = [];
  getAll(): Observable<ProjectResponse[]> {
    return this.getAllResponse$;
  }
  create(request: ProjectCreateRequest): Observable<ProjectResponse> {
    this.createRequests.push(request);
    return this.createResponse$;
  }
  update(id: string, request: ProjectUpdateRequest): Observable<ProjectResponse> {
    this.updateRequests.push({ id, request });
    return this.updateResponse$;
  }
  changeActive(id: string, request: ActiveRequest): Observable<ProjectResponse> {
    this.activeRequests.push({ id, request });
    return this.activeResponse$;
  }
}
class ServiceApiStub {
  response$: Observable<ServiceResponse[]> = of([service]);
  calls = 0;
  getAll(): Observable<ServiceResponse[]> {
    this.calls += 1;
    return this.response$;
  }
}

describe('AdminProjectsFacade', () => {
  let facade: AdminProjectsFacade;
  let projectApi: ProjectApiStub;
  let serviceApi: ServiceApiStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminProjectsFacade,
        ProjectApiStub,
        ServiceApiStub,
        { provide: ProjectApiService, useExisting: ProjectApiStub },
        { provide: ServiceApiService, useExisting: ServiceApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    facade = TestBed.inject(AdminProjectsFacade);
    projectApi = TestBed.inject(ProjectApiStub);
    serviceApi = TestBed.inject(ServiceApiStub);
  });

  it('loads all projects including inactive records', () => {
    facade.load();
    expect(facade.projects()).toEqual([project]);
    expect(facade.loading()).toBe(false);
  });

  it('loads services for the form', () => {
    facade.load();
    expect(serviceApi.calls).toBe(1);
    expect(facade.services()).toEqual([service]);
    expect(facade.loadingFormData()).toBe(false);
  });

  it('creates a project without adding images to the request', () => {
    facade.openCreate();
    facade.create(createRequest);
    expect(projectApi.createRequests).toEqual([createRequest]);
    expect('imagenes' in projectApi.createRequests[0]).toBe(false);
    expect(facade.formOpen()).toBe(false);
  });

  it('updates only fields accepted by ProjectUpdateRequest', () => {
    facade.openEdit(project);
    facade.update(updateRequest);
    expect(projectApi.updateRequests).toEqual([{ id: project.id, request: updateRequest }]);
    expect('imagenes' in projectApi.updateRequests[0].request).toBe(false);
  });

  it('deactivates and updates the returned project', () => {
    facade.load();
    facade.changeActive(project);
    expect(projectApi.activeRequests).toEqual([{ id: project.id, request: { activo: false } }]);
    expect(facade.projects()[0].activo).toBe(false);
  });

  it('keeps the form open on a 409 conflict', () => {
    projectApi.createResponse$ = throwError(() => new HttpErrorResponse({ status: 409 }));
    facade.openCreate();
    facade.create(createRequest);
    expect(facade.error()).toContain('slug');
    expect(facade.formOpen()).toBe(true);
  });

  it('maps 400, 404 and unexpected errors safely', () => {
    for (const status of [400, 404, 500]) {
      projectApi.createResponse$ = throwError(() => new HttpErrorResponse({ status }));
      facade.openCreate();
      facade.create(createRequest);
      expect(facade.error()).toBeTruthy();
    }
  });

  it('returns submitting and changingActiveId to idle', () => {
    const pending = new Subject<ProjectResponse>();
    projectApi.createResponse$ = pending;
    facade.openCreate();
    facade.create(createRequest);
    facade.create(createRequest);
    expect(projectApi.createRequests).toHaveLength(1);
    expect(facade.submitting()).toBe(true);
    pending.next(project);
    pending.complete();
    expect(facade.submitting()).toBe(false);

    projectApi.activeResponse$ = throwError(() => new HttpErrorResponse({ status: 500 }));
    facade.changeActive(project);
    expect(facade.changingActiveId()).toBeNull();
  });
});
