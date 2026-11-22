import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { OrderStatus } from '../../../data/models/order/order-status.enum';
import { AdminDashboard } from './admin-dashboard';
import { AdminDashboardFacade, AttentionItem } from './admin-dashboard.facade';

class FacadeStub {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly attention = signal<readonly AttentionItem[]>([]);
  readonly recentOrders = signal<unknown[]>([]);
  readonly publishedSummary = signal('2 productos publicados');
  load(): void {}
}

describe('AdminDashboard', () => {
  let facade: FacadeStub;

  function render() {
    TestBed.configureTestingModule({ providers: [provideRouter([])] }).overrideComponent(AdminDashboard, {
      set: { providers: [{ provide: AdminDashboardFacade, useValue: (facade = new FacadeStub()) }] },
    });
    const fixture = TestBed.createComponent(AdminDashboard);
    fixture.detectChanges();
    return { fixture, el: fixture.nativeElement as HTMLElement };
  }

  it('says everything is up to date when nothing is pending', () => {
    const { el } = render();
    expect(el.querySelector('[data-all-clear]')?.textContent).toContain('Todo al día');
    expect(el.querySelector('[data-attention]')).toBeNull();
  });

  it('shows one card per pending item, linking to the screen that solves it', () => {
    const { fixture, el } = render();
    facade.attention.set([
      { id: 'orders-open', label: 'Pedidos por gestionar', count: 3, detail: 'Nadie los ha atendido todavía', route: '/admin/pedidos', tone: 'urgent' },
      { id: 'stock-out', label: 'Productos agotados', count: 1, detail: null, route: '/admin/productos', tone: 'warning' },
    ]);
    fixture.detectChanges();
    const cards = Array.from(el.querySelectorAll('[data-attention-item]'));
    expect(cards.map((c) => c.getAttribute('href'))).toEqual(['/admin/pedidos', '/admin/productos']);
    expect(cards[0].textContent).toContain('3');
    expect(cards[0].textContent).toContain('Nadie los ha atendido todavía');
    expect(el.querySelector('[data-all-clear]')).toBeNull();
  });

  it('offers useful quick links and the published summary', () => {
    const { el } = render();
    const links = Array.from(el.querySelectorAll('section[aria-labelledby="quick-access-title"] a')).map((a) => a.getAttribute('href'));
    expect(links).toEqual(['/admin/landing', '/admin/productos', '/admin/ventas', '/admin/pedidos']);
    expect(el.querySelector('[data-published-summary]')?.textContent).toContain('2 productos publicados');
  });

  it('labels the statuses of orders', () => {
    const { fixture } = render();
    const component = fixture.componentInstance;
    expect(component.orderStatusLabel(OrderStatus.PAGADO_MANUAL)).toBe('Pago confirmado');
    expect(component.orderStatusVariant(OrderStatus.CANCELADO)).toBe('error');
  });
});
