import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { ISADECOR_UNIT_SLUG, PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import { PublicProductDetailResponse } from '../../../data/models/public-content/public-product-detail.model';
import {
  PublicQuoteRequest,
  PublicQuoteResponse,
} from '../../../data/models/public-content/public-quote.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';

@Injectable()
export class QuoteFacade {
  private readonly publicApi = inject(PublicContentApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _product = signal<PublicProductDetailResponse | null>(null);
  private readonly _loadingProduct = signal(true);
  private readonly _submitting = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _notFound = signal(false);
  private readonly _quoteResult = signal<PublicQuoteResponse | null>(null);

  readonly product = this._product.asReadonly();
  readonly loadingProduct = this._loadingProduct.asReadonly();
  readonly submitting = this._submitting.asReadonly();
  readonly error = this._error.asReadonly();
  readonly notFound = this._notFound.asReadonly();
  readonly quoteResult = this._quoteResult.asReadonly();

  loadProduct(slug: string): void {
    const normalizedSlug = slug.trim();
    this._product.set(null);
    this._quoteResult.set(null);
    this._error.set(null);
    this._notFound.set(false);

    if (normalizedSlug.length === 0) {
      this._loadingProduct.set(false);
      this._error.set('Selecciona un producto desde el catálogo para solicitar una cotización.');
      return;
    }

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    this._loadingProduct.set(true);
    this.publicApi
      .getProductDetail(PUBLIC_SITE_KEY, ISADECOR_UNIT_SLUG, normalizedSlug)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loadingProduct.set(false)),
      )
      .subscribe({
        next: (product) => this._product.set(product),
        error: (error: unknown) => {
          if (error instanceof HttpErrorResponse && error.status === 404) {
            this._notFound.set(true);
            this._error.set('Producto no encontrado. Revisa el catálogo e inténtalo nuevamente.');
            return;
          }

          this._error.set(
            'No pudimos cargar el producto. Comprueba tu conexión e inténtalo nuevamente.',
          );
        },
      });
  }

  submit(request: PublicQuoteRequest): void {
    if (this._submitting() || this._product() === null) {
      return;
    }

    this._error.set(null);
    this._submitting.set(true);
    this.publicApi
      .createQuote(PUBLIC_SITE_KEY, ISADECOR_UNIT_SLUG, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._submitting.set(false)),
      )
      .subscribe({
        next: (response) => this._quoteResult.set(response),
        error: (error: unknown) => this._error.set(this.submitErrorMessage(error)),
      });
  }

  private submitErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) return 'Revisa los datos ingresados e inténtalo nuevamente.';
      if (error.status === 404) return 'El producto ya no está disponible para cotizar.';
      if (error.status === 409)
        return 'No pudimos registrar la solicitud por un conflicto. Inténtalo nuevamente.';
    }

    return 'No pudimos enviar tu solicitud. Comprueba tu conexión e inténtalo nuevamente.';
  }
}
