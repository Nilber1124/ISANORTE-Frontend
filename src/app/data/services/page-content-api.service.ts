import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import {
  PageContentRequest,
  PageContentResponse,
  PageContentUpdateRequest,
} from '../models/content/page-content.model';

@Injectable({ providedIn: 'root' })
export class PageContentApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${inject(API_BASE_URL).replace(/\/+$/, '')}/api/contenidos-pagina`;

  getAll(): Observable<PageContentResponse[]> {
    return this.http.get<PageContentResponse[]>(this.resourceUrl);
  }
  getById(id: string): Observable<PageContentResponse> {
    return this.http.get<PageContentResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }
  create(request: PageContentRequest): Observable<PageContentResponse> {
    return this.http.post<PageContentResponse>(this.resourceUrl, request);
  }
  update(id: string, request: PageContentUpdateRequest): Observable<PageContentResponse> {
    return this.http.put<PageContentResponse>(
      `${this.resourceUrl}/${encodeURIComponent(id)}`,
      request,
    );
  }
}
