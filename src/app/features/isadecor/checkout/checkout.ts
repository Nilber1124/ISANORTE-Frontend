import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { IsadecorQuoteCartService } from '../../../core/services/isadecor-quote-cart.service';
import { Alert } from '../../../shared/components/alert/alert';
import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { InputField } from '../../../shared/components/input-field/input-field';
import { Loading } from '../../../shared/components/loading/loading';
import { SelectField, SelectOption } from '../../../shared/components/select-field/select-field';
import { AddressResponse } from '../../../data/models/address/address.model';
import { CheckoutFacade } from './checkout.facade';

const NEW_ADDRESS_OPTION = '__nueva__';

interface CheckoutFieldErrors {
  calle?: string;
  distrito?: string;
  ciudad?: string;
  telefonoContacto?: string;
}

@Component({
  selector: 'app-isadecor-checkout',
  imports: [Alert, Badge, Button, Card, DecimalPipe, EmptyState, InputField, Loading, RouterLink, SelectField],
  providers: [CheckoutFacade],
  templateUrl: './checkout.html',
  styleUrl: './checkout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Checkout {
  readonly facade = inject(CheckoutFacade);
  readonly cart = inject(IsadecorQuoteCartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly newAddressOption = NEW_ADDRESS_OPTION;

  readonly selectedAddressId = signal(NEW_ADDRESS_OPTION);
  private addressTouched = false;

  readonly alias = signal('');
  readonly calle = signal('');
  readonly distrito = signal('');
  readonly ciudad = signal('');
  readonly referencia = signal('');
  readonly telefonoContacto = signal('');
  readonly ruc = signal('');
  readonly razonSocial = signal('');
  readonly submitted = signal(false);

  readonly usingNewAddress = computed(() => this.selectedAddressId() === NEW_ADDRESS_OPTION);
  readonly addressOptions = computed<SelectOption[]>(() => [
    ...this.facade.addresses().map((address) => ({
      value: address.id,
      label: this.addressLabel(address),
    })),
    { value: NEW_ADDRESS_OPTION, label: 'Usar una dirección nueva' },
  ]);
  readonly fieldErrors = computed(() => this.validationErrors());

  constructor() {
    this.facade.loadAddresses();

    // Preselecciona la dirección principal una vez carga, salvo que el cliente ya haya elegido algo.
    effect(() => {
      const addresses = this.facade.addresses();
      if (addresses.length === 0 || this.addressTouched) return;
      const principal = addresses.find((address) => address.principal) ?? addresses[0];
      this.selectedAddressId.set(principal.id);
    });

    const params = this.route.snapshot.queryParamMap;
    const productoSlug = params.get('producto');
    if (productoSlug) {
      const quantity = this.parseInitialQuantity(params.get('cantidad'));
      afterNextRender(() => {
        this.facade.mergeProductIntoCart(productoSlug, quantity);
        void this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
      });
    }
  }

  protected selectAddress(id: string): void {
    this.addressTouched = true;
    this.selectedAddressId.set(id);
  }

  protected submit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    if (this.facade.submitting() || this.hasValidationErrors() || this.cart.items().length === 0) {
      return;
    }

    this.facade.submit({
      direccionId: this.usingNewAddress() ? null : this.selectedAddressId(),
      direccionNueva: this.usingNewAddress()
        ? {
            alias: this.optionalValue(this.alias()),
            calle: this.calle().trim(),
            distrito: this.distrito().trim(),
            ciudad: this.ciudad().trim(),
            referencia: this.optionalValue(this.referencia()),
            telefonoContacto: this.telefonoContacto().trim(),
          }
        : null,
      ruc: this.optionalValue(this.ruc()),
      razonSocial: this.optionalValue(this.razonSocial()),
    });
  }

  private validationErrors(): CheckoutFieldErrors {
    if (!this.submitted() || !this.usingNewAddress()) return {};
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

  private addressLabel(address: AddressResponse): string {
    const base = address.alias?.trim() || address.calle;
    return address.principal ? `${base} (Principal)` : base;
  }

  private parseInitialQuantity(value: string | null): number {
    if (value === null || !/^[1-9]\d*$/.test(value)) return 1;
    const quantity = Number(value);
    return Number.isFinite(quantity) && Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
  }

  private optionalValue(value: string): string | null {
    return value.trim() || null;
  }
}
