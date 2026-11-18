import { DOCUMENT, DecimalPipe, isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  PLATFORM_ID,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  IsadecorQuoteCartItem,
  IsadecorQuoteCartService,
} from '../../../core/services/isadecor-quote-cart.service';
import { Alert } from '../../../shared/components/alert/alert';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { PublicSiteFacade } from '../../../layouts/public-layout/public-site.facade';

@Component({
  selector: 'app-isadecor-cart',
  imports: [Alert, Button, DecimalPipe, EmptyState, RouterLink],
  templateUrl: './cart.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Cart {
  readonly cart = inject(IsadecorQuoteCartService);
  readonly publicSite = inject(PublicSiteFacade);
  readonly feedback = signal<string | null>(null);

  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  readonly whatsappPhone = computed(() => this.publicSite.company()?.whatsapp?.trim() || null);
  readonly canRequestByWhatsApp = computed(
    () => this.cart.buildWhatsAppUrl(this.whatsappPhone()) !== null,
  );

  protected updateQuantity(item: IsadecorQuoteCartItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    const quantity = input.valueAsNumber;
    if (!this.cart.updateQuantity(item.key, quantity)) {
      input.value = String(item.quantity);
      this.feedback.set('La cantidad debe ser un número entero mayor que cero.');
      return;
    }

    this.feedback.set(null);
  }

  protected decreaseQuantity(item: IsadecorQuoteCartItem): void {
    if (item.quantity <= 1) {
      this.feedback.set('La cantidad mínima es 1.');
      return;
    }
    this.cart.updateQuantity(item.key, item.quantity - 1);
    this.feedback.set(null);
  }

  protected increaseQuantity(item: IsadecorQuoteCartItem): void {
    if (!this.cart.updateQuantity(item.key, item.quantity + 1)) {
      this.feedback.set('No se pudo aumentar más la cantidad.');
      return;
    }
    this.feedback.set(null);
  }

  protected removeItem(key: string): void {
    this.cart.removeItem(key);
    this.feedback.set(null);
  }

  protected clearCart(): void {
    this.cart.clear();
    this.feedback.set(null);
  }

  protected requestByWhatsApp(): void {
    const url = this.cart.buildWhatsAppUrl(this.whatsappPhone());
    if (!url) {
      this.feedback.set(
        this.cart.itemCount() === 0
          ? 'Agrega al menos un producto antes de solicitar la cotización.'
          : 'No hay un número de WhatsApp comercial disponible en este momento.',
      );
      return;
    }

    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const opened = this.document.defaultView?.open(url, '_blank', 'noopener,noreferrer');
      if (!opened) {
        this.feedback.set(
          'El navegador bloqueó WhatsApp. Habilita las ventanas emergentes e inténtalo de nuevo.',
        );
        return;
      }
      opened.opener = null;
      this.feedback.set(null);
    } catch {
      this.feedback.set('No pudimos abrir WhatsApp. Inténtalo nuevamente.');
    }
  }
}
