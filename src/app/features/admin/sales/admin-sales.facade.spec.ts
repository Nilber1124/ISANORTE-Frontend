import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';

import { SaleResponse } from '../../../data/models/sale/sale.model';
import { ProductApiService } from '../../../data/services/product-api.service';
import { SaleApiService } from '../../../data/services/sale-api.service';
import { AdminSalesFacade } from './admin-sales.facade';

const sale = (patch: Partial<SaleResponse>): SaleResponse =>
  ({ id: 'v', codigo: 'VTA-1', canal: 'WHATSAPP', fechaVenta: '2026-11-22', metodoPago: 'YAPE', pagado: true, total: 100, anulada: false, stockDescontado: true, detalles: [], ...patch }) as SaleResponse;

describe('AdminSalesFacade', () => {
  const saleApi = { getAll: vi.fn(), create: vi.fn(), update: vi.fn(), setAnulada: vi.fn() };
  const productApi = { getAll: vi.fn() };

  function create(sales: SaleResponse[] = []) {
    saleApi.getAll.mockReturnValue(of(sales));
    productApi.getAll.mockReturnValue(of([{ id: 'p1', estado: 'PUBLICADO' }, { id: 'p2', estado: 'BORRADOR' }]));
    TestBed.configureTestingModule({
      providers: [AdminSalesFacade, { provide: SaleApiService, useValue: saleApi }, { provide: ProductApiService, useValue: productApi }],
    });
    const facade = TestBed.inject(AdminSalesFacade);
    facade.load();
    return facade;
  }

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 22, 12, 0, 0)); // 22 nov 2026
    Object.values(saleApi).forEach((fn) => fn.mockReset());
    productApi.getAll.mockReset();
  });
  afterEach(() => vi.useRealTimers());

  it('loads the sales and only the published products', () => {
    const facade = create([sale({})]);
    expect(facade.sales()).toHaveLength(1);
    expect(facade.products().map((p) => p.id)).toEqual(['p1']);
    expect(facade.loading()).toBe(false);
  });

  it('adds up today, the month and what is still to collect, ignoring cancelled sales', () => {
    const facade = create([
      sale({ id: '1', fechaVenta: '2026-11-22', total: 100 }),
      sale({ id: '2', fechaVenta: '2026-11-22', total: 50, pagado: false }),
      sale({ id: '3', fechaVenta: '2026-11-05', total: 200 }),
      sale({ id: '4', fechaVenta: '2026-10-30', total: 999 }),
      sale({ id: '5', fechaVenta: '2026-11-22', total: 70, anulada: true }),
    ]);
    expect(facade.summary()).toEqual({ todayTotal: 150, todayCount: 2, monthTotal: 350, monthCount: 3, toCollect: 50 });
  });

  it('saves a new sale, closes the form and reloads', () => {
    const facade = create();
    saleApi.create.mockReturnValue(of(sale({})));
    facade.openNew();
    expect(facade.editing()).toBe('new');
    facade.save({} as never);
    expect(saleApi.create).toHaveBeenCalledOnce();
    expect(facade.editing()).toBeNull();
    expect(saleApi.getAll).toHaveBeenCalledTimes(2);
  });

  it('edits an existing sale through PUT', () => {
    const existing = sale({ id: 'v9' });
    const facade = create([existing]);
    saleApi.update.mockReturnValue(of(existing));
    facade.openEdit(existing);
    facade.save({} as never);
    expect(saleApi.update).toHaveBeenCalledWith('v9', {});
  });

  it('keeps the form open and shows the server reason when saving fails', () => {
    const facade = create();
    saleApi.create.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 400, error: { message: 'Stock insuficiente: hay 2 y se pidió retirar 5' } })));
    facade.openNew();
    facade.save({} as never);
    expect(facade.editing()).toBe('new');
    expect(facade.formError()).toContain('Stock insuficiente');
    expect(facade.saving()).toBe(false);
  });

  it('cancels and reactivates through the API and reloads', () => {
    const existing = sale({ id: 'v1' });
    const facade = create([existing]);
    saleApi.setAnulada.mockReturnValue(of(existing));
    facade.setAnulada(existing, true);
    expect(saleApi.setAnulada).toHaveBeenCalledWith('v1', true);
    facade.setAnulada(existing, false);
    expect(saleApi.setAnulada).toHaveBeenLastCalledWith('v1', false);
    expect(saleApi.getAll).toHaveBeenCalledTimes(3);
  });
});
