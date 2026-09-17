import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';

import { ProductAvailability } from '../../../../../data/models/product/product-availability.enum';
import { ProductResponse } from '../../../../../data/models/product/product-response.model';
import { Badge, BadgeVariant } from '../../../../../shared/components/badge/badge';
import { Card } from '../../../../../shared/components/card/card';

interface AvailabilityPresentation {
  label: string;
  variant: BadgeVariant;
}

@Component({
  selector: 'app-product-card',
  imports: [Badge, Card, DecimalPipe],
  templateUrl: './product-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCard {
  readonly product = input.required<ProductResponse>();

  private readonly imageFailed = signal(false);

  protected readonly primaryImage = computed(() => {
    const images = this.product().imagenes ?? [];
    return images.find((image) => image.esPrincipal === true) ?? images[0] ?? null;
  });

  protected readonly showImage = computed(
    () => this.primaryImage() !== null && !this.imageFailed(),
  );

  protected readonly visibleCategories = computed(() =>
    (this.product().categorias ?? []).slice(0, 2),
  );

  protected readonly remainingCategoryCount = computed(() =>
    Math.max((this.product().categorias?.length ?? 0) - this.visibleCategories().length, 0),
  );

  protected readonly availability = computed<AvailabilityPresentation>(() => {
    const presentations: Record<ProductAvailability, AvailabilityPresentation> = {
      [ProductAvailability.DISPONIBLE]: { label: 'Disponible', variant: 'success' },
      [ProductAvailability.AGOTADO]: { label: 'Agotado', variant: 'error' },
      [ProductAvailability.BAJO_PEDIDO]: { label: 'Bajo pedido', variant: 'warning' },
      [ProductAvailability.CONSULTAR]: { label: 'Consultar', variant: 'info' },
    };

    return presentations[this.product().disponibilidad];
  });

  protected markImageAsFailed(): void {
    this.imageFailed.set(true);
  }
}
