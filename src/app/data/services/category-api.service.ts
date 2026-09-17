import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { CategoryCreateRequest } from '../models/category/category-create-request.model';
import { CategoryResponse } from '../models/category/category-response.model';
import { CategoryUpdateRequest } from '../models/category/category-update-request.model';
import { ActiveRequest } from '../models/common/active-request.model';

@Injectable({ providedIn: 'root' })
export class CategoryApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${inject(API_BASE_URL).replace(/\/+$/, '')}/api/categorias`;

  getAll(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(this.resourceUrl);
  }

  getActive(): Observable<CategoryResponse[]> {
    return this.http.get<CategoryResponse[]>(`${this.resourceUrl}/activas`);
  }

  getActiveBySlug(slug: string): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(
      `${this.resourceUrl}/activas/slug/${encodeURIComponent(slug)}`,
    );
  }

  getById(id: string): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getBySlug(slug: string): Observable<CategoryResponse> {
    return this.http.get<CategoryResponse>(`${this.resourceUrl}/slug/${encodeURIComponent(slug)}`);
  }

  create(request: CategoryCreateRequest): Observable<CategoryResponse> {
    return this.http.post<CategoryResponse>(this.resourceUrl, request);
  }

  update(id: string, request: CategoryUpdateRequest): Observable<CategoryResponse> {
    return this.http.put<CategoryResponse>(
      `${this.resourceUrl}/${encodeURIComponent(id)}`,
      request,
    );
  }

  changeActive(id: string, request: ActiveRequest): Observable<CategoryResponse> {
    return this.http.patch<CategoryResponse>(
      `${this.resourceUrl}/${encodeURIComponent(id)}/activo`,
      request,
    );
  }
}
