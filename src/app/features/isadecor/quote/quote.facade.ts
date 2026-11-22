import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { ISADECOR_UNIT_SLUG, PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import { IsadecorQuoteCartService } from '../../../core/services/isadecor-quote-cart.service';
import { PublicSiteFacade } from '../../../layouts/public-layout/public-site.facade';
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
  private readonly site = inject(PublicSiteFacade);
  private readonly document = inject(DOCUMENT, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _mergingProduct = signal(false);
  private readonly _sent = signal(false);
  private readonly _error = signal<string | null>(null);

  readonly mergingProduct = this._mergingProduct.asReadonly();
  /** `true` cuando ya se abrió WhatsApp con la solicitud. */
  readonly sent = this._sent.asReadonly();
  readonly error = this._error.asReadonly();

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

  /**
   * No guarda nada en el sistema: abre WhatsApp con los productos y los datos del cliente escritos
   * en el mensaje, que es por donde se atienden las cotizaciones.
   */
  submit(customer: QuoteCustomerDetails): void {
    const items = this.cart.items();
    if (items.length === 0) return;

    this._error.set(null);
    const href = this.site.whatsappHrefFor(buildQuoteWhatsappMessage(customer, items));
    if (!href) {
      this._error.set(
        'Por ahora no podemos abrir WhatsApp. Escríbenos por correo o llámanos a los datos de contacto.',
      );
      return;
    }
    this.document?.defaultView?.open(href, '_blank', 'noopener');
    this._sent.set(true);
    this.cart.clear();
  }
}

export interface QuoteMessageItem {
  readonly productName: string;
  readonly variant: { readonly name: string } | null;
  readonly quantity: number;
}

/** Texto de WhatsApp con la cotización: productos con su cantidad y una línea por dato del cliente. */
export function buildQuoteWhatsappMessage(
  customer: QuoteCustomerDetails,
  items: readonly QuoteMessageItem[],
): string {
  const lines = ['Hola ISADECOR, quisiera cotizar estos productos:', ''];
  for (const item of items) {
    const variant = item.variant ? ` (${item.variant.name})` : '';
    lines.push(`• ${item.productName}${variant} × ${item.quantity}`);
  }
  lines.push('');
  const add = (label: string, value: string | null): void => {
    if (value?.trim()) lines.push(`*${label}:* ${value.trim()}`);
  };
  add('Nombre', customer.nombreCliente);
  add('Teléfono', customer.telefonoCliente);
  add('Correo', customer.emailCliente);
  add('Empresa', customer.empresaCliente);
  add('Ciudad', customer.ciudad);
  add('Mensaje', customer.mensaje);
  return lines.join('\n');
}
