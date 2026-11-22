import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { ProductResponse } from '../../../data/models/product/product-response.model';
import { ProductPublicationStatus } from '../../../data/models/product/product-publication-status.enum';
import { SaleRequest, SaleResponse } from '../../../data/models/sale/sale.model';
import { ProductApiService } from '../../../data/services/product-api.service';
import { SaleApiService } from '../../../data/services/sale-api.service';

/** Ventas registradas a mano: la lista, los productos para armar una venta y el alta, edición y anulación. */
@Injectable()
export class AdminSalesFacade {
  private readonly saleApi = inject(SaleApiService);
  private readonly productApi = inject(ProductApiService);

  readonly sales = signal<readonly SaleResponse[]>([]);
  /** Productos publicados con su stock, para elegirlos al registrar una venta. */
  readonly products = signal<readonly ProductResponse[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  /** Error del último intento de guardar (se muestra dentro del formulario). */
  readonly formError = signal<string | null>(null);

  /** `null` = cerrado; `'new'` = alta; si no, la venta en edición. */
  readonly editing = signal<SaleResponse | 'new' | null>(null);

  /** Lo vendido hoy y en el mes (las anuladas no cuentan). */
  readonly summary = computed(() => {
    const now = new Date();
    const today = this.isoDate(now);
    const month = today.slice(0, 7);
    const valid = this.sales().filter((sale) => !sale.anulada);
    const sum = (list: readonly SaleResponse[]) => list.reduce((total, sale) => total + sale.total, 0);
    const todaySales = valid.filter((sale) => sale.fechaVenta === today);
    const monthSales = valid.filter((sale) => sale.fechaVenta.startsWith(month));
    return {
      todayTotal: sum(todaySales),
      todayCount: todaySales.length,
      monthTotal: sum(monthSales),
      monthCount: monthSales.length,
      toCollect: sum(valid.filter((sale) => !sale.pagado)),
    };
  });

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({ sales: this.saleApi.getAll(), products: this.productApi.getAll() }).subscribe({
      next: ({ sales, products }) => {
        this.sales.set(sales);
        this.products.set(products.filter((p) => p.estado === ProductPublicationStatus.PUBLICADO));
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No se pudieron cargar las ventas.');
        this.loading.set(false);
      },
    });
  }

  openNew(): void {
    this.formError.set(null);
    this.editing.set('new');
  }

  openEdit(sale: SaleResponse): void {
    this.formError.set(null);
    this.editing.set(sale);
  }

  closeForm(): void {
    if (!this.saving()) this.editing.set(null);
  }

  save(request: SaleRequest): void {
    const current = this.editing();
    if (current === null || this.saving()) return;
    this.saving.set(true);
    this.formError.set(null);
    const call = current === 'new' ? this.saleApi.create(request) : this.saleApi.update(current.id, request);
    call.subscribe({
      next: () => {
        this.saving.set(false);
        this.editing.set(null);
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.formError.set(this.message(error, 'No se pudo guardar la venta.'));
      },
    });
  }

  /** Anula o reactiva una venta; devuelve o vuelve a descontar su stock. */
  setAnulada(sale: SaleResponse, anulada: boolean): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    this.saleApi.setAnulada(sale.id, anulada).subscribe({
      next: () => {
        this.saving.set(false);
        this.load();
      },
      error: (error: unknown) => {
        this.saving.set(false);
        this.error.set(this.message(error, anulada ? 'No se pudo anular la venta.' : 'No se pudo reactivar la venta.'));
      },
    });
  }

  private message(error: unknown, fallback: string): string {
    const body = error instanceof HttpErrorResponse ? (error.error as { message?: string } | null) : null;
    return body?.message || fallback;
  }

  private isoDate(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  }
}
