import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import { AddressRequest, AddressResponse } from '../../../../data/models/address/address.model';
import { PublicOrderResponse } from '../../../../data/models/public-content/public-order.model';
import { PublicQuoteResponse } from '../../../../data/models/public-content/public-quote.model';
import { ClienteApiService } from '../../../../data/services/cliente-api.service';

@Injectable()
export class MiCuentaFacade {
  private readonly api = inject(ClienteApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _quotes = signal<readonly PublicQuoteResponse[]>([]);
  private readonly _loadingQuotes = signal(true);
  private readonly _quotesError = signal<string | null>(null);

  private readonly _orders = signal<readonly PublicOrderResponse[]>([]);
  private readonly _loadingOrders = signal(true);
  private readonly _ordersError = signal<string | null>(null);

  private readonly _addresses = signal<readonly AddressResponse[]>([]);
  private readonly _loadingAddresses = signal(true);
  private readonly _addressesError = signal<string | null>(null);

  private readonly _addressFormOpen = signal(false);
  private readonly _editingAddress = signal<AddressResponse | null>(null);
  private readonly _savingAddress = signal(false);
  private readonly _addressFormError = signal<string | null>(null);
  private readonly _deletingAddressId = signal<string | null>(null);

  readonly quotes = this._quotes.asReadonly();
  readonly loadingQuotes = this._loadingQuotes.asReadonly();
  readonly quotesError = this._quotesError.asReadonly();

  readonly orders = this._orders.asReadonly();
  readonly loadingOrders = this._loadingOrders.asReadonly();
  readonly ordersError = this._ordersError.asReadonly();

  readonly addresses = this._addresses.asReadonly();
  readonly loadingAddresses = this._loadingAddresses.asReadonly();
  readonly addressesError = this._addressesError.asReadonly();

  readonly addressFormOpen = this._addressFormOpen.asReadonly();
  readonly editingAddress = this._editingAddress.asReadonly();
  readonly savingAddress = this._savingAddress.asReadonly();
  readonly addressFormError = this._addressFormError.asReadonly();
  readonly deletingAddressId = this._deletingAddressId.asReadonly();

  cargarCotizaciones(): void {
    this._loadingQuotes.set(true);
    this._quotesError.set(null);
    this.api
      .misCotizaciones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (quotes) => {
          this._quotes.set(quotes);
          this._loadingQuotes.set(false);
        },
        error: (error: unknown) => {
          this._loadingQuotes.set(false);
          if (this.redirectIfUnauthenticated(error)) return;
          this._quotesError.set('No pudimos cargar tus cotizaciones. Inténtalo nuevamente.');
        },
      });
  }

  cargarPedidos(): void {
    this._loadingOrders.set(true);
    this._ordersError.set(null);
    this.api
      .misPedidos()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (orders) => {
          this._orders.set(orders);
          this._loadingOrders.set(false);
        },
        error: (error: unknown) => {
          this._loadingOrders.set(false);
          if (this.redirectIfUnauthenticated(error)) return;
          this._ordersError.set('No pudimos cargar tus pedidos. Inténtalo nuevamente.');
        },
      });
  }

  cargarDirecciones(): void {
    this._loadingAddresses.set(true);
    this._addressesError.set(null);
    this.api
      .direcciones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (addresses) => {
          this._addresses.set(addresses);
          this._loadingAddresses.set(false);
        },
        error: (error: unknown) => {
          this._loadingAddresses.set(false);
          if (this.redirectIfUnauthenticated(error)) return;
          this._addressesError.set('No pudimos cargar tus direcciones. Inténtalo nuevamente.');
        },
      });
  }

  openAddressForm(address: AddressResponse | null = null): void {
    this._editingAddress.set(address);
    this._addressFormError.set(null);
    this._addressFormOpen.set(true);
  }

  closeAddressForm(): void {
    this._addressFormOpen.set(false);
    this._editingAddress.set(null);
  }

  saveAddress(request: AddressRequest): void {
    if (this._savingAddress()) return;

    this._savingAddress.set(true);
    this._addressFormError.set(null);
    const editing = this._editingAddress();
    const request$ = editing
      ? this.api.actualizarDireccion(editing.id, request)
      : this.api.crearDireccion(request);

    request$
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this._savingAddress.set(false)))
      .subscribe({
        next: () => {
          this.closeAddressForm();
          this.cargarDirecciones();
        },
        error: () =>
          this._addressFormError.set(
            'No pudimos guardar la dirección. Revisa los datos e inténtalo nuevamente.',
          ),
      });
  }

  eliminarDireccion(id: string): void {
    if (this._deletingAddressId() !== null) return;

    this._deletingAddressId.set(id);
    this.api
      .eliminarDireccion(id)
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(() => this._deletingAddressId.set(null)))
      .subscribe({
        next: () => this.cargarDirecciones(),
        error: () =>
          this._addressesError.set('No pudimos eliminar la dirección. Inténtalo nuevamente.'),
      });
  }

  /** Si la sesión expiró (401), redirige a login y evita mostrar un mensaje de error genérico. */
  private redirectIfUnauthenticated(error: unknown): boolean {
    if (error instanceof HttpErrorResponse && error.status === 401) {
      void this.router.navigate(['/isadecor/ingresar'], {
        queryParams: { returnUrl: '/isadecor/mi-cuenta' },
      });
      return true;
    }
    return false;
  }
}
