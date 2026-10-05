import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { SiteConfigCreateRequest } from '../models/site-config/site-config-create-request.model';
import { SiteConfigResponse } from '../models/site-config/site-config-response.model';
import { SiteConfigUpdateRequest } from '../models/site-config/site-config-update-request.model';

@Injectable({ providedIn: 'root' })
export class SiteConfigApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${inject(API_BASE_URL).replace(/\/+$/, '')}/api/configuracion-sitio`;

  getAll(): Observable<SiteConfigResponse[]> {
    return this.http.get<SiteConfigResponse[]>(this.resourceUrl);
  }

  getById(id: string): Observable<SiteConfigResponse> {
    return this.http.get<SiteConfigResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  create(request: SiteConfigCreateRequest): Observable<SiteConfigResponse> {
    return this.http.post<SiteConfigResponse>(this.resourceUrl, request);
  }

  update(id: string, request: SiteConfigUpdateRequest): Observable<SiteConfigResponse> {
    return this.http.put<SiteConfigResponse>(
      `${this.resourceUrl}/${encodeURIComponent(id)}`,
      request,
    );
  }
}
