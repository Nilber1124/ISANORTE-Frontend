import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import {
  AnnouncementDestination,
  AnnouncementRequest,
  AnnouncementResponse,
} from '../models/announcement/announcement.model';
import { ActiveRequest } from '../models/common/active-request.model';

@Injectable({ providedIn: 'root' })
export class AnnouncementApiService {
  private readonly http = inject(HttpClient);
  private readonly apiOrigin = inject(API_BASE_URL).replace(/\/+$/, '');
  private readonly adminUrl = `${this.apiOrigin}/api/anuncios`;
  private readonly publicUrl = `${this.apiOrigin}/api/publico/anuncios`;

  getAll(): Observable<AnnouncementResponse[]> {
    return this.http.get<AnnouncementResponse[]>(this.adminUrl);
  }

  getById(id: string): Observable<AnnouncementResponse> {
    return this.http.get<AnnouncementResponse>(`${this.adminUrl}/${encodeURIComponent(id)}`);
  }

  getPublic(
    destination: Exclude<AnnouncementDestination, 'AMBOS'>,
  ): Observable<AnnouncementResponse[]> {
    return this.http.get<AnnouncementResponse[]>(
      `${this.publicUrl}/${encodeURIComponent(destination)}`,
    );
  }

  create(request: AnnouncementRequest): Observable<AnnouncementResponse> {
    return this.http.post<AnnouncementResponse>(this.adminUrl, request);
  }

  update(id: string, request: AnnouncementRequest): Observable<AnnouncementResponse> {
    return this.http.put<AnnouncementResponse>(
      `${this.adminUrl}/${encodeURIComponent(id)}`,
      request,
    );
  }

  changeActive(id: string, request: ActiveRequest): Observable<AnnouncementResponse> {
    return this.http.patch<AnnouncementResponse>(
      `${this.adminUrl}/${encodeURIComponent(id)}/activo`,
      request,
    );
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.adminUrl}/${encodeURIComponent(id)}`);
  }
}
