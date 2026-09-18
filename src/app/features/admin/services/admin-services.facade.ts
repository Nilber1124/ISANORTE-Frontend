import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { ServiceCreateRequest } from '../../../data/models/service/service-create-request.model';
import { ServiceResponse } from '../../../data/models/service/service-response.model';
import { ServiceUpdateRequest } from '../../../data/models/service/service-update-request.model';
import { ServiceApiService } from '../../../data/services/service-api.service';

export type ServiceFormMode = 'create' | 'edit';

@Injectable()
export class AdminServicesFacade {
  private readonly serviceApi = inject(ServiceApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _services = signal<readonly ServiceResponse[]>([]);
  private readonly _loading = signal(true);
  private readonly _submitting = signal(false);
  private readonly _changingActiveId = signal<string | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _success = signal<string | null>(null);
  private readonly _selectedService = signal<ServiceResponse | null>(null);
  private readonly _formMode = signal<ServiceFormMode>('create');
  private readonly _formOpen = signal(false);

  readonly services = this._services.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly submitting = this._submitting.asReadonly();
  readonly changingActiveId = this._changingActiveId.asReadonly();
  readonly error = this._error.asReadonly();
  readonly success = this._success.asReadonly();
  readonly selectedService = this._selectedService.asReadonly();
  readonly formMode = this._formMode.asReadonly();
  readonly formOpen = this._formOpen.asReadonly();

  load(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this._loading.set(true);
    this._error.set(null);
    this.serviceApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (services) => this._services.set(this.sortServices(services)),
        error: () =>
          this._error.set(
            'No pudimos cargar los servicios. Comprueba tu conexión e inténtalo nuevamente.',
          ),
      });
  }

  openCreate(): void {
    this._selectedService.set(null);
    this._formMode.set('create');
    this._error.set(null);
    this._success.set(null);
    this._formOpen.set(true);
  }

  openEdit(service: ServiceResponse): void {
    this._selectedService.set(service);
    this._formMode.set('edit');
    this._error.set(null);
    this._success.set(null);
    this._formOpen.set(true);
  }

  closeForm(): void {
    if (this._submitting()) return;
    this._formOpen.set(false);
    this._selectedService.set(null);
    this._error.set(null);
  }

  create(request: ServiceCreateRequest): void {
    if (this._submitting()) return;
    this._submitting.set(true);
    this._error.set(null);
    this._success.set(null);

    this.serviceApi
      .create(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._submitting.set(false)),
      )
      .subscribe({
        next: (service) => {
          this.upsertService(service);
          this._success.set('Servicio creado correctamente.');
          this._formOpen.set(false);
          this._selectedService.set(null);
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  update(request: ServiceUpdateRequest): void {
    const selectedService = this._selectedService();
    if (this._submitting() || selectedService === null) return;
    this._submitting.set(true);
    this._error.set(null);
    this._success.set(null);

    this.serviceApi
      .update(selectedService.id, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._submitting.set(false)),
      )
      .subscribe({
        next: (service) => {
          this.upsertService(service);
          this._success.set('Servicio actualizado correctamente.');
          this._formOpen.set(false);
          this._selectedService.set(null);
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  changeActive(service: ServiceResponse, active: boolean): void {
    if (this._changingActiveId() !== null || this._submitting()) return;
    this._changingActiveId.set(service.id);
    this._error.set(null);
    this._success.set(null);

    this.serviceApi
      .changeActive(service.id, { activo: active })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._changingActiveId.set(null)),
      )
      .subscribe({
        next: (updatedService) => {
          this.upsertService(updatedService);
          this._success.set(
            active ? 'Servicio activado correctamente.' : 'Servicio desactivado correctamente.',
          );
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  clearFeedback(): void {
    this._error.set(null);
    this._success.set(null);
  }

  private upsertService(service: ServiceResponse): void {
    const services = this._services();
    const nextServices = services.some((item) => item.id === service.id)
      ? services.map((item) => (item.id === service.id ? service : item))
      : [...services, service];
    this._services.set(this.sortServices(nextServices));
  }

  private sortServices(services: readonly ServiceResponse[]): ServiceResponse[] {
    return [...services].sort(
      (first, second) =>
        (first.orden ?? Number.MAX_SAFE_INTEGER) - (second.orden ?? Number.MAX_SAFE_INTEGER) ||
        first.nombre.localeCompare(second.nombre),
    );
  }

  private mutationErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) return 'Revisa los datos ingresados e inténtalo nuevamente.';
      if (error.status === 404) return 'El servicio ya no existe.';
      if (error.status === 409) return 'Ya existe un servicio con ese slug.';
    }

    return 'No pudimos guardar el cambio. Comprueba tu conexión e inténtalo nuevamente.';
  }
}
