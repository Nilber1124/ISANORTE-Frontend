import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { ActiveRequest } from '../models/common/active-request.model';
import { ServiceCreateRequest } from '../models/service/service-create-request.model';
import { ServiceResponse } from '../models/service/service-response.model';
import { ServiceUpdateRequest } from '../models/service/service-update-request.model';
import {
  ServiceBenefitRequest,
  ServiceBenefitResponse,
} from '../models/service/service-benefit.model';

@Injectable({ providedIn: 'root' })
export class ServiceApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${inject(API_BASE_URL).replace(/\/+$/, '')}/api/servicios`;

  getAll(): Observable<ServiceResponse[]> {
    return this.http.get<ServiceResponse[]>(this.resourceUrl);
  }

  getActive(): Observable<ServiceResponse[]> {
    return this.http.get<ServiceResponse[]>(`${this.resourceUrl}/activos`);
  }

  getActiveBySlug(slug: string): Observable<ServiceResponse> {
    return this.http.get<ServiceResponse>(
      `${this.resourceUrl}/activos/slug/${encodeURIComponent(slug)}`,
    );
  }

  getById(id: string): Observable<ServiceResponse> {
    return this.http.get<ServiceResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getBySlug(slug: string): Observable<ServiceResponse> {
    return this.http.get<ServiceResponse>(`${this.resourceUrl}/slug/${encodeURIComponent(slug)}`);
  }

  create(request: ServiceCreateRequest): Observable<ServiceResponse> {
    return this.http.post<ServiceResponse>(this.resourceUrl, request);
  }

  update(id: string, request: ServiceUpdateRequest): Observable<ServiceResponse> {
    return this.http.put<ServiceResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`, request);
  }

  changeActive(id: string, request: ActiveRequest): Observable<ServiceResponse> {
    return this.http.patch<ServiceResponse>(
      `${this.resourceUrl}/${encodeURIComponent(id)}/activo`,
      request,
    );
  }

  createBenefit(
    serviceId: string,
    request: ServiceBenefitRequest,
  ): Observable<ServiceBenefitResponse> {
    return this.http.post<ServiceBenefitResponse>(
      `${this.serviceUrl(serviceId)}/beneficios`,
      request,
    );
  }

  updateBenefit(
    serviceId: string,
    benefitId: string,
    request: ServiceBenefitRequest,
  ): Observable<ServiceBenefitResponse> {
    return this.http.put<ServiceBenefitResponse>(
      `${this.serviceUrl(serviceId)}/beneficios/${encodeURIComponent(benefitId)}`,
      request,
    );
  }

  deleteBenefit(serviceId: string, benefitId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.serviceUrl(serviceId)}/beneficios/${encodeURIComponent(benefitId)}`,
    );
  }

  private serviceUrl(id: string): string {
    return `${this.resourceUrl}/${encodeURIComponent(id)}`;
  }
}
