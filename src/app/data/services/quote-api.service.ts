import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { QuoteCreateRequest } from '../models/quote/quote-create-request.model';
import { QuoteResponse } from '../models/quote/quote-response.model';
import { QuoteStatusRequest } from '../models/quote/quote-status-request.model';
import { QuoteStatus } from '../models/quote/quote-status.enum';

@Injectable({ providedIn: 'root' })
export class QuoteApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${inject(API_BASE_URL).replace(/\/+$/, '')}/api/cotizaciones`;

  getAll(): Observable<QuoteResponse[]> {
    return this.http.get<QuoteResponse[]>(this.resourceUrl);
  }

  getById(id: string): Observable<QuoteResponse> {
    return this.http.get<QuoteResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getByCode(code: string): Observable<QuoteResponse> {
    return this.http.get<QuoteResponse>(`${this.resourceUrl}/codigo/${encodeURIComponent(code)}`);
  }

  getByStatus(status: QuoteStatus): Observable<QuoteResponse[]> {
    return this.http.get<QuoteResponse[]>(
      `${this.resourceUrl}/estado/${encodeURIComponent(status)}`,
    );
  }

  create(request: QuoteCreateRequest): Observable<QuoteResponse> {
    return this.http.post<QuoteResponse>(this.resourceUrl, request);
  }

  changeStatus(id: string, request: QuoteStatusRequest): Observable<QuoteResponse> {
    return this.http.patch<QuoteResponse>(
      `${this.resourceUrl}/${encodeURIComponent(id)}/estado`,
      request,
    );
  }
}
