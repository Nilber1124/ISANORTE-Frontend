import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import {
  ProductPriceComparisonResponse,
  PriceComparisonStatus,
} from '../../../../../data/models/product/product-price-comparison-response.model';
import { ISADECOR_UNIT_SLUG } from '../../../../../core/config/public-site.config';
import { Alert } from '../../../../../shared/components/alert/alert';
import { Button } from '../../../../../shared/components/button/button';
import { Card } from '../../../../../shared/components/card/card';
import { InputField } from '../../../../../shared/components/input-field/input-field';

@Component({
  selector: 'app-product-price-comparison',
  imports: [Alert, Button, Card, DatePipe, DecimalPipe, InputField],
  templateUrl: './product-price-comparison.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductPriceComparison {
  readonly unitSlug = input<string>(ISADECOR_UNIT_SLUG);
  readonly loading = input(false);
  readonly result = input<ProductPriceComparisonResponse | null>(null);
  readonly error = input<string | null>(null);
  readonly compare = output<string>();
  readonly edited = output<void>();
  readonly url = signal('');
  readonly validationError = signal<string | undefined>(undefined);
  readonly absoluteDifference = computed(() => {
    const difference = this.result()?.diferencia;
    return difference === null || difference === undefined ? null : Math.abs(difference);
  });
  readonly statusTitle = computed(() => {
    const titles: Record<PriceComparisonStatus, string> = {
      SUCCESS: 'Comparación realizada',
      INVALID_URL: 'URL inválida',
      BLOCKED_URL: 'URL no permitida',
      SITE_UNREACHABLE: 'Sitio no accesible',
      UNSUPPORTED_CONTENT: 'Sitio no compatible',
      PRICE_NOT_FOUND: 'Precio no encontrado',
      CURRENCY_UNKNOWN: 'Comparación no válida: moneda desconocida',
      CURRENCY_MISMATCH: 'Comparación no válida: monedas diferentes',
      NOT_COMPARABLE: 'Comparación no válida',
    };
    const result = this.result();
    return result ? titles[result.estado] : '';
  });

  updateUrl(value: string): void {
    this.url.set(value);
    this.validationError.set(undefined);
    this.edited.emit();
  }

  submit(event: Event): void {
    event.preventDefault();
    if (this.loading()) return;
    const value = this.url().trim();
    this.validationError.set(undefined);
    try {
      const url = new URL(value);
      if (
        value.length > 2048 ||
        !/^https?:\/\//i.test(value) ||
        !['http:', 'https:'].includes(url.protocol) ||
        !url.hostname ||
        url.username ||
        url.password ||
        url.hash ||
        value.includes('\\')
      )
        throw new Error();
      if ((!url.pathname || url.pathname === '/') && !url.search) {
        this.validationError.set(
          'Ingresa el enlace directo del producto, no únicamente la página principal de la tienda.',
        );
        return;
      }
    } catch {
      this.validationError.set('Ingresa una URL válida del producto.');
      return;
    }
    this.compare.emit(value);
  }
}
