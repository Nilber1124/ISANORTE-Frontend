import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { conSesionCliente } from '../../core/auth/cliente-session.context';
import {
  CarritoClienteRequest,
  CarritoClienteResponse,
  ClienteAuthResponse,
  ClienteLoginRequest,
  ClienteRegistroRequest,
} from '../models/cliente/cliente.model';
import { PublicQuoteResponse } from '../models/public-content/public-quote.model';

@Injectable({ providedIn: 'root' })
export class ClienteApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${inject(API_BASE_URL).replace(/\/+$/, '')}/api/publico/cuenta`;

  registrar(request: ClienteRegistroRequest): Observable<ClienteAuthResponse> {
    return this.http.post<ClienteAuthResponse>(`${this.resourceUrl}/registro`, request);
  }

  login(request: ClienteLoginRequest): Observable<ClienteAuthResponse> {
    return this.http.post<ClienteAuthResponse>(`${this.resourceUrl}/login`, request);
  }

  misCotizaciones(): Observable<PublicQuoteResponse[]> {
    return this.http.get<PublicQuoteResponse[]>(`${this.resourceUrl}/cotizaciones`, {
      context: conSesionCliente(),
    });
  }

  obtenerCarrito(): Observable<CarritoClienteResponse> {
    return this.http.get<CarritoClienteResponse>(`${this.resourceUrl}/carrito`, { context: conSesionCliente() });
  }

  guardarCarrito(request: CarritoClienteRequest): Observable<CarritoClienteResponse> {
    return this.http.put<CarritoClienteResponse>(`${this.resourceUrl}/carrito`, request, {
      context: conSesionCliente(),
    });
  }
}
