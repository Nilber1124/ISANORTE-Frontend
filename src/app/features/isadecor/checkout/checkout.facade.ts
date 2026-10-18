import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { ISADECOR_UNIT_SLUG, PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import { IsadecorQuoteCartService } from '../../../core/services/isadecor-quote-cart.service';
import { AddressResponse } from '../../../data/models/address/address.model';
import { PublicOrderRequest, PublicOrderResponse } from '../../../data/models/public-content/public-order.model';
import { ClienteApiService } from '../../../data/services/cliente-api.service';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';

export interface CheckoutNewAddressDetails {
  alias: string | null;
  calle: string;
  distrito: string;
  ciudad: string;
  referencia: string | null;
  telefonoContacto: string;
}

export interface CheckoutSubmission {
  direccionId: string | null;
  direccionNueva: CheckoutNewAddressDetails | null;
  ruc: string | null;
  razonSocial: string | null;
}

@Injectable()
export class CheckoutFacade {
  private readonly publicApi = inject(PublicContentApiService);
  private readonly clienteApi = inject(ClienteApiService);
  private readonly cart = inject(IsadecorQuoteCartService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _mergingProduct = signal(false);
  private readonly _loadingAddresses = signal(false);
  private readonly _addresses = signal<readonly AddressResponse[]>([]);
  private readonly _submitting = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _orderResult = signal<PublicOrderResponse | null>(null);

  readonly mergingProduct = this._mergingProduct.asReadonly();
  readonly loadingAddresses = this._loadingAddresses.asReadonly();
  readonly addresses = this._addresses.asReadonly();
  readonly submitting = this._submitting.asReadonly();
  readonly error = this._error.asReadonly();
  readonly orderResult = this._orderResult.asReadonly();

  /**
   * Agrega al carrito compartido el producto recibido por `?producto=slug` (botón "Comprar ahora"
   * del detalle de producto), para que el checkout trabaje siempre sobre el mismo carrito.
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
            'No pudimos agregar ese producto a tu pedido. Agrégalo de nuevo desde el catálogo.',
          );
        },
      });
  }

  loadAddresses(): void {
    this._loadingAddresses.set(true);
    this.clienteApi
      .direcciones()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loadingAddresses.set(false)),
      )
      .subscribe({
        next: (addresses) => this._addresses.set(addresses),
        error: () => this._addresses.set([]),
      });
  }

  submit(details: CheckoutSubmission): void {
    const items = this.cart.items();
    if (this._submitting() || items.length === 0) return;

    this._error.set(null);
    this._submitting.set(true);
    const request: PublicOrderRequest = {
      direccionId: details.direccionId,
      direccionAlias: details.direccionNueva?.alias ?? null,
      direccionCalle: details.direccionNueva?.calle ?? null,
      direccionDistrito: details.direccionNueva?.distrito ?? null,
      direccionCiudad: details.direccionNueva?.ciudad ?? null,
      direccionReferencia: details.direccionNueva?.referencia ?? null,
      direccionTelefonoContacto: details.direccionNueva?.telefonoContacto ?? null,
      ruc: details.ruc,
      razonSocial: details.razonSocial,
      detalles: items.map((item) => ({
        productoSlug: item.productSlug,
        varianteSku: item.variant?.sku ?? null,
        cantidad: item.quantity,
      })),
    };

    this.publicApi
      .createOrder(PUBLIC_SITE_KEY, ISADECOR_UNIT_SLUG, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._submitting.set(false)),
      )
      .subscribe({
        next: (response) => {
          this._orderResult.set(response);
          this.cart.clear();
        },
        error: (error: unknown) => this._error.set(this.submitErrorMessage(error)),
      });
  }

  private submitErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) return 'Revisa los datos ingresados e inténtalo nuevamente.';
      if (error.status === 404) return 'Uno de los productos ya no está disponible para comprar.';
      if (error.status === 409)
        return 'Uno de los productos se agotó mientras completabas tu compra. Actualiza tu carrito e inténtalo nuevamente.';
    }

    return 'No pudimos registrar tu pedido. Comprueba tu conexión e inténtalo nuevamente.';
  }
}
