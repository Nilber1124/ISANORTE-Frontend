import { PLATFORM_ID, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { IsadecorQuoteCartService } from '../../../core/services/isadecor-quote-cart.service';
import { AddressResponse } from '../../../data/models/address/address.model';
import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { PublicProductDetailResponse } from '../../../data/models/public-content/public-product-detail.model';
import { Checkout } from './checkout';
import { CheckoutSubmission, CheckoutFacade } from './checkout.facade';

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

const addresses: AddressResponse[] = [
  {
    id: 'addr-1',
    alias: 'Casa',
    calle: 'Av. Siempre Viva 123',
    distrito: 'Miraflores',
    ciudad: 'Lima',
    referencia: null,
    telefonoContacto: '987654321',
    principal: true,
  },
];

class CheckoutFacadeStub {
  readonly mergingProduct = signal(false);
  readonly loadingAddresses = signal(false);
  readonly addresses = signal<readonly AddressResponse[]>([]);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly orderResult = signal(null);
  readonly mergeCalls: Array<{ slug: string; quantity: number }> = [];
  readonly submitCalls: CheckoutSubmission[] = [];
  loadAddressesCalls = 0;

  loadAddresses(): void {
    this.loadAddressesCalls++;
  }
  mergeProductIntoCart(slug: string, quantity: number): void {
    this.mergeCalls.push({ slug, quantity });
  }
  submit(details: CheckoutSubmission): void {
    this.submitCalls.push(details);
    this.submitting.set(true);
  }
}

describe('Checkout', () => {
  let fixture: ComponentFixture<Checkout>;
  let facade: CheckoutFacadeStub;
  let cart: IsadecorQuoteCartService;

  async function create(params: Record<string, string>): Promise<void> {
    await TestBed.configureTestingModule({
      imports: [Checkout],
      providers: [
        provideRouter([]),
        { provide: PLATFORM_ID, useValue: 'browser' },
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { queryParamMap: convertToParamMap(params) } },
        },
      ],
    })
      .overrideComponent(Checkout, {
        set: { providers: [{ provide: CheckoutFacade, useClass: CheckoutFacadeStub }] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(Checkout);
    facade = fixture.debugElement.injector.get(CheckoutFacade) as unknown as CheckoutFacadeStub;
    cart = TestBed.inject(IsadecorQuoteCartService);
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(() => localStorage.clear());
  afterEach(() => localStorage.clear());

  it('loads the saved addresses on init', async () => {
    await create({});
    expect(facade.loadAddressesCalls).toBe(1);
  });

  it('merges the product from the query params into the shared cart with a valid quantity', async () => {
    await create({ producto: product.slug, cantidad: '21' });
    expect(facade.mergeCalls).toEqual([{ slug: product.slug, quantity: 21 }]);
  });

  it('does not merge anything when there is no producto query param', async () => {
    await create({});
    expect(facade.mergeCalls).toHaveLength(0);
  });

  it('preselects the principal address once the list loads', async () => {
    await create({});
    facade.addresses.set(addresses);
    fixture.detectChanges();
    expect(fixture.componentInstance.selectedAddressId()).toBe('addr-1');
    expect(fixture.componentInstance.usingNewAddress()).toBe(false);
  });

  it('requires the inline address fields when using a new address', async () => {
    await create({});
    const component = fixture.componentInstance;
    component.submitted.set(true);
    expect(component.fieldErrors().calle).toBeTruthy();
    expect(component.fieldErrors().distrito).toBeTruthy();
    expect(component.fieldErrors().ciudad).toBeTruthy();
    expect(component.fieldErrors().telefonoContacto).toBeTruthy();
  });

  it('submits the saved address id and blocks an empty-cart submit', async () => {
    await create({});
    facade.addresses.set(addresses);
    fixture.detectChanges();
    const component = fixture.componentInstance as unknown as { submit(event: Event): void } & Checkout;
    component.submit(new Event('submit'));

    expect(facade.submitCalls).toHaveLength(0);

    cart.addProduct(product, null, 1);
    component.submit(new Event('submit'));
    expect(facade.submitCalls).toEqual([
      { direccionId: 'addr-1', direccionNueva: null, ruc: null, razonSocial: null },
    ]);
  });

  it('submits the inline new-address details built from the form', async () => {
    await create({});
    cart.addProduct(product, null, 1);
    const component = fixture.componentInstance as unknown as { submit(event: Event): void } & Checkout;
    component.calle.set('Calle Nueva 1');
    component.distrito.set('Surco');
    component.ciudad.set('Lima');
    component.telefonoContacto.set('999999999');
    component.submit(new Event('submit'));

    expect(facade.submitCalls).toEqual([
      {
        direccionId: null,
        direccionNueva: {
          alias: null,
          calle: 'Calle Nueva 1',
          distrito: 'Surco',
          ciudad: 'Lima',
          referencia: null,
          telefonoContacto: '999999999',
        },
        ruc: null,
        razonSocial: null,
      },
    ]);
  });
});
