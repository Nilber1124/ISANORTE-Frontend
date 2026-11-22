import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { trimTrailingSlashes } from '../../shared/utils/text';
import { NotificationInbox } from '../models/notification/notification.model';

/** Bandeja de avisos del administrador (pedidos nuevos, pagos recibidos). */
@Injectable({ providedIn: 'root' })
export class NotificationApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${trimTrailingSlashes(inject(API_BASE_URL))}/api/notificaciones`;

  getInbox(): Observable<NotificationInbox> {
    return this.http.get<NotificationInbox>(this.resourceUrl);
  }

  markAllRead(): Observable<void> {
    return this.http.patch<void>(`${this.resourceUrl}/leidas`, {});
  }
}
