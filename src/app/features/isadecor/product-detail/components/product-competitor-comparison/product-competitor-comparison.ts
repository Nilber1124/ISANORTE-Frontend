import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

import {
  ProductCompetitorComparisonResponse,
  ProductCompetitorResult,
} from '../../../../../data/models/product/product-competitor-comparison-response.model';
import { Alert } from '../../../../../shared/components/alert/alert';
import { Button } from '../../../../../shared/components/button/button';

@Component({
  selector: 'app-product-competitor-comparison',
  imports: [Alert, Button, DatePipe, DecimalPipe],
  templateUrl: './product-competitor-comparison.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class ProductCompetitorComparison {
  readonly unitSlug = input.required<string>();
  readonly loading = input(false);
  readonly result = input<ProductCompetitorComparisonResponse | null>(null);
  readonly error = input<string | null>(null);

  readonly compare = output<void>();

  protected storeLabel(competitor: ProductCompetitorResult): string {
    return competitor.empresa === 'PISOPAK' ? 'PISOPAK' : 'DECORPLAS';
  }
}
