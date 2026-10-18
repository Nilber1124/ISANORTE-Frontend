import { PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { IsadecorQuoteCartService } from '../../../core/services/isadecor-quote-cart.service';
import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { PublicProductDetailResponse } from '../../../data/models/public-content/public-product-detail.model';
import { QuoteCustomerDetails } from './quote.facade';
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
  readonly mergingProduct = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly quoteResult = signal(null);
  readonly mergeCalls: Array<{ slug: string; quantity: number }> = [];
  readonly submitCalls: QuoteCustomerDetails[] = [];
  mergeProductIntoCart(slug: string, quantity: number): void {
    this.mergeCalls.push({ slug, quantity });
  }
  submit(customer: QuoteCustomerDetails): void {
    this.submitCalls.push(customer);
    this.submitting.set(true);
  }
}

describe('Quote', () => {
  let fixture: ComponentFixture<Quote>;
  let facade: QuoteFacadeStub;
  let cart: IsadecorQuoteCartService;

  async function create(params: Record<string, string>): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [Quote],
      providers: [
        provideRouter([]),
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
    cart = TestBed.inject(IsadecorQuoteCartService);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('merges the product from the query params into the shared cart with a valid quantity', async () => {
    await create({ producto: product.slug, cantidad: '21' });
    expect(facade.mergeCalls).toEqual([{ slug: product.slug, quantity: 21 }]);
  });

  it('falls back to a quantity of one for an invalid quantity query param', async () => {
    await create({ producto: product.slug, cantidad: '2.5' });
    expect(facade.mergeCalls).toEqual([{ slug: product.slug, quantity: 1 }]);
  });

  it('does not merge anything when there is no producto query param', async () => {
    await create({});
    expect(facade.mergeCalls).toHaveLength(0);
  });

  it('requires name, email and telephone', async () => {
    await create({});
    const component = fixture.componentInstance;
    component.submitted.set(true);
    expect(component.fieldErrors().nombreCliente).toBeTruthy();
    expect(component.fieldErrors().emailCliente).toBeTruthy();
    expect(component.fieldErrors().telefonoCliente).toBeTruthy();

    component.nombreCliente.set('Ana');
    component.emailCliente.set('correo-invalido');
    component.telefonoCliente.set('999');
    expect(component.fieldErrors().emailCliente).toContain('válido');
  });

  it('submits the customer details built from the form and blocks an empty-cart submit', async () => {
    await create({});
    const component = fixture.componentInstance as unknown as { submit(event: Event): void } & Quote;
    component.nombreCliente.set('Ana');
    component.emailCliente.set('ana@example.com');
    component.telefonoCliente.set('999 999 999');
    component.submit(new Event('submit'));

    expect(facade.submitCalls).toHaveLength(0);

    cart.addProduct(product, null, 1);
    component.submit(new Event('submit'));
    expect(facade.submitCalls).toEqual([
      {
        nombreCliente: 'Ana',
        emailCliente: 'ana@example.com',
        telefonoCliente: '999 999 999',
        empresaCliente: null,
        ciudad: null,
        mensaje: null,
      },
    ]);
  });
});
