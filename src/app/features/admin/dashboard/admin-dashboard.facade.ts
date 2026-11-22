import { Injectable, computed, inject, signal } from '@angular/core';
import { forkJoin } from 'rxjs';

import { OrderApiService } from '../../../data/services/order-api.service';
import { ProductApiService } from '../../../data/services/product-api.service';
import { ProjectApiService } from '../../../data/services/project-api.service';
import { QuoteApiService } from '../../../data/services/quote-api.service';
import { ServiceApiService } from '../../../data/services/service-api.service';
import { OrderResponse } from '../../../data/models/order/order-response.model';
import { OrderStatus } from '../../../data/models/order/order-status.enum';
import { ProductPublicationStatus } from '../../../data/models/product/product-publication-status.enum';
import { QuoteStatus } from '../../../data/models/quote/quote-status.enum';
import { QuoteResponse } from '../../../data/models/quote/quote-response.model';
import { stockLevel } from '../products/product-stock.util';

/** Un pendiente que requiere atención: cuántos hay, el detalle y la pantalla donde se resuelve. */
export interface AttentionItem {
  readonly id: string;
  readonly label: string;
  readonly count: number;
  readonly detail: string | null;
  readonly route: string;
  /** `urgent` = algo que un cliente está esperando; `warning` = algo que conviene revisar. */
  readonly tone: 'urgent' | 'warning';
}

const CLOSED_ORDER_STATES: readonly OrderStatus[] = [OrderStatus.ENTREGADO, OrderStatus.CANCELADO];

const byNewest = <T extends { fechaCreacion: string | null }>(a: T, b: T): number =>
  (b.fechaCreacion ? new Date(b.fechaCreacion).getTime() : 0) -
  (a.fechaCreacion ? new Date(a.fechaCreacion).getTime() : 0);

const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`;

@Injectable()
export class AdminDashboardFacade {
  private readonly productApi = inject(ProductApiService);
  private readonly projectApi = inject(ProjectApiService);
  private readonly quoteApi = inject(QuoteApiService);
  private readonly serviceApi = inject(ServiceApiService);
  private readonly orderApi = inject(OrderApiService);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  private readonly _publishedProducts = signal(0);
  private readonly _activeProjects = signal(0);
  private readonly _activeServices = signal(0);
  private readonly _quotes = signal<readonly QuoteResponse[]>([]);
  private readonly _orders = signal<readonly OrderResponse[]>([]);
  private readonly _soldOut = signal(0);
  private readonly _lowStock = signal(0);
  private readonly _projectsWithoutPhoto = signal(0);

  readonly publishedProducts = this._publishedProducts.asReadonly();
  readonly activeProjects = this._activeProjects.asReadonly();
  readonly activeServices = this._activeServices.asReadonly();

  /** Cotizaciones nuevas (todavía sin atender). */
  readonly pendingQuotes = computed(() => this._quotes().filter((q) => q.estado === QuoteStatus.NUEVA).length);
  readonly recentQuotes = computed(() => [...this._quotes()].sort(byNewest).slice(0, 5));
  readonly recentOrders = computed(() => [...this._orders()].sort(byNewest).slice(0, 5));

  /** Lo que hay que atender hoy; solo aparecen los que tienen algo pendiente. */
  readonly attention = computed<readonly AttentionItem[]>(() => {
    const quotes = this._quotes();
    const newQuotes = quotes.filter((q) => q.estado === QuoteStatus.NUEVA).length;
    const inReview = quotes.filter((q) => q.estado === QuoteStatus.EN_REVISION).length;

    const open = this._orders().filter((o) => !CLOSED_ORDER_STATES.includes(o.estado));
    const count = (status: OrderStatus) => open.filter((o) => o.estado === status).length;
    const orderParts = [
      count(OrderStatus.PENDIENTE_PAGO) > 0 ? `${plural(count(OrderStatus.PENDIENTE_PAGO), 'pendiente de pago', 'pendientes de pago')}` : null,
      count(OrderStatus.PAGADO_MANUAL) > 0 ? `${count(OrderStatus.PAGADO_MANUAL)} por preparar` : null,
      count(OrderStatus.EN_PREPARACION) > 0 ? `${count(OrderStatus.EN_PREPARACION)} en preparación` : null,
      count(OrderStatus.ENVIADO) > 0 ? `${count(OrderStatus.ENVIADO)} en camino` : null,
    ].filter((part): part is string => part !== null);

    const items: AttentionItem[] = [
      { id: 'quotes-new', label: 'Cotizaciones nuevas', count: newQuotes, detail: 'Nadie las ha atendido todavía', route: '/admin/cotizaciones', tone: 'urgent' },
      { id: 'quotes-review', label: 'Cotizaciones en revisión', count: inReview, detail: 'Abiertas, sin cerrar', route: '/admin/cotizaciones', tone: 'warning' },
      { id: 'orders-open', label: 'Pedidos por gestionar', count: open.length, detail: orderParts.join(' · ') || null, route: '/admin/pedidos', tone: 'urgent' },
      { id: 'stock-out', label: 'Productos agotados', count: this._soldOut(), detail: 'Publicados y sin stock', route: '/admin/productos', tone: 'warning' },
      { id: 'stock-low', label: 'Productos con poco stock', count: this._lowStock(), detail: 'En o por debajo de su mínimo', route: '/admin/productos', tone: 'warning' },
      { id: 'projects-photo', label: 'Proyectos sin foto', count: this._projectsWithoutPhoto(), detail: 'Activos, sin portada en la web', route: '/admin/proyectos', tone: 'warning' },
    ];
    return items.filter((item) => item.count > 0);
  });

  /** Frase corta de lo publicado hoy en la web. */
  readonly publishedSummary = computed(
    () =>
      `${plural(this._publishedProducts(), 'producto publicado', 'productos publicados')} · ` +
      `${plural(this._activeProjects(), 'proyecto activo', 'proyectos activos')} · ` +
      `${plural(this._activeServices(), 'servicio activo', 'servicios activos')}`,
  );

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      products: this.productApi.getAll(),
      projects: this.projectApi.getAll(),
      quotes: this.quoteApi.getAll(),
      services: this.serviceApi.getAll(),
      orders: this.orderApi.getAll(),
    }).subscribe({
      next: ({ products, projects, quotes, services, orders }) => {
        const published = products.filter((p) => p.estado === ProductPublicationStatus.PUBLICADO);
        this._publishedProducts.set(published.length);
        this._soldOut.set(published.filter((p) => stockLevel(p) === 'agotado').length);
        this._lowStock.set(published.filter((p) => stockLevel(p) === 'bajo').length);

        const activeProjects = projects.filter((p) => p.activo === true);
        this._activeProjects.set(activeProjects.length);
        this._projectsWithoutPhoto.set(activeProjects.filter((p) => !p.imagenUrl?.trim()).length);

        this._activeServices.set(services.filter((s) => s.activo === true).length);
        this._quotes.set(quotes);
        this._orders.set(orders);
        this.loading.set(false);
      },
      error: () => {
        this.error.set(
          'No se pudo cargar la información del panel. Comprueba la conexión con el servidor.',
        );
        this.loading.set(false);
      },
    });
  }
}
