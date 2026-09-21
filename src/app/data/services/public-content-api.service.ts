import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import {
  PublicContactRequest,
  PublicContactResponse,
} from '../models/contact/public-contact-request.model';
import { PublicHomeResponse } from '../models/public-content/public-home.model';
import { PublicPageResponse, PublicPageType } from '../models/public-content/public-page.model';
import { PublicSiteResponse } from '../models/public-content/public-site.model';

@Injectable({ providedIn: 'root' })
export class PublicContentApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL).replace(/\/+$/, '');
  private readonly resourceUrl = `${this.apiBaseUrl}/api/publico/sitios`;

  getHome(siteKey: string): Observable<PublicHomeResponse> {
    return this.http.get<PublicHomeResponse>(
      `${this.resourceUrl}/${encodeURIComponent(siteKey)}/home`,
    );
  }

  getSite(siteKey: string): Observable<PublicSiteResponse> {
    return this.http.get<PublicSiteResponse>(`${this.resourceUrl}/${encodeURIComponent(siteKey)}`);
  }

  getPage(siteKey: string, page: PublicPageType): Observable<PublicPageResponse> {
    return this.http.get<PublicPageResponse>(
      `${this.resourceUrl}/${encodeURIComponent(siteKey)}/paginas/${encodeURIComponent(page)}`,
    );
  }

  submitContact(request: PublicContactRequest): Observable<PublicContactResponse> {
    return this.http.post<PublicContactResponse>(`${this.apiBaseUrl}/api/publico/contacto`, request);
  }
}
