import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { OrderResponse } from '../models/order/order-response.model';
import { OrderStatusRequest } from '../models/order/order-status-request.model';
import { OrderStatus } from '../models/order/order-status.enum';

@Injectable({ providedIn: 'root' })
export class OrderApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${inject(API_BASE_URL).replace(/\/+$/, '')}/api/pedidos`;

  getAll(): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(this.resourceUrl);
  }

  getById(id: string): Observable<OrderResponse> {
    return this.http.get<OrderResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getByStatus(status: OrderStatus): Observable<OrderResponse[]> {
    return this.http.get<OrderResponse[]>(
      `${this.resourceUrl}/estado/${encodeURIComponent(status)}`,
    );
  }

  changeStatus(id: string, request: OrderStatusRequest): Observable<OrderResponse> {
    return this.http.patch<OrderResponse>(
      `${this.resourceUrl}/${encodeURIComponent(id)}/estado`,
      request,
    );
  }
}
