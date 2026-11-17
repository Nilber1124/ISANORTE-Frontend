import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Button } from '../button/button';

/**
 * Cierre de página con un titular y hasta dos acciones (por ejemplo, cotizar y WhatsApp).
 * Presenta el texto y los enlaces que recibe; no conoce el negocio.
 */
@Component({
  selector: 'app-cta-band',
  imports: [Button],
  templateUrl: './cta-band.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CtaBand {
  readonly title = input.required<string>();
  readonly text = input<string | null>(null);
  readonly primaryLabel = input.required<string>();
  readonly primaryHref = input.required<string>();
  readonly secondaryLabel = input<string | null>(null);
  readonly secondaryHref = input<string | null>(null);
  readonly secondaryTarget = input<'_self' | '_blank' | undefined>();
}
