import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { IsadecorQuoteCartService } from '../../../core/services/isadecor-quote-cart.service';
import { Alert } from '../../../shared/components/alert/alert';
import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { InputField } from '../../../shared/components/input-field/input-field';
import { Loading } from '../../../shared/components/loading/loading';
import { TextareaField } from '../../../shared/components/textarea-field/textarea-field';
import { ClienteAuthService } from '../../../core/auth/cliente-auth.service';
import { QuoteFacade } from './quote.facade';

interface QuoteFieldErrors {
  nombreCliente?: string;
  emailCliente?: string;
  telefonoCliente?: string;
}

@Component({
  selector: 'app-isadecor-quote',
  imports: [
    Alert,
    Badge,
    Button,
    Card,
    DecimalPipe,
    EmptyState,
    InputField,
    Loading,
    RouterLink,
    TextareaField,
  ],
  providers: [QuoteFacade],
  templateUrl: './quote.html',
  styleUrl: './quote.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Quote {
  readonly facade = inject(QuoteFacade);
  readonly cart = inject(IsadecorQuoteCartService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly clienteAuth = inject(ClienteAuthService);

  readonly nombreCliente = signal('');
  readonly emailCliente = signal('');
  readonly telefonoCliente = signal('');
  readonly empresaCliente = signal('');
  readonly ciudad = signal('');
  readonly mensaje = signal('');
  readonly submitted = signal(false);

  readonly fieldErrors = computed(() => this.validationErrors());

  constructor() {
    const params = this.route.snapshot.queryParamMap;
    const productoSlug = params.get('producto');

    const cliente = this.clienteAuth.cliente();
    if (cliente) {
      this.nombreCliente.set([cliente.nombre, cliente.apellido].filter(Boolean).join(' '));
      this.emailCliente.set(cliente.email);
      this.telefonoCliente.set(cliente.telefono ?? '');
    }

    if (productoSlug) {
      const quantity = this.parseInitialQuantity(params.get('cantidad'));
      afterNextRender(() => {
        this.facade.mergeProductIntoCart(productoSlug, quantity);
        void this.router.navigate([], { relativeTo: this.route, queryParams: {}, replaceUrl: true });
      });
    }
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.facade.submitting() || this.hasValidationErrors() || this.cart.items().length === 0) {
      return;
    }

    this.facade.submit({
      nombreCliente: this.nombreCliente().trim(),
      emailCliente: this.emailCliente().trim(),
      telefonoCliente: this.telefonoCliente().trim(),
      empresaCliente: this.optionalValue(this.empresaCliente()),
      ciudad: this.optionalValue(this.ciudad()),
      mensaje: this.optionalValue(this.mensaje()),
    });
  }

  private validationErrors(): QuoteFieldErrors {
    if (!this.submitted()) return {};
    return {
      nombreCliente: this.nombreCliente().trim() ? undefined : 'Ingresa tu nombre.',
      emailCliente: this.emailCliente().trim()
        ? this.isValidEmail(this.emailCliente())
          ? undefined
          : 'Ingresa un correo válido.'
        : 'Ingresa tu correo.',
      telefonoCliente: this.telefonoCliente().trim() ? undefined : 'Ingresa tu teléfono.',
    };
  }

  private hasValidationErrors(): boolean {
    return Object.values(this.validationErrors()).some(Boolean);
  }

  private parseInitialQuantity(value: string | null): number {
    if (value === null || !/^[1-9]\d*$/.test(value)) return 1;
    const quantity = Number(value);
    return Number.isFinite(quantity) && Number.isInteger(quantity) && quantity > 0 ? quantity : 1;
  }

  private isValidEmail(value: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
  }

  private optionalValue(value: string): string | null {
    return value.trim() || null;
  }
}
