import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { Alert } from '../../../../shared/components/alert/alert';
import { Button } from '../../../../shared/components/button/button';
import { Card } from '../../../../shared/components/card/card';
import { InputField } from '../../../../shared/components/input-field/input-field';
import { TextareaField } from '../../../../shared/components/textarea-field/textarea-field';
import { PublicContactFacade } from '../public-contact.facade';

/**
 * Formulario de contacto de ISANORTE. Solo presenta: el estado, la validación y el envío
 * viven en `PublicContactFacade`, que cada página le pasa (Contacto y Home).
 */
@Component({
  selector: 'app-contact-form',
  imports: [Alert, Button, Card, InputField, TextareaField],
  templateUrl: './contact-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactForm {
  readonly facade = input.required<PublicContactFacade>();

  protected submit(event: Event): void {
    event.preventDefault();
    this.facade().submit();
  }
}
