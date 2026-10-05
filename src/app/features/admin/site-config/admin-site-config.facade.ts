import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { CompanyResponse } from '../../../data/models/company/company-response.model';
import { SiteConfigCreateRequest } from '../../../data/models/site-config/site-config-create-request.model';
import { SiteConfigResponse } from '../../../data/models/site-config/site-config-response.model';
import { SiteConfigUpdateRequest } from '../../../data/models/site-config/site-config-update-request.model';
import { CompanyApiService } from '../../../data/services/company-api.service';
import { SiteConfigApiService } from '../../../data/services/site-config-api.service';

export type SiteConfigFormMode = 'create' | 'edit';

@Injectable()
export class AdminSiteConfigFacade {
  private readonly siteConfigApi = inject(SiteConfigApiService);
  private readonly companyApi = inject(CompanyApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _configs = signal<readonly SiteConfigResponse[]>([]);
  private readonly _companies = signal<readonly CompanyResponse[]>([]);
  private readonly _selectedConfigId = signal<string | null>(null);
  private readonly _loading = signal(true);
  private readonly _loadingFormData = signal(true);
  private readonly _submitting = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _success = signal<string | null>(null);
  private readonly _formOpen = signal(false);
  private readonly _formMode = signal<SiteConfigFormMode>('create');

  readonly configs = this._configs.asReadonly();
  readonly companies = this._companies.asReadonly();
  readonly selectedConfig = computed(() => {
    const configs = this._configs();
    if (configs.length === 1) return configs[0];
    const selectedId = this._selectedConfigId();
    return selectedId ? (configs.find((config) => config.id === selectedId) ?? null) : null;
  });
  readonly loading = this._loading.asReadonly();
  readonly loadingFormData = this._loadingFormData.asReadonly();
  readonly submitting = this._submitting.asReadonly();
  readonly error = this._error.asReadonly();
  readonly success = this._success.asReadonly();
  readonly formOpen = this._formOpen.asReadonly();
  readonly formMode = this._formMode.asReadonly();

  load(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.clearFeedback();
    this.loadConfigs();
    this.loadCompanies();
  }

  selectConfig(id: string): void {
    if (this._configs().some((config) => config.id === id)) {
      this._selectedConfigId.set(id);
      this.clearFeedback();
      this.siteConfigApi
        .getById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (detail) =>
            this._configs.update((configs) =>
              configs.map((config) => (config.id === detail.id ? detail : config)),
            ),
          error: (error: HttpErrorResponse) => {
            this._error.set(
              error.status === 404
                ? 'La configuración seleccionada ya no existe.'
                : 'No pudimos consultar el detalle de la configuración.',
            );
          },
        });
    }
  }

  openCreate(): void {
    this.clearFeedback();
    this._formMode.set('create');
    this._formOpen.set(true);
  }

  openEdit(): void {
    if (!this.selectedConfig()) return;
    this.clearFeedback();
    this._formMode.set('edit');
    this._formOpen.set(true);
  }

  closeForm(): void {
    if (this._submitting()) return;
    this._formOpen.set(false);
    this._error.set(null);
  }

  create(request: SiteConfigCreateRequest): void {
    if (this._submitting()) return;
    if (!this._companies().some((company) => company.id === request.empresaId)) {
      this._error.set('Primero debes registrar o seleccionar una empresa válida.');
      return;
    }

    const createRequest: SiteConfigCreateRequest = {
      empresaId: request.empresaId,
      clave: request.clave,
      tituloSitio: request.tituloSitio,
      descripcionSitio: request.descripcionSitio,
      logoUrl: request.logoUrl,
      logoBlancoUrl: request.logoBlancoUrl,
      faviconUrl: request.faviconUrl,
      colorPrimario: request.colorPrimario,
      colorSecundario: request.colorSecundario,
      textoPiePagina: request.textoPiePagina,
    };

    this.beginSubmission();
    this.siteConfigApi
      .create(createRequest)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._submitting.set(false)),
      )
      .subscribe({
        next: (created) => {
          this._configs.update((configs) => [...configs, created]);
          this._selectedConfigId.set(created.id);
          this._success.set('Configuración creada correctamente.');
          this._formOpen.set(false);
        },
        error: (error: HttpErrorResponse) => this.handleSaveError(error),
      });
  }

  update(request: SiteConfigUpdateRequest): void {
    const selected = this.selectedConfig();
    if (!selected || this._submitting()) return;

    const updateRequest: SiteConfigUpdateRequest = {
      clave: request.clave,
      tituloSitio: request.tituloSitio,
      descripcionSitio: request.descripcionSitio,
      logoUrl: request.logoUrl,
      logoBlancoUrl: request.logoBlancoUrl,
      faviconUrl: request.faviconUrl,
      colorPrimario: request.colorPrimario,
      colorSecundario: request.colorSecundario,
      textoPiePagina: request.textoPiePagina,
    };

    this.beginSubmission();
    this.siteConfigApi
      .update(selected.id, updateRequest)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._submitting.set(false)),
      )
      .subscribe({
        next: (updated) => {
          this._configs.update((configs) =>
            configs.map((config) => (config.id === updated.id ? updated : config)),
          );
          this._selectedConfigId.set(updated.id);
          this._success.set('Configuración actualizada correctamente.');
          this._formOpen.set(false);
        },
        error: (error: HttpErrorResponse) => this.handleSaveError(error),
      });
  }

  clearFeedback(): void {
    this._error.set(null);
    this._success.set(null);
  }

  private loadConfigs(): void {
    this._loading.set(true);
    this.siteConfigApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (configs) => {
          this._configs.set(configs);
          this._selectedConfigId.set(configs.length === 1 ? configs[0].id : null);
        },
        error: () =>
          this._error.set('No pudimos cargar las configuraciones. Comprueba tu conexión.'),
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
          this._error.set('No pudimos cargar las empresas disponibles. Comprueba tu conexión.'),
      });
  }

  private beginSubmission(): void {
    this.clearFeedback();
    this._submitting.set(true);
  }

  private handleSaveError(error: HttpErrorResponse): void {
    if (error.status === 400) {
      this._error.set('Los datos ingresados no son válidos. Revísalos e inténtalo nuevamente.');
    } else if (error.status === 404) {
      this._error.set('La configuración o empresa indicada ya no existe.');
    } else if (error.status === 409) {
      this._error.set('No se pudo guardar porque existe un conflicto con la configuración.');
    } else {
      this._error.set('No pudimos guardar la configuración. Inténtalo nuevamente.');
    }
  }
}
