import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import {
  CalculationConfigCreateRequest,
  ProductCreateRequest,
  ProductDocumentCreateRequest,
  ProductImageCreateRequest,
  ProductSpecificationCreateRequest,
  ProductVariantCreateRequest,
} from '../models/product/product-create-request.model';
import {
  CalculationConfigResponse,
  ProductDocumentResponse,
  ProductImageResponse,
  ProductResponse,
  ProductSpecificationResponse,
  ProductVariantResponse,
} from '../models/product/product-response.model';
import { ProductStatusRequest } from '../models/product/product-status-request.model';
import { ProductUpdateRequest } from '../models/product/product-update-request.model';

@Injectable({ providedIn: 'root' })
export class ProductApiService {
  private readonly http = inject(HttpClient);
  private readonly resourceUrl = `${inject(API_BASE_URL).replace(/\/+$/, '')}/api/productos`;

  getAll(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(this.resourceUrl);
  }

  getPublished(): Observable<ProductResponse[]> {
    return this.http.get<ProductResponse[]>(`${this.resourceUrl}/publicados`);
  }

  getPublishedBySlug(slug: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(
      `${this.resourceUrl}/publicados/slug/${encodeURIComponent(slug)}`,
    );
  }

  getPublishedBySku(sku: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(
      `${this.resourceUrl}/publicados/sku/${encodeURIComponent(sku)}`,
    );
  }

  getById(id: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`);
  }

  getBySlug(slug: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.resourceUrl}/slug/${encodeURIComponent(slug)}`);
  }

  getBySku(sku: string): Observable<ProductResponse> {
    return this.http.get<ProductResponse>(`${this.resourceUrl}/sku/${encodeURIComponent(sku)}`);
  }

  create(request: ProductCreateRequest): Observable<ProductResponse> {
    return this.http.post<ProductResponse>(this.resourceUrl, request);
  }

  update(id: string, request: ProductUpdateRequest): Observable<ProductResponse> {
    return this.http.put<ProductResponse>(`${this.resourceUrl}/${encodeURIComponent(id)}`, request);
  }

  changeStatus(id: string, request: ProductStatusRequest): Observable<ProductResponse> {
    return this.http.patch<ProductResponse>(
      `${this.resourceUrl}/${encodeURIComponent(id)}/estado`,
      request,
    );
  }

  createImage(
    productId: string,
    request: ProductImageCreateRequest,
  ): Observable<ProductImageResponse> {
    return this.http.post<ProductImageResponse>(
      `${this.resourceUrl}/${encodeURIComponent(productId)}/imagenes`,
      request,
    );
  }

  updateImage(
    productId: string,
    imageId: string,
    request: ProductImageCreateRequest,
  ): Observable<ProductImageResponse> {
    return this.http.put<ProductImageResponse>(
      `${this.resourceUrl}/${encodeURIComponent(productId)}/imagenes/${encodeURIComponent(imageId)}`,
      request,
    );
  }

  deleteImage(productId: string, imageId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.resourceUrl}/${encodeURIComponent(productId)}/imagenes/${encodeURIComponent(imageId)}`,
    );
  }

  createVariant(
    productId: string,
    request: ProductVariantCreateRequest,
  ): Observable<ProductVariantResponse> {
    return this.http.post<ProductVariantResponse>(
      `${this.resourceUrl}/${encodeURIComponent(productId)}/variantes`,
      request,
    );
  }

  updateVariant(
    productId: string,
    variantId: string,
    request: ProductVariantCreateRequest,
  ): Observable<ProductVariantResponse> {
    return this.http.put<ProductVariantResponse>(
      `${this.resourceUrl}/${encodeURIComponent(productId)}/variantes/${encodeURIComponent(variantId)}`,
      request,
    );
  }

  deleteVariant(productId: string, variantId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.resourceUrl}/${encodeURIComponent(productId)}/variantes/${encodeURIComponent(variantId)}`,
    );
  }

  createSpecification(
    productId: string,
    request: ProductSpecificationCreateRequest,
  ): Observable<ProductSpecificationResponse> {
    return this.http.post<ProductSpecificationResponse>(
      `${this.resourceUrl}/${encodeURIComponent(productId)}/especificaciones`,
      request,
    );
  }

  updateSpecification(
    productId: string,
    specificationId: string,
    request: ProductSpecificationCreateRequest,
  ): Observable<ProductSpecificationResponse> {
    return this.http.put<ProductSpecificationResponse>(
      `${this.resourceUrl}/${encodeURIComponent(productId)}/especificaciones/${encodeURIComponent(specificationId)}`,
      request,
    );
  }

  deleteSpecification(productId: string, specificationId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.resourceUrl}/${encodeURIComponent(productId)}/especificaciones/${encodeURIComponent(specificationId)}`,
    );
  }

  createDocument(
    productId: string,
    request: ProductDocumentCreateRequest,
  ): Observable<ProductDocumentResponse> {
    return this.http.post<ProductDocumentResponse>(
      `${this.resourceUrl}/${encodeURIComponent(productId)}/documentos`,
      request,
    );
  }

  updateDocument(
    productId: string,
    documentId: string,
    request: ProductDocumentCreateRequest,
  ): Observable<ProductDocumentResponse> {
    return this.http.put<ProductDocumentResponse>(
      `${this.resourceUrl}/${encodeURIComponent(productId)}/documentos/${encodeURIComponent(documentId)}`,
      request,
    );
  }

  deleteDocument(productId: string, documentId: string): Observable<void> {
    return this.http.delete<void>(
      `${this.resourceUrl}/${encodeURIComponent(productId)}/documentos/${encodeURIComponent(documentId)}`,
    );
  }

  updateCalculationConfig(
    productId: string,
    request: CalculationConfigCreateRequest,
  ): Observable<CalculationConfigResponse> {
    return this.http.put<CalculationConfigResponse>(
      `${this.resourceUrl}/${encodeURIComponent(productId)}/configuracion-calculo`,
      request,
    );
  }
}
