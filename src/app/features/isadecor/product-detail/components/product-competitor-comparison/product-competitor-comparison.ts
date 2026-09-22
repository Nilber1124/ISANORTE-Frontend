import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  ComparableCharacteristic,
  CompetitorProductResult,
  ProductCompetitorComparisonResponse,
} from '../../../../../data/models/product/product-competitor-comparison-response.model';
import { Alert } from '../../../../../shared/components/alert/alert';
import { Button } from '../../../../../shared/components/button/button';
import { Card } from '../../../../../shared/components/card/card';
import { Loading } from '../../../../../shared/components/loading/loading';

@Component({
  selector: 'app-product-competitor-comparison',
  imports: [Alert, Button, Card, Loading],
  templateUrl: './product-competitor-comparison.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductCompetitorComparison {
  readonly loading = input(false);
  readonly result = input<ProductCompetitorComparisonResponse | null>(null);
  readonly error = input<string | null>(null);
  readonly compare = output<void>();

  readonly stores = computed(() => {
    const results = this.result()?.competidores ?? [];
    return ['PISOPAK', 'DECORPLAS'].map(
      (company) => results.find((item) => item.empresa === company) ?? null,
    );
  });

  readonly characteristicNames = computed(() => {
    const names = new Map<string, string>();
    const add = (items: readonly ComparableCharacteristic[]) =>
      items.forEach((item) => names.set(this.key(item.nombre), item.nombre));
    const result = this.result();
    if (result) {
      add(result.productoIsadecor.caracteristicas);
      result.competidores.filter((item) => item.encontrado).forEach((item) => add(item.caracteristicas));
    }
    return [...names.values()];
  });

  characteristic(items: readonly ComparableCharacteristic[], name: string): string {
    return items.find((item) => this.key(item.nombre) === this.key(name))?.valor ?? 'No publicado';
  }

  storeCharacteristic(store: CompetitorProductResult | null, name: string): string {
    return store?.encontrado ? this.characteristic(store.caracteristicas, name) : 'No disponible';
  }

  price(value: number | null, currency: string | null, unit: string | null): string {
    if (value === null) return 'Precio no publicado';
    const symbol = currency === 'PEN' ? 'S/' : (currency ?? '');
    return `${symbol} ${value.toFixed(2)}${unit ? ` / ${unit}` : ''}`.trim();
  }

  private key(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es').trim();
  }
}
