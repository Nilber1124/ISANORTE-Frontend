import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';

import { AddressRequest, AddressResponse } from '../../../../data/models/address/address.model';
import { OrderStatus } from '../../../../data/models/order/order-status.enum';
import { PublicOrderResponse } from '../../../../data/models/public-content/public-order.model';
import { PublicQuoteResponse } from '../../../../data/models/public-content/public-quote.model';
import { MiCuenta } from './mi-cuenta';
import { MiCuentaFacade } from './mi-cuenta.facade';

const order: PublicOrderResponse = {
  codigo: 'PED-0001',
  direccionCalle: 'Av. Siempre Viva 123',
  direccionDistrito: 'Miraflores',
  direccionCiudad: 'Lima',
  estado: OrderStatus.PENDIENTE_PAGO,
  totalPedido: null,
  detalles: [],
  fechaCreacion: '2026-09-23T02:00:00',
};

class MiCuentaFacadeStub {
  readonly quotes = signal<readonly PublicQuoteResponse[]>([]);
  readonly loadingQuotes = signal(false);
  readonly quotesError = signal<string | null>(null);
  readonly orders = signal<readonly PublicOrderResponse[]>([order]);
  readonly loadingOrders = signal(false);
  readonly ordersError = signal<string | null>(null);
  readonly addresses = signal<readonly AddressResponse[]>([]);
  readonly loadingAddresses = signal(false);
  readonly addressesError = signal<string | null>(null);
  readonly addressFormOpen = signal(false);
  readonly editingAddress = signal<AddressResponse | null>(null);
  readonly savingAddress = signal(false);
  readonly addressFormError = signal<string | null>(null);
  readonly deletingAddressId = signal<string | null>(null);

  readonly cargarCotizacionesCalls: number[] = [];
  readonly cargarPedidosCalls: number[] = [];
  readonly cargarDireccionesCalls: number[] = [];
  readonly saveAddressCalls: AddressRequest[] = [];

  cargarCotizaciones(): void {
    this.cargarCotizacionesCalls.push(1);
  }
  cargarPedidos(): void {
    this.cargarPedidosCalls.push(1);
  }
  cargarDirecciones(): void {
    this.cargarDireccionesCalls.push(1);
  }
  openAddressForm(address: AddressResponse | null = null): void {
    this.editingAddress.set(address);
    this.addressFormOpen.set(true);
  }
  closeAddressForm(): void {
    this.addressFormOpen.set(false);
  }
  saveAddress(request: AddressRequest): void {
    this.saveAddressCalls.push(request);
  }
  eliminarDireccion(): void {
    // no-op for this spec
  }
}

describe('MiCuenta', () => {
  let fixture: ComponentFixture<MiCuenta>;
  let facade: MiCuentaFacadeStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MiCuenta],
      providers: [provideRouter([])],
    })
      .overrideComponent(MiCuenta, {
        set: { providers: [{ provide: MiCuentaFacade, useClass: MiCuentaFacadeStub }] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(MiCuenta);
    facade = fixture.debugElement.injector.get(MiCuentaFacade) as unknown as MiCuentaFacadeStub;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('loads quotes, orders and addresses on init', () => {
    expect(facade.cargarCotizacionesCalls).toHaveLength(1);
    expect(facade.cargarPedidosCalls).toHaveLength(1);
    expect(facade.cargarDireccionesCalls).toHaveLength(1);
  });

  it('counts orders still in progress', () => {
    expect(fixture.componentInstance.pedidosEnCurso()).toBe(1);
  });

  it('opens the address form in create mode from the template', () => {
    const addButton = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((button) => button.textContent?.includes('Agregar dirección'));
    addButton?.click();

    expect(facade.addressFormOpen()).toBe(true);
    expect(facade.editingAddress()).toBeNull();
  });

  it('forwards the address form value to the facade', () => {
    const request: AddressRequest = {
      alias: null,
      calle: 'Calle Nueva 1',
      distrito: 'Surco',
      ciudad: 'Lima',
      referencia: null,
      telefonoContacto: '999999999',
      principal: false,
    };
    (fixture.componentInstance as unknown as { saveAddress(value: AddressRequest): void }).saveAddress(
      request,
    );
    expect(facade.saveAddressCalls).toEqual([request]);
  });
});
