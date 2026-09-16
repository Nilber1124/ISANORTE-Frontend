import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { LandingSectionCreateRequest } from '../models/landing-section/landing-section-create-request.model';
import { LandingSectionResponse } from '../models/landing-section/landing-section-response.model';
import { LandingSectionUpdateRequest } from '../models/landing-section/landing-section-update-request.model';
import { VisibilityRequest } from '../models/landing-section/visibility-request.model';

@Injectable({ providedIn: 'root' })
export class LandingSectionApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${inject(API_BASE_URL).replace(/\/+$/, '')}/api/secciones-landing`;

  getAll(): Observable<LandingSectionResponse[]> {
    return this.http.get<LandingSectionResponse[]>(this.resourceUrl);
  }

  getVisible(): Observable<LandingSectionResponse[]> {
    return this.http.get<LandingSectionResponse[]>(`${this.resourceUrl}/visibles`);
  }

  getById(id: string): Observable<LandingSectionResponse> {
    return this.http.get<LandingSectionResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  create(request: LandingSectionCreateRequest): Observable<LandingSectionResponse> {
    return this.http.post<LandingSectionResponse>(this.resourceUrl, request);
  }

  update(id: string, request: LandingSectionUpdateRequest): Observable<LandingSectionResponse> {
    return this.http.put<LandingSectionResponse>(
      `${this.resourceUrl}/${encodeURIComponent(id)}`,
      request,
    );
  }

  changeVisibility(id: string, request: VisibilityRequest): Observable<LandingSectionResponse> {
    return this.http.patch<LandingSectionResponse>(
      `${this.resourceUrl}/${encodeURIComponent(id)}/visible`,
      request,
    );
  }
}
