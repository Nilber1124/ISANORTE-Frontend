import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { OrderStatus } from '../../../data/models/order/order-status.enum';
import { ProductPublicationStatus } from '../../../data/models/product/product-publication-status.enum';
import { QuoteStatus } from '../../../data/models/quote/quote-status.enum';
import { OrderApiService } from '../../../data/services/order-api.service';
import { ProductApiService } from '../../../data/services/product-api.service';
import { ProjectApiService } from '../../../data/services/project-api.service';
import { QuoteApiService } from '../../../data/services/quote-api.service';
import { ServiceApiService } from '../../../data/services/service-api.service';
import { AdminDashboardFacade } from './admin-dashboard.facade';

const product = (patch: Record<string, unknown>) => ({ estado: ProductPublicationStatus.PUBLICADO, disponibilidad: 'DISPONIBLE', variantes: [], ...patch });
const quote = (id: string, estado: QuoteStatus, fecha: string) => ({ id, estado, fechaCreacion: fecha, nombreCliente: id, codigo: id });
const order = (id: string, estado: OrderStatus, fecha: string) => ({ id, estado, fechaCreacion: fecha, codigo: id, totalPedido: 10 });

describe('AdminDashboardFacade', () => {
  function setup(data: { products?: unknown[]; projects?: unknown[]; quotes?: unknown[]; services?: unknown[]; orders?: unknown[] }) {
    TestBed.configureTestingModule({
      providers: [
        AdminDashboardFacade,
        { provide: ProductApiService, useValue: { getAll: () => of(data.products ?? []) } },
        { provide: ProjectApiService, useValue: { getAll: () => of(data.projects ?? []) } },
        { provide: QuoteApiService, useValue: { getAll: () => of(data.quotes ?? []) } },
        { provide: ServiceApiService, useValue: { getAll: () => of(data.services ?? []) } },
        { provide: OrderApiService, useValue: { getAll: () => of(data.orders ?? []) } },
      ],
    });
    const facade = TestBed.inject(AdminDashboardFacade);
    facade.load();
    return facade;
  }
  const ids = (facade: AdminDashboardFacade) => facade.attention().map((item) => `${item.id}:${item.count}`);

  it('shows nothing to attend when everything is in order', () => {
    const facade = setup({
      products: [product({ stockActual: 50, stockMinimo: 5 })],
      projects: [{ activo: true, imagenUrl: 'a.jpg' }],
      quotes: [quote('q1', QuoteStatus.CERRADA, '2026-11-01')],
      orders: [order('p1', OrderStatus.ENTREGADO, '2026-11-01'), order('p2', OrderStatus.CANCELADO, '2026-11-02')],
    });
    expect(facade.attention()).toEqual([]);
    expect(facade.loading()).toBe(false);
  });

  it('counts the quotes, orders, stock and projects that need attention', () => {
    const facade = setup({
      products: [
        product({ stockActual: 0 }),
        product({ stockActual: 2, stockMinimo: 5 }),
        product({ stockActual: 40, stockMinimo: 5 }),
        product({ estado: 'BORRADOR', stockActual: 0 }), // sin publicar: no cuenta
      ],
      projects: [{ activo: true, imagenUrl: null }, { activo: true, imagenUrl: '  ' }, { activo: false, imagenUrl: null }, { activo: true, imagenUrl: 'a.jpg' }],
      quotes: [quote('a', QuoteStatus.NUEVA, '2026-11-03'), quote('b', QuoteStatus.NUEVA, '2026-11-02'), quote('c', QuoteStatus.EN_REVISION, '2026-11-01'), quote('d', QuoteStatus.COTIZADA, '2026-10-01')],
      orders: [
        order('p1', OrderStatus.PENDIENTE_PAGO, '2026-11-03'),
        order('p2', OrderStatus.PAGADO_MANUAL, '2026-11-02'),
        order('p3', OrderStatus.EN_PREPARACION, '2026-11-02'),
        order('p4', OrderStatus.ENVIADO, '2026-11-01'),
        order('p5', OrderStatus.ENTREGADO, '2026-10-01'),
      ],
    });
    expect(ids(facade)).toEqual([
      'quotes-new:2',
      'quotes-review:1',
      'orders-open:4',
      'stock-out:1',
      'stock-low:1',
      'projects-photo:2',
    ]);
    const orders = facade.attention().find((i) => i.id === 'orders-open');
    expect(orders?.detail).toBe('1 pendiente de pago · 1 por preparar · 1 en preparación · 1 en camino');
    expect(orders?.route).toBe('/admin/pedidos');
    expect(facade.pendingQuotes()).toBe(2);
  });

  it('lists the five newest quotes and orders', () => {
    const quotes = Array.from({ length: 7 }, (_, i) => quote(`q${i}`, QuoteStatus.NUEVA, `2026-11-0${i + 1}`));
    const orders = Array.from({ length: 7 }, (_, i) => order(`p${i}`, OrderStatus.ENTREGADO, `2026-11-0${i + 1}`));
    const facade = setup({ quotes, orders });
    expect(facade.recentQuotes().map((q) => q.id)).toEqual(['q6', 'q5', 'q4', 'q3', 'q2']);
    expect(facade.recentOrders().map((o) => o.id)).toEqual(['p6', 'p5', 'p4', 'p3', 'p2']);
  });

  it('summarises what is published on the web', () => {
    const facade = setup({
      products: [product({}), product({})],
      projects: [{ activo: true, imagenUrl: 'a' }],
      services: [{ activo: true }, { activo: true }, { activo: false }],
    });
    expect(facade.publishedSummary()).toBe('2 productos publicados · 1 proyecto activo · 2 servicios activos');
  });

  it('reports a load failure', () => {
    TestBed.configureTestingModule({
      providers: [
        AdminDashboardFacade,
        { provide: ProductApiService, useValue: { getAll: () => throwError(() => new Error('x')) } },
        { provide: ProjectApiService, useValue: { getAll: () => of([]) } },
        { provide: QuoteApiService, useValue: { getAll: () => of([]) } },
        { provide: ServiceApiService, useValue: { getAll: () => of([]) } },
        { provide: OrderApiService, useValue: { getAll: () => of([]) } },
      ],
    });
    const facade = TestBed.inject(AdminDashboardFacade);
    facade.load();
    expect(facade.error()).toContain('No se pudo cargar');
    expect(facade.loading()).toBe(false);
  });
});
