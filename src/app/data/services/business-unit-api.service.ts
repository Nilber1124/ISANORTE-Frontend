import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { BusinessUnitCreateRequest } from '../models/business-unit/business-unit-create-request.model';
import { BusinessUnitResponse } from '../models/business-unit/business-unit-response.model';
import { BusinessUnitUpdateRequest } from '../models/business-unit/business-unit-update-request.model';
import { ActiveRequest } from '../models/common/active-request.model';
import {
  BusinessUnitResourceRequest,
  BusinessUnitResourceResponse,
} from '../models/business-unit/business-unit-resource.model';

@Injectable({ providedIn: 'root' })
export class BusinessUnitApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${inject(API_BASE_URL).replace(/\/+$/, '')}/api/unidades-negocio`;

  getAll(): Observable<BusinessUnitResponse[]> {
    return this.http.get<BusinessUnitResponse[]>(this.resourceUrl);
  }

  getActive(): Observable<BusinessUnitResponse[]> {
    return this.http.get<BusinessUnitResponse[]>(`${this.resourceUrl}/activas`);
  }

  getActiveBySlug(slug: string): Observable<BusinessUnitResponse> {
    return this.http.get<BusinessUnitResponse>(
      `${this.resourceUrl}/activas/slug/${encodeURIComponent(slug)}`,
    );
  }

  getById(id: string): Observable<BusinessUnitResponse> {
    return this.http.get<BusinessUnitResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getBySlug(slug: string): Observable<BusinessUnitResponse> {
    return this.http.get<BusinessUnitResponse>(
      `${this.resourceUrl}/slug/${encodeURIComponent(slug)}`,
    );
  }

  create(request: BusinessUnitCreateRequest): Observable<BusinessUnitResponse> {
    return this.http.post<BusinessUnitResponse>(this.resourceUrl, request);
  }

  update(id: string, request: BusinessUnitUpdateRequest): Observable<BusinessUnitResponse> {
    return this.http.put<BusinessUnitResponse>(
      `${this.resourceUrl}/${encodeURIComponent(id)}`,
      request,
    );
  }

  changeActive(id: string, request: ActiveRequest): Observable<BusinessUnitResponse> {
    return this.http.patch<BusinessUnitResponse>(
      `${this.resourceUrl}/${encodeURIComponent(id)}/activo`,
      request,
    );
  }

  createResource(
    unitId: string,
    request: BusinessUnitResourceRequest,
  ): Observable<BusinessUnitResourceResponse> {
    return this.http.post<BusinessUnitResourceResponse>(
      `${this.unitUrl(unitId)}/recursos`,
      request,
    );
  }

  updateResource(
    unitId: string,
    resourceId: string,
    request: BusinessUnitResourceRequest,
  ): Observable<BusinessUnitResourceResponse> {
    return this.http.put<BusinessUnitResourceResponse>(
      `${this.unitUrl(unitId)}/recursos/${encodeURIComponent(resourceId)}`,
      request,
    );
  }

  deleteResource(unitId: string, resourceId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.unitUrl(unitId)}/recursos/${encodeURIComponent(resourceId)}`,
    );
  }

  private unitUrl(id: string): string {
    return `${this.resourceUrl}/${encodeURIComponent(id)}`;
  }
}
