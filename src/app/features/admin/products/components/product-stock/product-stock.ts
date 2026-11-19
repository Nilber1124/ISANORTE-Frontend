import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';

import { ToastService } from '../../../../../core/services/toast.service';
import { ProductResponse } from '../../../../../data/models/product/product-response.model';
import {
  StockAdjustmentRequest,
  StockMovementResponse,
} from '../../../../../data/models/stock/stock.model';
import { StockApiService } from '../../../../../data/services/stock-api.service';

interface StockLine {
  /** `null` = el propio producto (sin acabados). */
  readonly variantId: string | null;
  readonly label: string;
  readonly stock: number | null;
}

type AdjustType = StockAdjustmentRequest['tipo'];

const TYPE_LABEL: Record<string, string> = {
  ENTRADA: 'Entrada',
  SALIDA: 'Salida',
  AJUSTE: 'Ajuste',
  PEDIDO: 'Pedido',
  CANCELACION: 'Cancelación',
};

/** Inventario de un producto: stock por acabado, ajustes con motivo e historial de movimientos. */
@Component({
  selector: 'app-product-stock',
  imports: [DatePipe],
  templateUrl: './product-stock.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProductStock {
  private readonly api = inject(StockApiService);
  private readonly toast = inject(ToastService);

  readonly product = input.required<ProductResponse>();

  readonly lines = signal<readonly StockLine[]>([]);
  readonly movements = signal<readonly StockMovementResponse[]>([]);
  readonly target = signal<string | null | undefined>(undefined);
  readonly type = signal<AdjustType>('ENTRADA');
  readonly quantity = signal('');
  readonly reason = signal('');
  readonly saving = signal(false);
  readonly total = computed(() => {
    const values = this.lines().map((line) => line.stock);
    return values.some((value) => value === null)
      ? null
      : values.reduce((a, b) => (a ?? 0) + (b ?? 0), 0);
  });

  constructor() {
    effect(() => {
      const product = this.product();
      const variants = product.variantes ?? [];
      this.lines.set(
        variants.length > 0
          ? variants.map((variant) => ({
              variantId: variant.id,
              label: variant.nombre,
              stock: variant.stockActual ?? null,
            }))
          : [{ variantId: null, label: product.nombre, stock: product.stockActual ?? null }],
      );
      this.loadHistory();
    });
  }

  typeLabel(type: string): string {
    return TYPE_LABEL[type] ?? type;
  }

  variantLabel(id: string | null): string {
    return this.lines().find((line) => line.variantId === id)?.label ?? 'Producto';
  }

  open(line: StockLine): void {
    this.target.set(line.variantId);
    this.type.set(line.stock === null ? 'AJUSTE' : 'ENTRADA');
    this.quantity.set('');
    this.reason.set('');
  }

  close(): void {
    this.target.set(undefined);
  }

  valid(): boolean {
    const value = Number(this.quantity());
    return this.quantity().trim() !== '' && Number.isInteger(value) && value >= 0;
  }

  save(): void {
    const variantId = this.target();
    if (variantId === undefined || this.saving() || !this.valid()) return;
    this.saving.set(true);
    this.api
      .adjust(this.product().id, variantId, {
        tipo: this.type(),
        cantidad: Number(this.quantity()),
        motivo: this.reason().trim() || null,
      })
      .subscribe({
        next: (response) => {
          this.lines.update((lines) =>
            lines.map((line) =>
              line.variantId === variantId ? { ...line, stock: response.stockActual } : line,
            ),
          );
          this.saving.set(false);
          this.close();
          this.toast.show('Stock actualizado.', 'success');
          this.loadHistory();
        },
        error: () => {
          this.saving.set(false);
          this.toast.show('No se pudo ajustar el stock. Revisa la cantidad.', 'error');
        },
      });
  }

  private loadHistory(): void {
    this.api.history(this.product().id).subscribe({
      next: (items) => this.movements.set(items),
      error: () => this.movements.set([]),
    });
  }
}
