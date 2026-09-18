import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { ActiveRequest } from '../models/common/active-request.model';
import { ProjectCreateRequest } from '../models/project/project-create-request.model';
import { ProjectImageRequest } from '../models/project/project-image-request.model';
import { ProjectImageResponse, ProjectResponse } from '../models/project/project-response.model';
import { ProjectUpdateRequest } from '../models/project/project-update-request.model';

@Injectable({ providedIn: 'root' })
export class ProjectApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${inject(API_BASE_URL).replace(/\/+$/, '')}/api/proyectos`;

  getAll(): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(this.resourceUrl);
  }

  getActive(): Observable<ProjectResponse[]> {
    return this.http.get<ProjectResponse[]>(`${this.resourceUrl}/activos`);
  }

  getActiveBySlug(slug: string): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(
      `${this.resourceUrl}/activos/slug/${encodeURIComponent(slug)}`,
    );
  }

  getById(id: string): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getBySlug(slug: string): Observable<ProjectResponse> {
    return this.http.get<ProjectResponse>(`${this.resourceUrl}/slug/${encodeURIComponent(slug)}`);
  }

  create(request: ProjectCreateRequest): Observable<ProjectResponse> {
    return this.http.post<ProjectResponse>(this.resourceUrl, request);
  }

  update(id: string, request: ProjectUpdateRequest): Observable<ProjectResponse> {
    return this.http.put<ProjectResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`, request);
  }

  changeActive(id: string, request: ActiveRequest): Observable<ProjectResponse> {
    return this.http.patch<ProjectResponse>(
      `${this.resourceUrl}/${encodeURIComponent(id)}/activo`,
      request,
    );
  }

  createImage(projectId: string, request: ProjectImageRequest): Observable<ProjectImageResponse> {
    return this.http.post<ProjectImageResponse>(
      `${this.resourceUrl}/${encodeURIComponent(projectId)}/imagenes`,
      request,
    );
  }

  updateImage(
    projectId: string,
    imageId: string,
    request: ProjectImageRequest,
  ): Observable<ProjectImageResponse> {
    return this.http.put<ProjectImageResponse>(
      `${this.resourceUrl}/${encodeURIComponent(projectId)}/imagenes/${encodeURIComponent(imageId)}`,
      request,
    );
  }

  deleteImage(projectId: string, imageId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.resourceUrl}/${encodeURIComponent(projectId)}/imagenes/${encodeURIComponent(imageId)}`,
    );
  }
}
