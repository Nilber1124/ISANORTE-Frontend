import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { PublicProductCalculationResponse } from '../../../../../data/models/public-content/public-product-detail.model';

@Component({
  selector: 'app-product-calculator',
  imports: [DecimalPipe],
  templateUrl: './product-calculator.html',
  styleUrl: './product-calculator.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCalculator {
  readonly config = input.required<PublicProductCalculationResponse>();
  readonly quantityChange = output<number | null>();
  readonly measurement = signal<number | null>(null);

  protected readonly inputLabel = computed(
    () => this.config().etiquetaEntrada?.trim() || 'Medida a cubrir',
  );
  protected readonly inputUnit = computed(() => this.config().unidadEntrada?.trim() || null);
  protected readonly saleUnit = computed(() => this.config().unidadVenta?.trim() || null);
  protected readonly helperText = computed(() => this.config().textoAyuda?.trim() || null);

  protected readonly calculationAvailable = computed(() => {
    const coverage = this.config().coberturaPorUnidad;
    return (
      this.config().habilitada === true &&
      coverage !== null &&
      Number.isFinite(coverage) &&
      coverage > 0
    );
  });

  protected readonly measurementError = computed(() => {
    const measurement = this.measurement();

    if (measurement === null) {
      return null;
    }

    if (!Number.isFinite(measurement)) {
      return 'Ingresa un valor numérico válido.';
    }

    if (measurement <= 0) {
      return 'Ingresa un valor mayor que 0.';
    }

    return null;
  });

  readonly quantity = computed<number | null>(() => {
    const measurement = this.measurement();
    const coverage = this.config().coberturaPorUnidad;

    if (
      !this.calculationAvailable() ||
      measurement === null ||
      !Number.isFinite(measurement) ||
      measurement <= 0 ||
      coverage === null ||
      coverage <= 0
    ) {
      return null;
    }

    const estimatedQuantity = measurement / coverage;

    if (!Number.isFinite(estimatedQuantity)) {
      return null;
    }

    return Math.ceil(estimatedQuantity);
  });

  protected readonly describedBy = computed(() => {
    const ids = [
      this.helperText() ? 'product-calculator-help' : null,
      this.measurementError() ? 'product-calculator-error' : null,
    ];

    return ids.filter(Boolean).join(' ') || null;
  });

  protected updateMeasurement(event: Event): void {
    const input = event.target as HTMLInputElement;

    if (input.value.trim() === '') {
      this.measurement.set(null);
      this.quantityChange.emit(null);
      return;
    }

    this.measurement.set(input.valueAsNumber);
    this.quantityChange.emit(this.quantity());
  }

  protected resultUnit(quantity: number): string {
    const unit = this.saleUnit()?.toLocaleLowerCase('es') ?? 'unidad';
    const forms: Record<string, readonly [string, string]> = {
      unidad: ['unidad', 'unidades'],
      caja: ['caja', 'cajas'],
      panel: ['panel', 'paneles'],
      paneles: ['panel', 'paneles'],
      cajas: ['caja', 'cajas'],
    };
    return forms[unit]?.[quantity === 1 ? 0 : 1] ?? unit;
  }
}
