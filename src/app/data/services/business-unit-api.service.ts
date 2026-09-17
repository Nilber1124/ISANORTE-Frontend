import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { BusinessUnitCreateRequest } from '../models/business-unit/business-unit-create-request.model';
import { BusinessUnitResponse } from '../models/business-unit/business-unit-response.model';
import { BusinessUnitUpdateRequest } from '../models/business-unit/business-unit-update-request.model';
import { ActiveRequest } from '../models/common/active-request.model';

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
}
