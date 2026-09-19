import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { CompanyCreateRequest } from '../models/company/company-create-request.model';
import { CompanyResponse, SocialNetworkResponse } from '../models/company/company-response.model';
import { CompanyUpdateRequest } from '../models/company/company-update-request.model';
import { SocialNetworkRequest } from '../models/company/social-network-request.model';

@Injectable({ providedIn: 'root' })
export class CompanyApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${inject(API_BASE_URL).replace(/\/+$/, '')}/api/empresa`;

  getAll(): Observable<CompanyResponse[]> {
    return this.http.get<CompanyResponse[]>(this.resourceUrl);
  }

  getById(id: string): Observable<CompanyResponse> {
    return this.http.get<CompanyResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  create(request: CompanyCreateRequest): Observable<CompanyResponse> {
    return this.http.post<CompanyResponse>(this.resourceUrl, request);
  }

  update(id: string, request: CompanyUpdateRequest): Observable<CompanyResponse> {
    return this.http.put<CompanyResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`, request);
  }

  createSocialNetwork(empresaId: string, request: SocialNetworkRequest): Observable<SocialNetworkResponse> {
    return this.http.post<SocialNetworkResponse>(
      `${this.resourceUrl}/${encodeURIComponent(empresaId)}/redes-sociales`,
      request,
    );
  }

  updateSocialNetwork(
    empresaId: string,
    redSocialId: string,
    request: SocialNetworkRequest,
  ): Observable<SocialNetworkResponse> {
    return this.http.put<SocialNetworkResponse>(
      `${this.resourceUrl}/${encodeURIComponent(empresaId)}/redes-sociales/${encodeURIComponent(redSocialId)}`,
      request,
    );
  }

  deleteSocialNetwork(empresaId: string, redSocialId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.resourceUrl}/${encodeURIComponent(empresaId)}/redes-sociales/${encodeURIComponent(redSocialId)}`,
    );
  }
}
