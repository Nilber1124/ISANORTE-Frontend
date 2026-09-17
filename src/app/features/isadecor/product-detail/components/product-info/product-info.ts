import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { ProductAvailability } from '../../../../../data/models/product/product-availability.enum';
import { ProductResponse } from '../../../../../data/models/product/product-response.model';
import { Badge, BadgeVariant } from '../../../../../shared/components/badge/badge';

interface AvailabilityPresentation {
  label: string;
  variant: BadgeVariant;
}

@Component({
  selector: 'app-product-info',
  imports: [Badge, DecimalPipe],
  templateUrl: './product-info.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductInfo {
  readonly product = input.required<ProductResponse>();

  protected readonly availability = computed<AvailabilityPresentation>(() => {
    const presentations: Record<ProductAvailability, AvailabilityPresentation> = {
      [ProductAvailability.DISPONIBLE]: { label: 'Disponible', variant: 'success' },
      [ProductAvailability.AGOTADO]: { label: 'Agotado', variant: 'error' },
      [ProductAvailability.BAJO_PEDIDO]: { label: 'Bajo pedido', variant: 'warning' },
      [ProductAvailability.CONSULTAR]: { label: 'Consultar', variant: 'info' },
    };

    return presentations[this.product().disponibilidad];
  });

  protected readonly showSummary = computed(() => {
    const summary = this.normalizeText(this.product().resumen ?? '');
    const description = this.normalizeText(this.product().descripcion);
    return summary.length > 0 && summary !== description;
  });

  private normalizeText(value: string): string {
    return value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('es');
  }
}
