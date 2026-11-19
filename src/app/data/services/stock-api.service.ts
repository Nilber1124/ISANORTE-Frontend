import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { trimTrailingSlashes } from '../../shared/utils/text';
import {
  StockAdjustmentRequest,
  StockMovementResponse,
  StockResponse,
} from '../models/stock/stock.model';

/** Ajustes de inventario por producto o por acabado y su historial (administración). */
@Injectable({ providedIn: 'root' })
export class StockApiService {
  private readonly http = inject(HttpClient);
  private readonly base = `${trimTrailingSlashes(inject(API_BASE_URL))}/api/productos`;

  adjust(
    productId: string,
    variantId: string | null,
    request: StockAdjustmentRequest,
  ): Observable<StockResponse> {
    const path = variantId ? `/${productId}/variantes/${variantId}/stock` : `/${productId}/stock`;
    return this.http.patch<StockResponse>(`${this.base}${path}`, request);
  }

  history(productId: string): Observable<StockMovementResponse[]> {
    return this.http.get<StockMovementResponse[]>(`${this.base}/${productId}/movimientos-stock`);
  }
}
