import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Botón flotante para escribir por WhatsApp. No se muestra si no hay un enlace válido. */
@Component({
  selector: 'app-whatsapp-float',
  templateUrl: './whatsapp-float.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WhatsappFloat {
  readonly href = input<string | null>(null);
}
