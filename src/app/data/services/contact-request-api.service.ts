import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import {
  ContactRequestResponse,
  ContactRequestStatus,
  ContactRequestStatusRequest,
} from '../models/contact/contact-request.model';

@Injectable({ providedIn: 'root' })
export class ContactRequestApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${inject(API_BASE_URL).replace(/\/+$/, '')}/api/solicitudes-contacto`;

  getAll(status?: ContactRequestStatus | null): Observable<ContactRequestResponse[]> {
    const params = status ? new HttpParams().set('estado', status) : undefined;
    return this.http.get<ContactRequestResponse[]>(this.resourceUrl, { params });
  }

  getById(id: string): Observable<ContactRequestResponse> {
    return this.http.get<ContactRequestResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  changeStatus(
    id: string,
    request: ContactRequestStatusRequest,
  ): Observable<ContactRequestResponse> {
    return this.http.patch<ContactRequestResponse>(
      `${this.resourceUrl}/${encodeURIComponent(id)}/estado`,
      request,
    );
  }
}
