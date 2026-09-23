import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';

import { ProductAvailability } from '../../../../../data/models/product/product-availability.enum';
import {
  PublicProductCalculationResponse,
  PublicProductDetailResponse,
} from '../../../../../data/models/public-content/public-product-detail.model';
import { Badge, BadgeVariant } from '../../../../../shared/components/badge/badge';
import { ProductCalculator } from '../product-calculator/product-calculator';

interface AvailabilityPresentation {
  label: string;
  variant: BadgeVariant;
}

@Component({
  selector: 'app-product-info',
  imports: [Badge, DecimalPipe, ProductCalculator],
  templateUrl: './product-info.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductInfo {
  readonly product = input.required<PublicProductDetailResponse>();
  readonly quantityChange = output<number | null>();

  protected readonly calculationConfig = computed<PublicProductCalculationResponse>(() => {
    const config = this.product().configuracionCalculo;
    if (config && config.habilitada !== false) {
      return config;
    }

    return {
      habilitada: true,
      etiquetaEntrada: 'Largo o área',
      unidadEntrada: 'm',
      coberturaPorUnidad: 1,
      unidadVenta: 'unidades',
      textoAyuda: 'Ingresa las medidas para calcular la cantidad de productos que necesitas.',
    };
  });

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

