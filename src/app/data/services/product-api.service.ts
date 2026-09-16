import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { ProductCreateRequest } from '../models/product/product-create-request.model';
import { ProductResponse } from '../models/product/product-response.model';
import { ProductStatusRequest } from '../models/product/product-status-request.model';
import { ProductUpdateRequest } from '../models/product/product-update-request.model';

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${inject(API_BASE_URL).replace(/\/+$/, '')}/api/productos`;

  getAll(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(this.resourceUrl);
  }

  getPublished(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.resourceUrl}/publicados`);
  }

  getPublishedBySlug(slug: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(
      `${this.resourceUrl}/publicados/slug/${encodeURIComponent(slug)}`,
    );
  }

  getPublishedBySku(sku: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(
      `${this.resourceUrl}/publicados/sku/${encodeURIComponent(sku)}`,
    );
  }

  getById(id: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getBySlug(slug: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.resourceUrl}/slug/${encodeURIComponent(slug)}`);
  }

  getBySku(sku: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.resourceUrl}/sku/${encodeURIComponent(sku)}`);
  }

  create(request: ProductCreateRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.resourceUrl, request);
  }

  update(id: string, request: ProductUpdateRequest): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`, request);
  }

  changeStatus(id: string, request: ProductStatusRequest): Observable<ProductResponse> {
    return this.http.patch<ProductResponse>(
      `${this.resourceUrl}/${encodeURIComponent(id)}/estado`,
      request,
    );
  }
}
