import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { trimTrailingSlashes } from '../../shared/utils/text';
import { SaleRequest, SaleResponse } from '../models/sale/sale.model';

@Injectable({ providedIn: 'root' })
export class SaleApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${trimTrailingSlashes(inject(API_BASE_URL))}/api/ventas`;

  getAll(): Observable<SaleResponse[]> {
    return this.http.get<SaleResponse[]>(this.resourceUrl);
  }

  create(request: SaleRequest): Observable<SaleResponse> {
    return this.http.post<SaleResponse>(this.resourceUrl, request);
  }

  update(id: string, request: SaleRequest): Observable<SaleResponse> {
    return this.http.put<SaleResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`, request);
  }

  /** Anula (devuelve el stock) o reactiva (lo vuelve a descontar) una venta. */
  setAnulada(id: string, anulada: boolean): Observable<SaleResponse> {
    return this.http.patch<SaleResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}/anulada`, { anulada });
  }
}
