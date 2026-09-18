import { HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';

import { ProjectImageRequest } from '../../../../data/models/project/project-image-request.model';
import { ProjectImageType } from '../../../../data/models/project/project-image-type.enum';
import {
  ProjectImageResponse,
  ProjectResponse,
} from '../../../../data/models/project/project-response.model';
import { ProjectApiService } from '../../../../data/services/project-api.service';
import { AdminProjectDetailFacade } from './admin-project-detail.facade';

const firstImage: ProjectImageResponse = {
  id: 'image-1',
  url: 'https://example.com/one.jpg',
  titulo: 'General',
  descripcion: null,
  tipo: ProjectImageType.GENERAL,
  esPrincipal: true,
  orden: 1,
};
const secondImage: ProjectImageResponse = {
  id: 'image-2',
  url: 'https://example.com/two.jpg',
  titulo: 'Antes',
  descripcion: null,
  tipo: ProjectImageType.ANTES,
  esPrincipal: true,
  orden: 2,
};
const project: ProjectResponse = {
  id: 'project-1',
  nombre: 'Residencial',
  slug: 'residencial',
  cliente: null,
  ubicacion: 'Cajamarca',
  fechaProyecto: '2026',
  descripcion: 'Proyecto',
  destacado: true,
  activo: true,
  servicios: [],
  imagenes: [firstImage, secondImage],
  fechaCreacion: null,
  fechaActualizacion: null,
};
const request: ProjectImageRequest = {
  url: 'https://example.com/new.jpg',
  titulo: 'Nueva',
  descripcion: null,
  tipo: ProjectImageType.DESPUES,
  esPrincipal: true,
  orden: 3,
};

class ProjectApiStub {
  getResponse$: Observable<ProjectResponse> = of(project);
  createResponse$: Observable<ProjectImageResponse> = of({
    ...secondImage,
    id: 'image-3',
    ...request,
  });
  updateResponse$: Observable<ProjectImageResponse> = of({ ...firstImage, ...request });
  deleteResponse$: Observable<void> = of(undefined);
  loadedIds: string[] = [];
  creates: Array<{ projectId: string; request: ProjectImageRequest }> = [];
  updates: Array<{ projectId: string; imageId: string; request: ProjectImageRequest }> = [];
  deletes: Array<{ projectId: string; imageId: string }> = [];
  getById(id: string): Observable<ProjectResponse> {
    this.loadedIds.push(id);
    return this.getResponse$;
  }
  createImage(projectId: string, value: ProjectImageRequest): Observable<ProjectImageResponse> {
    this.creates.push({ projectId, request: value });
    return this.createResponse$;
  }
  updateImage(
    projectId: string,
    imageId: string,
    value: ProjectImageRequest,
  ): Observable<ProjectImageResponse> {
    this.updates.push({ projectId, imageId, request: value });
    return this.updateResponse$;
  }
  deleteImage(projectId: string, imageId: string): Observable<void> {
    this.deletes.push({ projectId, imageId });
    return this.deleteResponse$;
  }
}

describe('AdminProjectDetailFacade', () => {
  let facade: AdminProjectDetailFacade;
  let api: ProjectApiStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminProjectDetailFacade,
        ProjectApiStub,
        { provide: ProjectApiService, useExisting: ProjectApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    facade = TestBed.inject(AdminProjectDetailFacade);
    api = TestBed.inject(ProjectApiStub);
  });

  it('loads a project by UUID', () => {
    facade.load(project.id);
    expect(api.loadedIds).toEqual([project.id]);
    expect(facade.project()).toEqual(project);
    expect(facade.loading()).toBe(false);
  });

  it('exposes notFound for a 404', () => {
    api.getResponse$ = throwError(() => new HttpErrorResponse({ status: 404 }));
    facade.load(project.id);
    expect(facade.notFound()).toBe(true);
    expect(facade.error()).toBeNull();
  });

  it('creates an image with the exact standalone DTO', () => {
    facade.load(project.id);
    facade.createImage(request);
    expect(api.creates).toEqual([{ projectId: project.id, request }]);
    expect(facade.project()?.imagenes?.some((image) => image.id === 'image-3')).toBe(true);
    expect(facade.savingImage()).toBe(false);
  });

  it('updates an existing image without changing its id manually', () => {
    facade.load(project.id);
    facade.updateImage(firstImage.id, request);
    expect(api.updates).toEqual([{ projectId: project.id, imageId: firstImage.id, request }]);
    expect(facade.project()?.imagenes?.find((image) => image.id === firstImage.id)?.tipo).toBe(
      ProjectImageType.DESPUES,
    );
  });

  it('deletes only the child image', () => {
    facade.load(project.id);
    facade.deleteImage(firstImage.id);
    expect(api.deletes).toEqual([{ projectId: project.id, imageId: firstImage.id }]);
    expect(facade.project()?.imagenes?.map((image) => image.id)).toEqual([secondImage.id]);
    expect(facade.deletingImageId()).toBeNull();
  });

  it('maps image mutation errors safely', () => {
    facade.load(project.id);
    for (const status of [400, 404, 409, 500]) {
      api.createResponse$ = throwError(() => new HttpErrorResponse({ status }));
      facade.createImage(request);
      expect(facade.error()).toBeTruthy();
      expect(facade.savingImage()).toBe(false);
    }
  });

  it('preserves multiple principal images returned by the backend', () => {
    facade.load(project.id);
    expect(facade.project()?.imagenes?.filter((image) => image.esPrincipal)).toHaveLength(2);
  });

  it('represents an empty image collection', () => {
    api.getResponse$ = of({ ...project, imagenes: [] });
    facade.load(project.id);
    expect(facade.project()?.imagenes).toEqual([]);
  });
});
