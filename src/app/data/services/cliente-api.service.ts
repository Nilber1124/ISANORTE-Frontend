import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { conSesionCliente } from '../../core/auth/cliente-session.context';
import { AddressRequest, AddressResponse } from '../models/address/address.model';
import {
  CarritoClienteRequest,
  CarritoClienteResponse,
  ClienteAuthResponse,
  ClienteLoginRequest,
  ClienteRegistroRequest,
} from '../models/cliente/cliente.model';
import { PublicOrderResponse } from '../models/public-content/public-order.model';
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

  misPedidos(): Observable<PublicOrderResponse[]> {
    return this.http.get<PublicOrderResponse[]>(`${this.resourceUrl}/pedidos`, {
      context: conSesionCliente(),
    });
  }

  direcciones(): Observable<AddressResponse[]> {
    return this.http.get<AddressResponse[]>(`${this.resourceUrl}/direcciones`, {
      context: conSesionCliente(),
    });
  }

  crearDireccion(request: AddressRequest): Observable<AddressResponse> {
    return this.http.post<AddressResponse>(`${this.resourceUrl}/direcciones`, request, {
      context: conSesionCliente(),
    });
  }

  actualizarDireccion(id: string, request: AddressRequest): Observable<AddressResponse> {
    return this.http.put<AddressResponse>(
      `${this.resourceUrl}/direcciones/${encodeURIComponent(id)}`,
      request,
      { context: conSesionCliente() },
    );
  }

  eliminarDireccion(id: string): Observable<void> {
    return this.http.delete<void>(`${this.resourceUrl}/direcciones/${encodeURIComponent(id)}`, {
      context: conSesionCliente(),
    });
  }
}
