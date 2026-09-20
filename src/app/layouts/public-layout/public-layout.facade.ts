import { isPlatformBrowser, isPlatformServer } from '@angular/common';
import {
  DestroyRef,
  Injectable,
  PLATFORM_ID,
  TransferState,
  computed,
  inject,
  makeStateKey,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { BusinessUnitResponse } from '../../data/models/business-unit/business-unit-response.model';
import { CompanyResponse } from '../../data/models/company/company-response.model';
import { SiteConfigResponse } from '../../data/models/site-config/site-config-response.model';
import { BusinessUnitApiService } from '../../data/services/business-unit-api.service';
import { CompanyApiService } from '../../data/services/company-api.service';
import { SiteConfigApiService } from '../../data/services/site-config-api.service';

export interface PublicLayoutLoadErrors {
  company: string | null;
  siteConfig: string | null;
  businessUnits: string | null;
}

const INITIAL_ERRORS: PublicLayoutLoadErrors = {
  company: null,
  siteConfig: null,
  businessUnits: null,
};

interface PublicLayoutTransferState {
  companies: readonly CompanyResponse[];
  siteConfigs: readonly SiteConfigResponse[];
  businessUnits: readonly BusinessUnitResponse[];
  errors: PublicLayoutLoadErrors;
}

const PUBLIC_LAYOUT_STATE = makeStateKey<PublicLayoutTransferState>('public-layout');

@Injectable()
export class PublicLayoutFacade {
  private readonly companyApi = inject(CompanyApiService);
  private readonly siteConfigApi = inject(SiteConfigApiService);
  private readonly businessUnitApi = inject(BusinessUnitApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly transferState = inject(TransferState);

  private readonly _companies = signal<readonly CompanyResponse[]>([]);
  private readonly _siteConfigs = signal<readonly SiteConfigResponse[]>([]);
  private readonly _businessUnits = signal<readonly BusinessUnitResponse[]>([]);
  private readonly _loading = signal(true);
  private readonly _loaded = signal(false);
  private readonly _errors = signal<PublicLayoutLoadErrors>(INITIAL_ERRORS);
  private readonly _ssrBlocked = signal(false);

  private pendingRequests = 0;
  private requestInFlight = false;

  readonly companies = this._companies.asReadonly();
  readonly siteConfigs = this._siteConfigs.asReadonly();
  readonly businessUnits = this._businessUnits.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly loaded = this._loaded.asReadonly();
  readonly errors = this._errors.asReadonly();
  readonly ssrBlocked = this._ssrBlocked.asReadonly();

  readonly company = computed(() => (this._companies().length === 1 ? this._companies()[0] : null));
  readonly siteConfig = computed(() =>
    this._siteConfigs().length === 1 ? this._siteConfigs()[0] : null,
  );
  readonly hasAmbiguousCompany = computed(() => this._companies().length > 1);
  readonly hasAmbiguousSiteConfig = computed(() => this._siteConfigs().length > 1);
  readonly isEmpty = computed(
    () =>
      this._loaded() &&
      this._companies().length === 0 &&
      this._siteConfigs().length === 0 &&
      this._businessUnits().length === 0,
  );
  readonly error = computed<string | null>(() => {
    const messages = Object.values(this._errors()).filter(
      (message): message is string => message !== null,
    );
    return messages.length > 0 ? messages.join(' ') : null;
  });

  load(): void {
    if (this.requestInFlight) return;

    if (this.restoreTransferredState()) return;

    if (!this.canRequestOnCurrentPlatform()) {
      this._ssrBlocked.set(true);
      this._loading.set(false);
      return;
    }

    this.requestInFlight = true;
    this.pendingRequests = 3;
    this._loading.set(true);
    this._loaded.set(false);
    this._ssrBlocked.set(false);
    this._errors.set(INITIAL_ERRORS);

    this.companyApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.finishRequest()),
      )
      .subscribe({
        next: (companies) => this._companies.set(companies),
        error: () => this.setError('company', 'No pudimos cargar la información de la empresa.'),
      });

    this.siteConfigApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.finishRequest()),
      )
      .subscribe({
        next: (siteConfigs) => this._siteConfigs.set(siteConfigs),
        error: () =>
          this.setError('siteConfig', 'No pudimos cargar la configuración pública del sitio.'),
      });

    this.businessUnitApi
      .getActive()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.finishRequest()),
      )
      .subscribe({
        next: (businessUnits) => this._businessUnits.set(businessUnits),
        error: () =>
          this.setError('businessUnits', 'No pudimos cargar las unidades de negocio activas.'),
      });
  }

  private canRequestOnCurrentPlatform(): boolean {
    if (isPlatformBrowser(this.platformId)) return true;

    try {
      const url = new URL(this.apiBaseUrl);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }

  private restoreTransferredState(): boolean {
    if (!isPlatformBrowser(this.platformId) || !this.transferState.hasKey(PUBLIC_LAYOUT_STATE)) {
      return false;
    }

    const state = this.transferState.get(PUBLIC_LAYOUT_STATE, {
      companies: [],
      siteConfigs: [],
      businessUnits: [],
      errors: INITIAL_ERRORS,
    });
    this.transferState.remove(PUBLIC_LAYOUT_STATE);

    this._companies.set(state.companies);
    this._siteConfigs.set(state.siteConfigs);
    this._businessUnits.set(state.businessUnits);
    this._errors.set(state.errors);
    this._loading.set(false);
    this._loaded.set(true);
    return true;
  }

  private setError(resource: keyof PublicLayoutLoadErrors, message: string): void {
    this._errors.update((errors) => ({ ...errors, [resource]: message }));
  }

  private finishRequest(): void {
    this.pendingRequests -= 1;
    if (this.pendingRequests > 0) return;

    this.requestInFlight = false;
    this._loading.set(false);
    this._loaded.set(true);

    if (isPlatformServer(this.platformId)) {
      this.transferState.set(PUBLIC_LAYOUT_STATE, {
        companies: this._companies(),
        siteConfigs: this._siteConfigs(),
        businessUnits: this._businessUnits(),
        errors: this._errors(),
      });
    }
  }
}
