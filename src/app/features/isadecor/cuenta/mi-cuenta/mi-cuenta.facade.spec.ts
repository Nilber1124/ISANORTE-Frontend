import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AddressRequest, AddressResponse } from '../../../../data/models/address/address.model';
import { OrderStatus } from '../../../../data/models/order/order-status.enum';
import { PublicOrderResponse } from '../../../../data/models/public-content/public-order.model';
import { ClienteApiService } from '../../../../data/services/cliente-api.service';
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

const address: AddressResponse = {
  id: 'addr-1',
  alias: 'Casa',
  calle: 'Av. Siempre Viva 123',
  distrito: 'Miraflores',
  ciudad: 'Lima',
  referencia: null,
  telefonoContacto: '987654321',
  principal: true,
};

const addressRequest: AddressRequest = {
  alias: 'Casa',
  calle: 'Av. Siempre Viva 123',
  distrito: 'Miraflores',
  ciudad: 'Lima',
  referencia: null,
  telefonoContacto: '987654321',
  principal: true,
};

class ClienteApiStub {
  orders$: Observable<PublicOrderResponse[]> = of([order]);
  addresses$: Observable<AddressResponse[]> = of([address]);
  createResponse$: Observable<AddressResponse> = of(address);
  updateResponse$: Observable<AddressResponse> = of(address);
  deleteResponse$: Observable<void> = of(undefined);
  crearCalls: AddressRequest[] = [];
  actualizarCalls: Array<{ id: string; request: AddressRequest }> = [];
  eliminarCalls: string[] = [];

  misPedidos(): Observable<PublicOrderResponse[]> {
    return this.orders$;
  }
  direcciones(): Observable<AddressResponse[]> {
    return this.addresses$;
  }
  crearDireccion(request: AddressRequest): Observable<AddressResponse> {
    this.crearCalls.push(request);
    return this.createResponse$;
  }
  actualizarDireccion(id: string, request: AddressRequest): Observable<AddressResponse> {
    this.actualizarCalls.push({ id, request });
    return this.updateResponse$;
  }
  eliminarDireccion(id: string): Observable<void> {
    this.eliminarCalls.push(id);
    return this.deleteResponse$;
  }
}

describe('MiCuentaFacade', () => {
  let facade: MiCuentaFacade;
  let api: ClienteApiStub;
  let router: Router;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        MiCuentaFacade,
        ClienteApiStub,
        { provide: ClienteApiService, useExisting: ClienteApiStub },
      ],
    });
    facade = TestBed.inject(MiCuentaFacade);
    api = TestBed.inject(ClienteApiStub);
    router = TestBed.inject(Router);
  });

  it('loads orders and addresses', () => {
    facade.cargarPedidos();
    facade.cargarDirecciones();

    expect(facade.orders()).toEqual([order]);
    expect(facade.loadingOrders()).toBe(false);
    expect(facade.addresses()).toEqual([address]);
    expect(facade.loadingAddresses()).toBe(false);
  });

  it('redirects to login on a 401 while loading orders', () => {
    const navigateSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    api.orders$ = throwError(() => new HttpErrorResponse({ status: 401 }));
    facade.cargarPedidos();
    expect(navigateSpy).toHaveBeenCalledWith(['/isadecor/ingresar'], {
      queryParams: { returnUrl: '/isadecor/mi-cuenta' },
    });
    expect(facade.ordersError()).toBeNull();
  });

  it('exposes a generic error for a non-401 failure while loading addresses', () => {
    api.addresses$ = throwError(() => new HttpErrorResponse({ status: 500 }));
    facade.cargarDirecciones();
    expect(facade.addressesError()).toContain('direcciones');
  });

  it('opens and closes the address form, tracking which address is being edited', () => {
    facade.openAddressForm(address);
    expect(facade.addressFormOpen()).toBe(true);
    expect(facade.editingAddress()).toEqual(address);

    facade.closeAddressForm();
    expect(facade.addressFormOpen()).toBe(false);
    expect(facade.editingAddress()).toBeNull();
  });

  it('creates a new address, closes the form and refreshes the list', () => {
    facade.openAddressForm();
    facade.saveAddress(addressRequest);

    expect(api.crearCalls).toEqual([addressRequest]);
    expect(facade.addressFormOpen()).toBe(false);
    expect(facade.addresses()).toEqual([address]);
  });

  it('updates an existing address instead of creating a new one', () => {
    facade.openAddressForm(address);
    facade.saveAddress(addressRequest);

    expect(api.actualizarCalls).toEqual([{ id: address.id, request: addressRequest }]);
    expect(api.crearCalls).toHaveLength(0);
  });

  it('keeps the form open and exposes a server error when saving fails', () => {
    api.createResponse$ = throwError(() => new HttpErrorResponse({ status: 400 }));
    facade.openAddressForm();
    facade.saveAddress(addressRequest);

    expect(facade.addressFormOpen()).toBe(true);
    expect(facade.addressFormError()).toContain('guardar');
  });

  it('deletes an address and refreshes the list', () => {
    facade.eliminarDireccion(address.id);
    expect(api.eliminarCalls).toEqual([address.id]);
    expect(facade.addresses()).toEqual([address]);
  });
});
