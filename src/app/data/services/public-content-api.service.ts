import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { PublicHomeResponse } from '../models/public-content/public-home.model';
import { PublicSiteResponse } from '../models/public-content/public-site.model';

@Injectable({ providedIn: 'root' })
export class PublicContentApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${inject(API_BASE_URL).replace(/\/+$/, '')}/api/publico/sitios`;

  getHome(siteKey: string): Observable<PublicHomeResponse> {
    return this.http.get<PublicHomeResponse>(
      `${this.resourceUrl}/${encodeURIComponent(siteKey)}/home`,
    );
  }

  getSite(siteKey: string): Observable<PublicSiteResponse> {
    return this.http.get<PublicSiteResponse>(`${this.resourceUrl}/${encodeURIComponent(siteKey)}`);
  }
}
