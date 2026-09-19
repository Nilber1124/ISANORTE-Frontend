import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { CompanyCreateRequest } from '../../../data/models/company/company-create-request.model';
import { CompanyResponse, SocialNetworkResponse } from '../../../data/models/company/company-response.model';
import { CompanyUpdateRequest } from '../../../data/models/company/company-update-request.model';
import { SocialNetworkRequest } from '../../../data/models/company/social-network-request.model';
import { CompanyApiService } from '../../../data/services/company-api.service';

export type CompanyFormMode = 'create' | 'edit';

@Injectable()
export class AdminCompanyFacade {
  private readonly companyApi = inject(CompanyApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _companies = signal<readonly CompanyResponse[]>([]);
  private readonly _selectedCompanyId = signal<string | null>(null);
  private readonly _loading = signal(true);
  private readonly _submitting = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _success = signal<string | null>(null);

  private readonly _companyFormOpen = signal(false);
  private readonly _companyFormMode = signal<CompanyFormMode>('create');

  private readonly _socialFormOpen = signal(false);
  private readonly _selectedSocialNetwork = signal<SocialNetworkResponse | null>(null);
  private readonly _savingSocialNetwork = signal(false);
  private readonly _deletingSocialNetworkId = signal<string | null>(null);

  readonly companies = this._companies.asReadonly();
  readonly company = computed(() => {
    const all = this._companies();
    if (all.length === 1) return all[0];
    const selectedId = this._selectedCompanyId();
    if (selectedId) return all.find((c) => c.id === selectedId) ?? null;
    return null;
  });

  readonly loading = this._loading.asReadonly();
  readonly submitting = this._submitting.asReadonly();
  readonly error = this._error.asReadonly();
  readonly success = this._success.asReadonly();

  readonly companyFormOpen = this._companyFormOpen.asReadonly();
  readonly companyFormMode = this._companyFormMode.asReadonly();

  readonly socialFormOpen = this._socialFormOpen.asReadonly();
  readonly selectedSocialNetwork = this._selectedSocialNetwork.asReadonly();
  readonly savingSocialNetwork = this._savingSocialNetwork.asReadonly();
  readonly deletingSocialNetworkId = this._deletingSocialNetworkId.asReadonly();

  load(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this._loading.set(true);
    this._error.set(null);
    this.companyApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (companies) => {
          this._companies.set(companies);
          if (companies.length === 1) {
            this._selectedCompanyId.set(companies[0].id);
          }
        },
        error: () => this._error.set('No pudimos cargar la información de empresa. Comprueba tu conexión.'),
      });
  }

  selectCompany(id: string): void {
    this._selectedCompanyId.set(id);
  }

  openCompanyCreate(): void {
    this._companyFormMode.set('create');
    this._error.set(null);
    this._success.set(null);
    this._companyFormOpen.set(true);
  }

  openCompanyEdit(): void {
    this._companyFormMode.set('edit');
    this._error.set(null);
    this._success.set(null);
    this._companyFormOpen.set(true);
  }

  closeCompanyForm(): void {
    if (this._submitting()) return;
    this._companyFormOpen.set(false);
    this._error.set(null);
  }

  createCompany(request: CompanyCreateRequest): void {
    if (this._submitting()) return;
    this._submitting.set(true);
    this._error.set(null);
    this._success.set(null);
    this.companyApi
      .create(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._submitting.set(false)),
      )
      .subscribe({
        next: (company) => {
          this.upsertCompany(company);
          this._success.set('Empresa registrada correctamente.');
          this._companyFormOpen.set(false);
          this._selectedCompanyId.set(company.id);
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  updateCompany(request: CompanyUpdateRequest): void {
    const company = this.company();
    if (this._submitting() || company === null) return;
    this._submitting.set(true);
    this._error.set(null);
    this._success.set(null);
    this.companyApi
      .update(company.id, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._submitting.set(false)),
      )
      .subscribe({
        next: (updatedCompany) => {
          this.upsertCompany(updatedCompany);
          this._success.set('Datos de empresa actualizados correctamente.');
          this._companyFormOpen.set(false);
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  openSocialNetworkCreate(): void {
    this._selectedSocialNetwork.set(null);
    this._error.set(null);
    this._success.set(null);
    this._socialFormOpen.set(true);
  }

  openSocialNetworkEdit(network: SocialNetworkResponse): void {
    this._selectedSocialNetwork.set(network);
    this._error.set(null);
    this._success.set(null);
    this._socialFormOpen.set(true);
  }

  closeSocialNetworkForm(): void {
    if (this._savingSocialNetwork()) return;
    this._socialFormOpen.set(false);
    this._selectedSocialNetwork.set(null);
    this._error.set(null);
  }

  createSocialNetwork(request: SocialNetworkRequest): void {
    const company = this.company();
    if (this._savingSocialNetwork() || company === null) return;
    this._savingSocialNetwork.set(true);
    this._error.set(null);
    this._success.set(null);
    this.companyApi
      .createSocialNetwork(company.id, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._savingSocialNetwork.set(false)),
      )
      .subscribe({
        next: (network) => {
          this.upsertSocialNetwork(company, network);
          this._success.set('Red social creada correctamente.');
          this._socialFormOpen.set(false);
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  updateSocialNetwork(request: SocialNetworkRequest): void {
    const company = this.company();
    const network = this._selectedSocialNetwork();
    if (this._savingSocialNetwork() || company === null || network === null) return;
    this._savingSocialNetwork.set(true);
    this._error.set(null);
    this._success.set(null);
    this.companyApi
      .updateSocialNetwork(company.id, network.id, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._savingSocialNetwork.set(false)),
      )
      .subscribe({
        next: (updatedNetwork) => {
          this.upsertSocialNetwork(company, updatedNetwork);
          this._success.set('Red social actualizada correctamente.');
          this._socialFormOpen.set(false);
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  deleteSocialNetwork(networkId: string): void {
    const company = this.company();
    if (this._deletingSocialNetworkId() !== null || company === null) return;
    this._deletingSocialNetworkId.set(networkId);
    this._error.set(null);
    this._success.set(null);
    this.companyApi
      .deleteSocialNetwork(company.id, networkId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._deletingSocialNetworkId.set(null)),
      )
      .subscribe({
        next: () => {
          this.removeSocialNetwork(company, networkId);
          this._success.set('Red social eliminada correctamente.');
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  clearFeedback(): void {
    this._error.set(null);
    this._success.set(null);
  }

  private upsertCompany(company: CompanyResponse): void {
    const all = this._companies();
    const nextCompanies = all.some((c) => c.id === company.id)
      ? all.map((c) => (c.id === company.id ? company : c))
      : [...all, company];
    this._companies.set(nextCompanies);
  }

  private upsertSocialNetwork(company: CompanyResponse, network: SocialNetworkResponse): void {
    const currentNetworks = company.redesSociales ?? [];
    const nextNetworks = currentNetworks.some((n) => n.id === network.id)
      ? currentNetworks.map((n) => (n.id === network.id ? network : n))
      : [...currentNetworks, network];
    
    const sortedNetworks = [...nextNetworks].sort(
      (a, b) => (a.orden ?? Number.MAX_SAFE_INTEGER) - (b.orden ?? Number.MAX_SAFE_INTEGER) || a.nombre.localeCompare(b.nombre)
    );
    
    this.upsertCompany({ ...company, redesSociales: sortedNetworks });
  }

  private removeSocialNetwork(company: CompanyResponse, networkId: string): void {
    const currentNetworks = company.redesSociales ?? [];
    const nextNetworks = currentNetworks.filter((n) => n.id !== networkId);
    this.upsertCompany({ ...company, redesSociales: nextNetworks });
  }

  private mutationErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) return 'Revisa los datos ingresados e inténtalo nuevamente.';
      if (error.status === 404) return 'La empresa o red social solicitada ya no existe.';
      if (error.status === 409) return 'No se pudo guardar porque existe un conflicto (ej. RUC duplicado).';
    }
    return 'No pudimos guardar el cambio. Comprueba tu conexión e inténtalo nuevamente.';
  }
}
