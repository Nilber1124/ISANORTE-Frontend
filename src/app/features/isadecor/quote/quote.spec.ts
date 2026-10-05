import { PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap } from '@angular/router';

import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { PublicProductDetailResponse } from '../../../data/models/public-content/public-product-detail.model';
import { PublicQuoteRequest } from '../../../data/models/public-content/public-quote.model';
import { Quote } from './quote';
import { QuoteFacade } from './quote.facade';

const product: PublicProductDetailResponse = {
  sku: 'WP-ROBLE-001',
  nombre: 'Wall Panel Roble',
  slug: 'wall-panel-roble',
  resumen: null,
  descripcion: 'Panel',
  tituloSeo: null,
  descripcionSeo: null,
  precioBase: null,
  precioAnterior: null,
  descuentoPorcentaje: null,
  disponibilidad: ProductAvailability.DISPONIBLE,
  retiroEnTienda: null,
  categorias: [],
  variantes: [],
  imagenes: [],
  especificaciones: [],
  documentos: [],
  configuracionCalculo: null,
};

class QuoteFacadeStub {
  readonly product = signal<PublicProductDetailResponse | null>(product);
  readonly loadingProduct = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly notFound = signal(false);
  readonly quoteResult = signal(null);
  readonly requests: PublicQuoteRequest[] = [];
  loadProduct(): void {}
  submit(request: PublicQuoteRequest): void {
    this.requests.push(request);
    this.submitting.set(true);
  }
}

describe('Quote', () => {
  let fixture: ComponentFixture<Quote>;
  let facade: QuoteFacadeStub;

  async function create(params: Record<string, string>): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [Quote],
      providers: [
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(params) } },
        },
      ],
    })
      .overrideComponent(Quote, {
        set: { providers: [{ provide: QuoteFacade, useClass: QuoteFacadeStub }] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(Quote);
    facade = fixture.debugElement.injector.get(QuoteFacade) as unknown as QuoteFacadeStub;
    fixture.detectChanges();
  }

  it('uses a valid quantity from the query params and falls back to one when invalid', async () => {
    await create({ producto: product.slug, cantidad: '21' });
    expect(fixture.componentInstance.cantidad()).toBe('21');

    TestBed.resetTestingModule();
    await create({ producto: product.slug, cantidad: '2.5' });
    expect(fixture.componentInstance.cantidad()).toBe('1');
  });

  it('requires name, email, telephone and a positive integer quantity', async () => {
    await create({ producto: product.slug });
    const component = fixture.componentInstance;
    component.submitted.set(true);
    component.cantidad.set('1.5');
    expect(component.fieldErrors().nombreCliente).toBeTruthy();
    expect(component.fieldErrors().emailCliente).toBeTruthy();
    expect(component.fieldErrors().telefonoCliente).toBeTruthy();
    expect(component.fieldErrors().cantidad).toBeTruthy();

    component.nombreCliente.set('Ana');
    component.emailCliente.set('correo-invalido');
    component.telefonoCliente.set('999');
    component.cantidad.set('2');
    expect(component.fieldErrors().emailCliente).toContain('válido');
  });

  it('builds one detail with the loaded product slug and blocks a duplicate submit', async () => {
    await create({ producto: product.slug, cantidad: '21' });
    const component = fixture.componentInstance as unknown as { submit(): void } & Quote;
    component.nombreCliente.set('Ana');
    component.emailCliente.set('ana@example.com');
    component.telefonoCliente.set('999 999 999');
    component.submit();
    component.submit();

    expect(facade.requests).toHaveLength(1);
    expect(facade.requests[0].detalles?.[0].productoSlug).toBe(product.slug);
    expect(facade.requests[0].detalles?.[0].cantidad).toBe(21);
    expect(facade.requests[0].canal).toBe('FORMULARIO');
  });
});
