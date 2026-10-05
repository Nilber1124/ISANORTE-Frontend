import { DecimalPipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { PublicProductDetailResponse } from '../../../data/models/public-content/public-product-detail.model';
import { PublicQuoteRequest } from '../../../data/models/public-content/public-quote.model';
import { QuoteChannel } from '../../../data/models/quote/quote-channel.enum';
import { Alert } from '../../../shared/components/alert/alert';
import { Badge, BadgeVariant } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { InputField } from '../../../shared/components/input-field/input-field';
import { Loading } from '../../../shared/components/loading/loading';
import { SelectField, SelectOption } from '../../../shared/components/select-field/select-field';
import { TextareaField } from '../../../shared/components/textarea-field/textarea-field';
import { QuoteFacade } from './quote.facade';

interface AvailabilityPresentation {
  label: string;
  variant: BadgeVariant;
}
interface QuoteFieldErrors {
  nombreCliente?: string;
  emailCliente?: string;
  telefonoCliente?: string;
  cantidad?: string;
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
    SelectField,
    TextareaField,
  ],
  providers: [QuoteFacade],
  templateUrl: './quote.html',
  styleUrl: './quote.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Quote {
  readonly facade = inject(QuoteFacade);
  private readonly route = inject(ActivatedRoute);

  readonly nombreCliente = signal('');
  readonly emailCliente = signal('');
  readonly telefonoCliente = signal('');
  readonly empresaCliente = signal('');
  readonly ciudad = signal('');
  readonly mensaje = signal('');
  readonly cantidad = signal('1');
  readonly notas = signal('');
  readonly varianteSku = signal('');
  readonly submitted = signal(false);

  readonly variantOptions = computed<readonly SelectOption[]>(() =>
    (this.facade.product()?.variantes ?? []).map((variant) => ({
      value: variant.sku,
      label: `${variant.nombre} · ${variant.sku}`,
    })),
  );
  readonly mainImage = computed(() => this.findMainImage(this.facade.product()));
  readonly fieldErrors = computed(() => this.validationErrors());

  constructor() {
    const params = this.route.snapshot.queryParamMap;
    this.cantidad.set(String(this.parseInitialQuantity(params.get('cantidad'))));

    afterNextRender(() => this.facade.loadProduct(params.get('producto') ?? ''));
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.facade.submitting() || this.hasValidationErrors() || this.facade.product() === null)
      return;

    this.facade.submit(this.buildRequest(this.facade.product()!));
  }

  protected availability(product: PublicProductDetailResponse): AvailabilityPresentation {
    const values: Record<ProductAvailability, AvailabilityPresentation> = {
      [ProductAvailability.DISPONIBLE]: { label: 'Disponible', variant: 'success' },
      [ProductAvailability.AGOTADO]: { label: 'Agotado', variant: 'error' },
      [ProductAvailability.BAJO_PEDIDO]: { label: 'Bajo pedido', variant: 'warning' },
      [ProductAvailability.CONSULTAR]: { label: 'Consultar', variant: 'info' },
    };
    return values[product.disponibilidad];
  }

  private validationErrors(): QuoteFieldErrors {
    if (!this.submitted()) return {};
    const quantity = Number(this.cantidad());
    return {
      nombreCliente: this.nombreCliente().trim() ? undefined : 'Ingresa tu nombre.',
      emailCliente: this.emailCliente().trim()
        ? this.isValidEmail(this.emailCliente())
          ? undefined
          : 'Ingresa un correo válido.'
        : 'Ingresa tu correo.',
      telefonoCliente: this.telefonoCliente().trim() ? undefined : 'Ingresa tu teléfono.',
      cantidad:
        Number.isFinite(quantity) && Number.isInteger(quantity) && quantity > 0
          ? undefined
          : 'Ingresa una cantidad entera mayor que 0.',
    };
  }

  private hasValidationErrors(): boolean {
    return Object.values(this.validationErrors()).some(Boolean);
  }

  private buildRequest(product: PublicProductDetailResponse): PublicQuoteRequest {
    return {
      nombreCliente: this.nombreCliente().trim(),
      emailCliente: this.emailCliente().trim(),
      telefonoCliente: this.telefonoCliente().trim(),
      empresaCliente: this.optionalValue(this.empresaCliente()),
      ciudad: this.optionalValue(this.ciudad()),
      mensaje: this.optionalValue(this.mensaje()),
      canal: QuoteChannel.FORMULARIO,
      detalles: [
        {
          productoSlug: product.slug,
          varianteSku: this.optionalValue(this.varianteSku()),
          cantidad: Number(this.cantidad()),
          notas: this.optionalValue(this.notas()),
        },
      ],
    };
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

  private findMainImage(product: PublicProductDetailResponse | null): string | null {
    if (product === null) return null;
    return (
      product.imagenes?.find((image) => image.esPrincipal)?.url ??
      product.imagenes?.[0]?.url ??
      null
    );
  }
}
