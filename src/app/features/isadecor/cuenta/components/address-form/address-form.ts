import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

import { AddressResponse } from '../../../../../data/models/address/address.model';
import { Alert } from '../../../../../shared/components/alert/alert';
import { Button } from '../../../../../shared/components/button/button';
import { InputField } from '../../../../../shared/components/input-field/input-field';

export interface AddressFormValue {
  alias: string | null;
  calle: string;
  distrito: string;
  ciudad: string;
  referencia: string | null;
  telefonoContacto: string;
  principal: boolean;
}

interface AddressFieldErrors {
  calle?: string;
  distrito?: string;
  ciudad?: string;
  telefonoContacto?: string;
}

@Component({
  selector: 'app-address-form',
  imports: [Alert, Button, InputField],
  templateUrl: './address-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressForm implements OnInit {
  readonly initialValue = input<AddressResponse | null>(null);
  readonly submitting = input(false, { transform: booleanAttribute });
  readonly serverError = input<string | null>(null);

  readonly saved = output<AddressFormValue>();
  readonly canceled = output<void>();

  readonly alias = signal('');
  readonly calle = signal('');
  readonly distrito = signal('');
  readonly ciudad = signal('');
  readonly referencia = signal('');
  readonly telefonoContacto = signal('');
  readonly principal = signal(false);
  readonly submitted = signal(false);

  readonly fieldErrors = computed(() => this.validationErrors());

  ngOnInit(): void {
    const address = this.initialValue();
    if (address === null) return;

    this.alias.set(address.alias ?? '');
    this.calle.set(address.calle);
    this.distrito.set(address.distrito);
    this.ciudad.set(address.ciudad);
    this.referencia.set(address.referencia ?? '');
    this.telefonoContacto.set(address.telefonoContacto);
    this.principal.set(address.principal);
  }

  protected togglePrincipal(event: Event): void {
    this.principal.set((event.target as HTMLInputElement).checked);
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    if (this.submitting() || this.hasValidationErrors()) return;

    this.saved.emit({
      alias: this.optionalValue(this.alias()),
      calle: this.calle().trim(),
      distrito: this.distrito().trim(),
      ciudad: this.ciudad().trim(),
      referencia: this.optionalValue(this.referencia()),
      telefonoContacto: this.telefonoContacto().trim(),
      principal: this.principal(),
    });
  }

  private validationErrors(): AddressFieldErrors {
    if (!this.submitted()) return {};
    return {
      calle: this.calle().trim() ? undefined : 'Ingresa la calle o avenida.',
      distrito: this.distrito().trim() ? undefined : 'Ingresa el distrito.',
      ciudad: this.ciudad().trim() ? undefined : 'Ingresa la ciudad.',
      telefonoContacto: this.telefonoContacto().trim() ? undefined : 'Ingresa un teléfono de contacto.',
    };
  }

  private hasValidationErrors(): boolean {
    return Object.values(this.validationErrors()).some(Boolean);
  }

  private optionalValue(value: string): string | null {
    return value.trim() || null;
  }
}
