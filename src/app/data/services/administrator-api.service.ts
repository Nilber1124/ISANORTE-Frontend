import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { AdministratorResponse } from '../models/administrator/administrator-response.model';
import { AdministratorUpdateRequest } from '../models/administrator/administrator-update-request.model';
import { ActiveRequest } from '../models/common/active-request.model';

@Injectable({ providedIn: 'root' })
export class AdministratorApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${inject(API_BASE_URL).replace(/\/+$/, '')}/api/administradores`;

  getAll(): Observable<AdministratorResponse[]> {
    return this.http.get<AdministratorResponse[]>(this.resourceUrl);
  }

  getById(id: string): Observable<AdministratorResponse> {
    return this.http.get<AdministratorResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  update(id: string, request: AdministratorUpdateRequest): Observable<AdministratorResponse> {
    return this.http.put<AdministratorResponse>(
      `${this.resourceUrl}/${encodeURIComponent(id)}`,
      request,
    );
  }

  changeActive(id: string, request: ActiveRequest): Observable<AdministratorResponse> {
    return this.http.patch<AdministratorResponse>(
      `${this.resourceUrl}/${encodeURIComponent(id)}/activo`,
      request,
    );
  }
}
