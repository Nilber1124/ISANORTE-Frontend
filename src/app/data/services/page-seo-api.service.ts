import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import {
  PageSeoRequest,
  PageSeoResponse,
  PageSeoUpdateRequest,
} from '../models/content/page-seo.model';
import { trimTrailingSlashes } from '../../shared/utils/text';

@Injectable({ providedIn: 'root' })
export class PageSeoApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${trimTrailingSlashes(inject(API_BASE_URL))}/api/seo-paginas`;

  getAll(): Observable<PageSeoResponse[]> {
    return this.http.get<PageSeoResponse[]>(this.resourceUrl);
  }
  getById(id: string): Observable<PageSeoResponse> {
    return this.http.get<PageSeoResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }
  create(request: PageSeoRequest): Observable<PageSeoResponse> {
    return this.http.post<PageSeoResponse>(this.resourceUrl, request);
  }
  update(id: string, request: PageSeoUpdateRequest): Observable<PageSeoResponse> {
    return this.http.put<PageSeoResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`, request);
  }
}
