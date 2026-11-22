import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { conSesionCliente } from '../../core/auth/cliente-session.context';
import { ProductCompetitorComparisonResponse } from '../models/product/product-competitor-comparison-response.model';
import { ProductPriceComparisonRequest } from '../models/product/product-price-comparison-request.model';
import { ProductPriceComparisonResponse } from '../models/product/product-price-comparison-response.model';
import {
  CreateProductReviewRequest,
  ProductReviewOrder,
  ProductReviewResponse,
  RecommendedProductResponse,
  ReviewSummaryResponse,
} from '../models/product/product-review.model';
import {
  IsadecorHomeResponse,
  IsadecorPublicationResponse,
} from '../models/isadecor-home/isadecor-home-response.model';
import { PublicBusinessUnitResponse } from '../models/public-content/public-business-unit.model';
import { PublicHomeResponse } from '../models/public-content/public-home.model';
import {
  PublicPageResponse,
  PublicPageType,
  PublicProject,
} from '../models/public-content/public-page.model';
import {
  CatalogBackendOrder,
  CatalogExtraFilters,
  PublicProductCatalogResponse,
} from '../models/public-content/public-product-catalog.model';
import { PublicProductDetailResponse } from '../models/public-content/public-product-detail.model';
import {
  PublicOrderRequest,
  PublicOrderResponse,
} from '../models/public-content/public-order.model';
import { PublicTrustResponse } from '../models/public-content/public-trust.model';
import { PublicSiteResponse } from '../models/public-content/public-site.model';
import { trimTrailingSlashes } from '../../shared/utils/text';

@Injectable({ providedIn: 'root' })
export class PublicContentApiService {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = trimTrailingSlashes(inject(API_BASE_URL));
  private readonly resourceUrl = `${this.apiBaseUrl}/api/publico/sitios`;

  getHome(siteKey: string): Observable<PublicHomeResponse> {
    return this.http.get<PublicHomeResponse>(
      `${this.resourceUrl}/${encodeURIComponent(siteKey)}/home`,
    );
  }

  getTrust(siteKey: string): Observable<PublicTrustResponse> {
    return this.http.get<PublicTrustResponse>(
      `${this.resourceUrl}/${encodeURIComponent(siteKey)}/confianza`,
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

  getProject(siteKey: string, projectSlug: string): Observable<PublicProject> {
    return this.http.get<PublicProject>(
      `${this.resourceUrl}/${encodeURIComponent(siteKey)}/proyectos/${encodeURIComponent(projectSlug)}`,
    );
  }

  getBusinessUnit(siteKey: string, unitSlug: string): Observable<PublicBusinessUnitResponse> {
    return this.http.get<PublicBusinessUnitResponse>(
      `${this.resourceUrl}/${encodeURIComponent(siteKey)}/unidades/${encodeURIComponent(unitSlug)}`,
    );
  }

  getProductCatalog(
    siteKey: string,
    unitSlug: string,
    query: CatalogExtraFilters & {
      page: number;
      size: number;
      categoria?: string | null;
      q?: string | null;
      soloDescuento?: boolean;
      soloDisponible?: boolean;
      soloDestacados?: boolean;
      orden?: CatalogBackendOrder;
    },
  ): Observable<PublicProductCatalogResponse> {
    const params: Record<string, string | number | boolean> = {
      page: query.page,
      size: query.size,
    };
    if (query.categoria) params['categoria'] = query.categoria;
    if (query.q) params['q'] = query.q;
    if (query.soloDescuento) params['soloDescuento'] = true;
    if (query.soloDisponible) params['soloDisponible'] = true;
    if (query.soloDestacados) params['soloDestacados'] = true;
    if (query.orden) params['orden'] = query.orden;
    if (query.modalidad) params['modalidad'] = query.modalidad;
    if (query.facilInstalacion != null) params['facilInstalacion'] = query.facilInstalacion;
    if (query.precioMin != null) params['precioMin'] = query.precioMin;
    if (query.precioMax != null) params['precioMax'] = query.precioMax;
    if (query.acabado) params['acabado'] = query.acabado;

    return this.http.get<PublicProductCatalogResponse>(
      `${this.resourceUrl}/${encodeURIComponent(siteKey)}/unidades/${encodeURIComponent(unitSlug)}/catalogo`,
      { params },
    );
  }

  getIsadecorHome(siteKey: string, unitSlug: string): Observable<IsadecorHomeResponse> {
    return this.http.get<IsadecorHomeResponse>(
      `${this.resourceUrl}/${encodeURIComponent(siteKey)}/unidades/${encodeURIComponent(unitSlug)}/home`,
    );
  }

  getIsadecorCommunity(siteKey: string, unitSlug: string): Observable<IsadecorPublicationResponse[]> {
    return this.http.get<IsadecorPublicationResponse[]>(
      `${this.resourceUrl}/${encodeURIComponent(siteKey)}/unidades/${encodeURIComponent(unitSlug)}/comunidad`,
    );
  }

  getProductDetail(
    siteKey: string,
    unitSlug: string,
    productSlug: string,
  ): Observable<PublicProductDetailResponse> {
    return this.http.get<PublicProductDetailResponse>(
      `${this.resourceUrl}/${encodeURIComponent(siteKey)}/unidades/${encodeURIComponent(unitSlug)}` +
        `/productos/${encodeURIComponent(productSlug)}`,
    );
  }

  getRecommendedProducts(
    siteKey: string,
    unitSlug: string,
    productSlug: string,
  ): Observable<RecommendedProductResponse[]> {
    return this.http.get<RecommendedProductResponse[]>(
      `${this.productResourceUrl(siteKey, unitSlug, productSlug)}/recomendados`,
    );
  }

  getProductReviews(
    siteKey: string,
    unitSlug: string,
    productSlug: string,
    order: ProductReviewOrder,
  ): Observable<ProductReviewResponse[]> {
    return this.http.get<ProductReviewResponse[]>(
      `${this.productResourceUrl(siteKey, unitSlug, productSlug)}/resenas`,
      { params: { orden: order } },
    );
  }

  getProductReviewSummary(
    siteKey: string,
    unitSlug: string,
    productSlug: string,
  ): Observable<ReviewSummaryResponse> {
    return this.http.get<ReviewSummaryResponse>(
      `${this.productResourceUrl(siteKey, unitSlug, productSlug)}/resenas/resumen`,
    );
  }

  createProductReview(
    siteKey: string,
    unitSlug: string,
    productSlug: string,
    request: CreateProductReviewRequest,
  ): Observable<ProductReviewResponse> {
    return this.http.post<ProductReviewResponse>(
      `${this.productResourceUrl(siteKey, unitSlug, productSlug)}/resenas`,
      request,
      { context: conSesionCliente() },
    );
  }

  compareProductPrice(
    siteKey: string,
    unitSlug: string,
    productSlug: string,
    request: ProductPriceComparisonRequest,
  ): Observable<ProductPriceComparisonResponse> {
    return this.http.post<ProductPriceComparisonResponse>(
      `${this.productResourceUrl(siteKey, unitSlug, productSlug)}/comparar-precio`,
      request,
      { context: conSesionCliente() },
    );
  }

  compareProductCompetitors(
    siteKey: string,
    unitSlug: string,
    productSlug: string,
  ): Observable<ProductCompetitorComparisonResponse> {
    return this.http.get<ProductCompetitorComparisonResponse>(
      `${this.productResourceUrl(siteKey, unitSlug, productSlug)}/comparacion-competidores`,
      { context: conSesionCliente() },
    );
  }

  markReviewUseful(reviewId: string): Observable<ProductReviewResponse> {
    return this.http.post<ProductReviewResponse>(
      `${this.apiBaseUrl}/api/publico/resenas/${encodeURIComponent(reviewId)}/util`,
      {},
    );
  }

  createOrder(
    siteKey: string,
    unitSlug: string,
    request: PublicOrderRequest,
  ): Observable<PublicOrderResponse> {
    return this.http.post<PublicOrderResponse>(
      `${this.resourceUrl}/${encodeURIComponent(siteKey)}/unidades/${encodeURIComponent(unitSlug)}/pedidos`,
      request,
      { context: conSesionCliente() },
    );
  }

  private productResourceUrl(siteKey: string, unitSlug: string, productSlug: string): string {
    return (
      `${this.resourceUrl}/${encodeURIComponent(siteKey)}/unidades/${encodeURIComponent(unitSlug)}` +
      `/productos/${encodeURIComponent(productSlug)}`
    );
  }
}
