import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { BusinessUnitCreateRequest } from '../../../data/models/business-unit/business-unit-create-request.model';
import { BusinessUnitResponse } from '../../../data/models/business-unit/business-unit-response.model';
import { BusinessUnitUpdateRequest } from '../../../data/models/business-unit/business-unit-update-request.model';
import { CompanyResponse } from '../../../data/models/company/company-response.model';
import { BusinessUnitApiService } from '../../../data/services/business-unit-api.service';
import { CompanyApiService } from '../../../data/services/company-api.service';

export type BusinessUnitFormMode = 'create' | 'edit';

@Injectable()
export class AdminBusinessUnitsFacade {
  private readonly businessUnitApi = inject(BusinessUnitApiService);
  private readonly companyApi = inject(CompanyApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _businessUnits = signal<readonly BusinessUnitResponse[]>([]);
  private readonly _companies = signal<readonly CompanyResponse[]>([]);
  private readonly _loading = signal(true);
  private readonly _loadingFormData = signal(true);
  private readonly _submitting = signal(false);
  private readonly _changingActiveId = signal<string | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _success = signal<string | null>(null);
  private readonly _selectedBusinessUnit = signal<BusinessUnitResponse | null>(null);
  private readonly _formMode = signal<BusinessUnitFormMode>('create');
  private readonly _formOpen = signal(false);

  readonly businessUnits = this._businessUnits.asReadonly();
  readonly companies = this._companies.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly loadingFormData = this._loadingFormData.asReadonly();
  readonly submitting = this._submitting.asReadonly();
  readonly changingActiveId = this._changingActiveId.asReadonly();
  readonly error = this._error.asReadonly();
  readonly success = this._success.asReadonly();
  readonly selectedBusinessUnit = this._selectedBusinessUnit.asReadonly();
  readonly formMode = this._formMode.asReadonly();
  readonly formOpen = this._formOpen.asReadonly();

  load(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadBusinessUnits();
    this.loadCompanies();
  }

  openCreate(): void {
    this._selectedBusinessUnit.set(null);
    this._formMode.set('create');
    this._error.set(null);
    this._success.set(null);
    this._formOpen.set(true);
  }

  openEdit(businessUnit: BusinessUnitResponse): void {
    this._selectedBusinessUnit.set(businessUnit);
    this._formMode.set('edit');
    this._error.set(null);
    this._success.set(null);
    this._formOpen.set(true);
  }

  closeForm(): void {
    if (this._submitting()) return;
    this._formOpen.set(false);
    this._selectedBusinessUnit.set(null);
    this._error.set(null);
  }

  create(request: BusinessUnitCreateRequest): void {
    if (this._submitting()) return;
    this._submitting.set(true);
    this._error.set(null);
    this._success.set(null);
    this.businessUnitApi
      .create(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._submitting.set(false)),
      )
      .subscribe({
        next: (businessUnit) => {
          this.upsertBusinessUnit(businessUnit);
          this._success.set('Unidad de negocio creada correctamente.');
          this._formOpen.set(false);
          this._selectedBusinessUnit.set(null);
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  update(request: BusinessUnitUpdateRequest): void {
    const selectedBusinessUnit = this._selectedBusinessUnit();
    if (this._submitting() || selectedBusinessUnit === null) return;
    this._submitting.set(true);
    this._error.set(null);
    this._success.set(null);
    this.businessUnitApi
      .update(selectedBusinessUnit.id, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._submitting.set(false)),
      )
      .subscribe({
        next: (businessUnit) => {
          this.upsertBusinessUnit(businessUnit);
          this._success.set('Unidad de negocio actualizada correctamente.');
          this._formOpen.set(false);
          this._selectedBusinessUnit.set(null);
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  changeActive(businessUnit: BusinessUnitResponse, active: boolean): void {
    if (this._changingActiveId() !== null || this._submitting()) return;
    this._changingActiveId.set(businessUnit.id);
    this._error.set(null);
    this._success.set(null);
    this.businessUnitApi
      .changeActive(businessUnit.id, { activo: active })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._changingActiveId.set(null)),
      )
      .subscribe({
        next: (updatedBusinessUnit) => {
          this.upsertBusinessUnit(updatedBusinessUnit);
          this._success.set(
            active
              ? 'Unidad de negocio activada correctamente.'
              : 'Unidad de negocio desactivada correctamente.',
          );
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  clearFeedback(): void {
    this._error.set(null);
    this._success.set(null);
  }

  private loadBusinessUnits(): void {
    this._loading.set(true);
    this._error.set(null);
    this.businessUnitApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (businessUnits) => this._businessUnits.set(this.sortBusinessUnits(businessUnits)),
        error: () =>
          this._error.set(
            'No pudimos cargar las unidades de negocio. Comprueba tu conexión e inténtalo nuevamente.',
          ),
      });
  }

  private loadCompanies(): void {
    this._loadingFormData.set(true);
    this.companyApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loadingFormData.set(false)),
      )
      .subscribe({
        next: (companies) => this._companies.set(companies),
        error: () =>
          this._error.set(
            'Las unidades se cargaron, pero no pudimos obtener las empresas para crear una nueva.',
          ),
      });
  }

  private upsertBusinessUnit(businessUnit: BusinessUnitResponse): void {
    const businessUnits = this._businessUnits();
    const nextBusinessUnits = businessUnits.some((item) => item.id === businessUnit.id)
      ? businessUnits.map((item) => (item.id === businessUnit.id ? businessUnit : item))
      : [...businessUnits, businessUnit];
    this._businessUnits.set(this.sortBusinessUnits(nextBusinessUnits));
  }

  private sortBusinessUnits(units: readonly BusinessUnitResponse[]): BusinessUnitResponse[] {
    return [...units].sort(
      (first, second) =>
        (first.orden ?? Number.MAX_SAFE_INTEGER) - (second.orden ?? Number.MAX_SAFE_INTEGER) ||
        first.nombre.localeCompare(second.nombre),
    );
  }

  private mutationErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) return 'Revisa los datos ingresados e inténtalo nuevamente.';
      if (error.status === 404) return 'La unidad de negocio o la empresa ya no existe.';
      if (error.status === 409)
        return 'No se pudo guardar la unidad porque existe un conflicto con sus datos.';
    }
    return 'No pudimos guardar el cambio. Comprueba tu conexión e inténtalo nuevamente.';
  }
}
