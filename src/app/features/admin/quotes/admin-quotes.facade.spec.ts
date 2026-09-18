import { HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';

import { QuoteChannel } from '../../../data/models/quote/quote-channel.enum';
import { QuoteResponse } from '../../../data/models/quote/quote-response.model';
import { QuoteStatusRequest } from '../../../data/models/quote/quote-status-request.model';
import { QuoteStatus } from '../../../data/models/quote/quote-status.enum';
import { QuoteApiService } from '../../../data/services/quote-api.service';
import { AdminQuotesFacade } from './admin-quotes.facade';

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

class QuoteApiStub {
  getAllResponse$: Observable<QuoteResponse[]> = of([quote]);
  getByIdResponse$: Observable<QuoteResponse> = of(quote);
  statusResponse$: Observable<QuoteResponse> = of({
    ...quote,
    estado: QuoteStatus.EN_REVISION,
    seguimientos: [
      {
        id: 'tracking-1',
        administradorId: null,
        administradorNombre: null,
        estadoAnterior: QuoteStatus.NUEVA,
        estadoNuevo: QuoteStatus.EN_REVISION,
        comentario: null,
        fecha: '2026-09-18T09:00:00-05:00',
      },
    ],
  });
  getAllCalls = 0;
  detailIds: string[] = [];
  statusRequests: Array<{ id: string; request: QuoteStatusRequest }> = [];

  getAll(): Observable<QuoteResponse[]> {
    this.getAllCalls += 1;
    return this.getAllResponse$;
  }

  getById(id: string): Observable<QuoteResponse> {
    this.detailIds.push(id);
    return this.getByIdResponse$;
  }

  changeStatus(id: string, request: QuoteStatusRequest): Observable<QuoteResponse> {
    this.statusRequests.push({ id, request });
    return this.statusResponse$;
  }
}

describe('AdminQuotesFacade', () => {
  let facade: AdminQuotesFacade;
  let quoteApi: QuoteApiStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminQuotesFacade,
        QuoteApiStub,
        { provide: QuoteApiService, useExisting: QuoteApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    facade = TestBed.inject(AdminQuotesFacade);
    quoteApi = TestBed.inject(QuoteApiStub);
  });

  it('loads all quotes', () => {
    facade.load();
    expect(quoteApi.getAllCalls).toBe(1);
    expect(facade.quotes()).toEqual([quote]);
    expect(facade.loading()).toBe(false);
  });

  it('represents an empty quote list', () => {
    quoteApi.getAllResponse$ = of([]);
    facade.load();
    expect(facade.quotes()).toEqual([]);
    expect(facade.filteredQuotes()).toEqual([]);
  });

  it('exposes a safe loading error', () => {
    quoteApi.getAllResponse$ = throwError(() => new HttpErrorResponse({ status: 500 }));
    facade.load();
    expect(facade.error()).toContain('No pudimos cargar las cotizaciones');
    expect(facade.loading()).toBe(false);
  });

  it('loads the selected quote detail by id', () => {
    facade.openDetail(quote);
    expect(quoteApi.detailIds).toEqual([quote.id]);
    expect(facade.selectedQuote()).toEqual(quote);
    expect(facade.detailOpen()).toBe(true);
    expect(facade.loadingDetail()).toBe(false);
  });

  it('changes status with the exact PATCH request and updates the response', () => {
    facade.load();
    facade.openDetail(quote);
    facade.changeStatus(QuoteStatus.EN_REVISION);

    expect(quoteApi.statusRequests).toEqual([
      { id: quote.id, request: { estado: QuoteStatus.EN_REVISION } },
    ]);
    expect(facade.selectedQuote()?.estado).toBe(QuoteStatus.EN_REVISION);
    expect(facade.quotes()[0].estado).toBe(QuoteStatus.EN_REVISION);
    expect(facade.selectedQuote()?.seguimientos).toHaveLength(1);
    expect(facade.success()).toBe('Estado actualizado correctamente.');
  });

  it('maps 400, 404 and 409 status errors', () => {
    facade.openDetail(quote);
    for (const status of [400, 404, 409]) {
      quoteApi.statusResponse$ = throwError(() => new HttpErrorResponse({ status }));
      facade.changeStatus(QuoteStatus.EN_REVISION);
      expect(facade.statusError()).toBeTruthy();
    }
  });

  it('returns changingStatusId to idle after a failed update', () => {
    facade.openDetail(quote);
    quoteApi.statusResponse$ = throwError(() => new HttpErrorResponse({ status: 500 }));
    facade.changeStatus(QuoteStatus.EN_REVISION);
    expect(facade.changingStatusId()).toBeNull();
    expect(facade.statusError()).toContain('No pudimos actualizar');
  });

  it('blocks duplicate status updates while PATCH is pending', () => {
    const pending = new Subject<QuoteResponse>();
    quoteApi.statusResponse$ = pending;
    facade.openDetail(quote);
    facade.changeStatus(QuoteStatus.EN_REVISION);
    facade.changeStatus(QuoteStatus.CONTACTADA);
    expect(quoteApi.statusRequests).toHaveLength(1);
    expect(facade.changingStatusId()).toBe(quote.id);
    pending.next({ ...quote, estado: QuoteStatus.EN_REVISION });
    pending.complete();
    expect(facade.changingStatusId()).toBeNull();
  });

  it('preserves a null backend total without calculating a fallback', () => {
    facade.load();
    expect(facade.quotes()[0].totalEstimado).toBeNull();
  });

  it('filters locally by status and requester data', () => {
    facade.load();
    facade.setStatusFilter(QuoteStatus.NUEVA);
    facade.setSearchTerm('juan@example.com');
    expect(facade.filteredQuotes()).toEqual([quote]);
    facade.setStatusFilter(QuoteStatus.CERRADA);
    expect(facade.filteredQuotes()).toEqual([]);
  });
});
