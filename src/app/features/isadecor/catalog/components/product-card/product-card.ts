import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ProductAvailability } from '../../../../../data/models/product/product-availability.enum';
import { PublicProductCardResponse } from '../../../../../data/models/public-content/public-product-catalog.model';

type AvailabilityTone = 'green' | 'red' | 'yellow' | 'blue';

interface AvailabilityPresentation {
  label: string;
  tone: AvailabilityTone;
}

@Component({
  selector: 'app-product-card',
  imports: [DecimalPipe, RouterLink],
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.product-card-host--featured]': "presentation() === 'featured'",
  },
})
export class ProductCard {
  readonly product = input.required<PublicProductCardResponse>();
  readonly presentation = input<'default' | 'featured'>('default');

  private readonly imageFailed = signal(false);

  protected readonly primaryImage = computed(() => this.product().imagen ?? null);

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
      [ProductAvailability.DISPONIBLE]: { label: 'Disponible', tone: 'green' },
      [ProductAvailability.AGOTADO]: { label: 'Agotado', tone: 'red' },
      [ProductAvailability.BAJO_PEDIDO]: { label: 'Bajo pedido', tone: 'yellow' },
      [ProductAvailability.CONSULTAR]: { label: 'Consultar', tone: 'blue' },
    };

    return presentations[this.product().disponibilidad];
  });

  protected toneClasses(tone: AvailabilityTone): string {
    const tones: Record<AvailabilityTone, string> = {
      green: 'bg-[#EDF3EC] text-[#346538]',
      red: 'bg-[#FDEBEC] text-[#9F2F2D]',
      yellow: 'bg-[#FBF3DB] text-[#956400]',
      blue: 'bg-[#E1F3FE] text-[#1F6C9F]',
    };
    return tones[tone];
  }

  protected toneDotClasses(tone: AvailabilityTone): string {
    const tones: Record<AvailabilityTone, string> = {
      green: 'bg-[#346538]',
      red: 'bg-[#9F2F2D]',
      yellow: 'bg-[#956400]',
      blue: 'bg-[#1F6C9F]',
    };
    return tones[tone];
  }

  protected markImageAsFailed(): void {
    this.imageFailed.set(true);
  }
}
