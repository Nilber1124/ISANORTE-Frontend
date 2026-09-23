import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { PublicContactRequest, PublicContactResponse } from '../models/contact/public-contact-request.model';
import { ProductCompetitorComparisonResponse } from '../models/product/product-competitor-comparison-response.model';
import { ProductPriceComparisonRequest } from '../models/product/product-price-comparison-request.model';
import { ProductPriceComparisonResponse } from '../models/product/product-price-comparison-response.model';
import { PublicHomeResponse } from '../models/public-content/public-home.model';
import { PublicPageResponse, PublicPageType } from '../models/public-content/public-page.model';
import { PublicProductCatalogResponse } from '../models/public-content/public-product-catalog.model';
import { PublicProductDetailResponse } from '../models/public-content/public-product-detail.model';
import { PublicQuoteRequest, PublicQuoteResponse } from '../models/public-content/public-quote.model';
import { PublicSiteResponse } from '../models/public-content/public-site.model';

@Injectable({ providedIn: 'root' })
export class PublicContentApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL).replace(/\/+$/, '');
  private readonly resourceUrl = `${this.apiBaseUrl}/api/publico/sitios`;

  compareProductPrice(siteKey: string, unitSlug: string, productSlug: string,
    request: ProductPriceComparisonRequest): Observable<ProductPriceComparisonResponse> {
    return this.http.post<ProductPriceComparisonResponse>(
      `${this.resourceUrl}/${encodeURIComponent(siteKey)}/unidades/${encodeURIComponent(unitSlug)}` +
        `/productos/${encodeURIComponent(productSlug)}/comparar-precio`, request);
  }

  compareProductCompetitors(siteKey: string, unitSlug: string,
    productSlug: string): Observable<ProductCompetitorComparisonResponse> {
    return this.http.get<ProductCompetitorComparisonResponse>(
      `${this.resourceUrl}/${encodeURIComponent(siteKey)}/unidades/${encodeURIComponent(unitSlug)}` +
        `/productos/${encodeURIComponent(productSlug)}/comparacion-competidores`);
  }

  getHome(siteKey: string): Observable<PublicHomeResponse> {
    return this.http.get<PublicHomeResponse>(`${this.resourceUrl}/${encodeURIComponent(siteKey)}/home`);
  }

  getSite(siteKey: string): Observable<PublicSiteResponse> {
    return this.http.get<PublicSiteResponse>(`${this.resourceUrl}/${encodeURIComponent(siteKey)}`);
  }

  getPage(siteKey: string, page: PublicPageType): Observable<PublicPageResponse> {
    return this.http.get<PublicPageResponse>(
      `${this.resourceUrl}/${encodeURIComponent(siteKey)}/paginas/${encodeURIComponent(page)}`);
  }

  getProductCatalog(siteKey: string, unitSlug: string): Observable<PublicProductCatalogResponse> {
    return this.http.get<PublicProductCatalogResponse>(
      `${this.resourceUrl}/${encodeURIComponent(siteKey)}/unidades/${encodeURIComponent(unitSlug)}/catalogo`);
  }

  getProductDetail(siteKey: string, unitSlug: string, productSlug: string): Observable<PublicProductDetailResponse> {
    return this.http.get<PublicProductDetailResponse>(
      `${this.resourceUrl}/${encodeURIComponent(siteKey)}/unidades/${encodeURIComponent(unitSlug)}` +
        `/productos/${encodeURIComponent(productSlug)}`);
  }

  createQuote(
    siteKey: string,
    unitSlug: string,
    request: PublicQuoteRequest,
  ): Observable<PublicQuoteResponse> {
    return this.http.post<PublicQuoteResponse>(
      `${this.resourceUrl}/${encodeURIComponent(siteKey)}/unidades/${encodeURIComponent(unitSlug)}/cotizaciones`,
      request,
    );
  }

  submitContact(request: PublicContactRequest): Observable<PublicContactResponse> {
    return this.http.post<PublicContactResponse>(`${this.apiBaseUrl}/api/publico/contacto`, request);
  }
}

