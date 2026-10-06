import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { ProductPriceComparisonResponse } from '../../../../../data/models/product/product-price-comparison-response.model';
import { Alert, AlertVariant } from '../../../../../shared/components/alert/alert';
import { Button } from '../../../../../shared/components/button/button';
import { InputField } from '../../../../../shared/components/input-field/input-field';

@Component({
  selector: 'app-product-price-comparison',
  imports: [Alert, Button, DatePipe, DecimalPipe, InputField],
  templateUrl: './product-price-comparison.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class ProductPriceComparison {
  readonly unitSlug = input.required<string>();
  readonly loading = input(false);
  readonly result = input<ProductPriceComparisonResponse | null>(null);
  readonly error = input<string | null>(null);

  readonly compare = output<string>();
  readonly edited = output<void>();

  protected readonly externalUrl = signal('');
  protected readonly inputId = computed(() =>
    `product-price-url-${this.unitSlug().replace(/[^a-z0-9_-]/gi, '-')}`,
  );

  protected submit(event: Event): void {
    event.preventDefault();
    const url = this.externalUrl().trim();
    if (url) this.compare.emit(url);
  }

  protected markEdited(): void {
    this.edited.emit();
  }

  protected resultVariant(result: ProductPriceComparisonResponse): AlertVariant {
    if (result.estado === 'SUCCESS') return 'success';
    if (result.estado === 'SITE_UNREACHABLE') return 'warning';
    return 'info';
  }
}
