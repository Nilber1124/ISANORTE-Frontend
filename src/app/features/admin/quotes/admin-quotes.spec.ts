import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuoteChannel } from '../../../data/models/quote/quote-channel.enum';
import { QuoteResponse } from '../../../data/models/quote/quote-response.model';
import { QuoteStatus } from '../../../data/models/quote/quote-status.enum';
import { AdminQuotes } from './admin-quotes';
import { AdminQuotesFacade, QuoteStatusFilter } from './admin-quotes.facade';

const quote: QuoteResponse = {
  id: 'quote-1',
  codigo: 'COT-20260917-AB12CD34',
  nombreCliente: 'Juan Pérez',
  emailCliente: 'juan@example.com',
  telefonoCliente: '999111222',
  empresaCliente: 'Empresa Demo',
  ciudad: 'Lima',
  mensaje: 'Necesito una propuesta.',
  canal: QuoteChannel.FORMULARIO,
  estado: QuoteStatus.NUEVA,
  totalEstimado: null,
  detalles: [
    {
      id: 'detail-1',
      productoId: 'product-1',
      varianteId: null,
      nombreProducto: 'Wall Panel Roble',
      sku: 'WP-001',
      cantidad: 2,
      precioUnitario: null,
      subtotal: null,
      notas: 'Acabado natural',
    },
  ],
  seguimientos: [],
  fechaCreacion: '2026-09-17T10:00:00-05:00',
  fechaActualizacion: null,
};

class FacadeStub {
  readonly quotes = signal<readonly QuoteResponse[]>([quote]);
  readonly filteredQuotes = signal<readonly QuoteResponse[]>([quote]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly selectedStatus = signal<QuoteStatusFilter>('ALL');
  readonly searchTerm = signal('');
  readonly selectedQuote = signal<QuoteResponse | null>(null);
  readonly detailOpen = signal(false);
  readonly loadingDetail = signal(false);
  readonly detailError = signal<string | null>(null);
  readonly statusError = signal<string | null>(null);
  readonly changingStatusId = signal<string | null>(null);
  opened: QuoteResponse[] = [];
  changedStatuses: QuoteStatus[] = [];

  load(): void {}
  clearFeedback(): void {}
  setStatusFilter(status: QuoteStatusFilter): void {
    this.selectedStatus.set(status);
  }
  setSearchTerm(term: string): void {
    this.searchTerm.set(term);
  }
  openDetail(value: QuoteResponse): void {
    this.opened.push(value);
    this.selectedQuote.set(value);
    this.detailOpen.set(true);
  }
  closeDetail(): void {
    this.detailOpen.set(false);
  }
  changeStatus(status: QuoteStatus): void {
    if (this.changingStatusId() !== null) return;
    this.changedStatuses.push(status);
  }
}

describe('AdminQuotes', () => {
  let fixture: ComponentFixture<AdminQuotes>;
  let facade: FacadeStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AdminQuotes] })
      .overrideComponent(AdminQuotes, {
        set: { providers: [{ provide: AdminQuotesFacade, useClass: FacadeStub }] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(AdminQuotes);
    facade = fixture.debugElement.injector.get(AdminQuotesFacade) as unknown as FacadeStub;
    fixture.detectChanges();
  });

  it('renders the semantic table and status badge', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('table caption')?.textContent).toContain('Listado administrativo');
    expect(element.textContent).toContain(quote.codigo);
    expect(element.textContent).toContain('Nueva');
  });

  it('shows EmptyState when there are no quotes', () => {
    facade.quotes.set([]);
    facade.filteredQuotes.set([]);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('No hay solicitudes de cotización');
    expect(element.querySelector('table')).toBeNull();
  });

  it('opens the detail with requester and product data', () => {
    const viewButton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Ver'));
    viewButton?.click();
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(facade.opened).toEqual([quote]);
    expect(text).toContain('Juan Pérez');
    expect(text).toContain('juan@example.com');
    expect(text).toContain('Wall Panel Roble');
    expect(text).toContain('WP-001');
  });

  it('shows Por confirmar for null total and null product prices', () => {
    facade.selectedQuote.set(quote);
    facade.detailOpen.set(true);
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text.match(/Por confirmar/g)?.length).toBeGreaterThanOrEqual(3);
    expect(text).not.toContain('Total: 0');
  });

  it('renders the accessible status selector and emits an update', () => {
    facade.selectedQuote.set(quote);
    facade.detailOpen.set(true);
    fixture.detectChanges();
    const select = (fixture.nativeElement as HTMLElement).querySelector(
      '#quote-next-status',
    ) as HTMLSelectElement;
    select.value = QuoteStatus.EN_REVISION;
    select.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    const updateButton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Actualizar estado'));
    updateButton?.click();
    expect(facade.changedStatuses).toEqual([QuoteStatus.EN_REVISION]);
  });

  it('disables status updating while a change is pending', () => {
    facade.selectedQuote.set(quote);
    facade.detailOpen.set(true);
    facade.changingStatusId.set(quote.id);
    fixture.detectChanges();
    const select = (fixture.nativeElement as HTMLElement).querySelector(
      '#quote-next-status',
    ) as HTMLSelectElement;
    const updateButton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Actualizar estado')) as HTMLButtonElement;
    expect(select.disabled).toBe(true);
    expect(updateButton.disabled).toBe(true);
  });
});
