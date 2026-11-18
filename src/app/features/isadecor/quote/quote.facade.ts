import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { ISADECOR_UNIT_SLUG, PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import { IsadecorQuoteCartService } from '../../../core/services/isadecor-quote-cart.service';
import { QuoteChannel } from '../../../data/models/quote/quote-channel.enum';
import {
  PublicQuoteRequest,
  PublicQuoteResponse,
} from '../../../data/models/public-content/public-quote.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';

export interface QuoteCustomerDetails {
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  empresaCliente: string | null;
  ciudad: string | null;
  mensaje: string | null;
}

@Injectable()
export class QuoteFacade {
  private readonly publicApi = inject(PublicContentApiService);
  private readonly cart = inject(IsadecorQuoteCartService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _mergingProduct = signal(false);
  private readonly _submitting = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _quoteResult = signal<PublicQuoteResponse | null>(null);

  readonly mergingProduct = this._mergingProduct.asReadonly();
  readonly submitting = this._submitting.asReadonly();
  readonly error = this._error.asReadonly();
  readonly quoteResult = this._quoteResult.asReadonly();

  /**
   * Agrega al carrito compartido el producto recibido por `?producto=slug` (botones "Cotizar"
   * del catálogo o del detalle de producto), para que la página trabaje siempre sobre el mismo
   * carrito sin importar desde dónde se llegó.
   */
  mergeProductIntoCart(slug: string, quantity: number): void {
    const normalizedSlug = slug.trim();
    if (normalizedSlug.length === 0 || !isPlatformBrowser(this.platformId)) return;

    this._mergingProduct.set(true);
    this.publicApi
      .getProductDetail(PUBLIC_SITE_KEY, ISADECOR_UNIT_SLUG, normalizedSlug)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._mergingProduct.set(false)),
      )
      .subscribe({
        next: (product) => this.cart.addProduct(product, null, quantity),
        error: () => {
          this._error.set(
            'No pudimos agregar ese producto a tu cotización. Agrégalo de nuevo desde el catálogo.',
          );
        },
      });
  }

  submit(customer: QuoteCustomerDetails): void {
    const items = this.cart.items();
    if (this._submitting() || items.length === 0) return;

    this._error.set(null);
    this._submitting.set(true);
    const request: PublicQuoteRequest = {
      ...customer,
      canal: QuoteChannel.FORMULARIO,
      detalles: items.map((item) => ({
        productoSlug: item.productSlug,
        varianteSku: item.variant?.sku ?? null,
        cantidad: item.quantity,
        notas: null,
      })),
    };

    this.publicApi
      .createQuote(PUBLIC_SITE_KEY, ISADECOR_UNIT_SLUG, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._submitting.set(false)),
      )
      .subscribe({
        next: (response) => {
          this._quoteResult.set(response);
          this.cart.clear();
        },
        error: (error: unknown) => this._error.set(this.submitErrorMessage(error)),
      });
  }

  private submitErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) return 'Revisa los datos ingresados e inténtalo nuevamente.';
      if (error.status === 404) return 'Uno de los productos ya no está disponible para cotizar.';
      if (error.status === 409)
        return 'No pudimos registrar la solicitud por un conflicto. Inténtalo nuevamente.';
    }

    return 'No pudimos enviar tu solicitud. Comprueba tu conexión e inténtalo nuevamente.';
  }
}
