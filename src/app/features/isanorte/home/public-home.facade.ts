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

import { API_BASE_URL } from '../../../core/config/api.config';
import { BusinessUnitResponse } from '../../../data/models/business-unit/business-unit-response.model';
import { LandingSectionResponse } from '../../../data/models/landing-section/landing-section-response.model';
import { LandingSectionType } from '../../../data/models/landing-section/landing-section-type.enum';
import { ProjectResponse } from '../../../data/models/project/project-response.model';
import { ServiceResponse } from '../../../data/models/service/service-response.model';
import { BusinessUnitApiService } from '../../../data/services/business-unit-api.service';
import { LandingSectionApiService } from '../../../data/services/landing-section-api.service';
import { ProjectApiService } from '../../../data/services/project-api.service';
import { ServiceApiService } from '../../../data/services/service-api.service';

export interface PublicHomeLoadErrors {
  sections: string | null;
  services: string | null;
  projects: string | null;
  businessUnits: string | null;
}

export type PublicHomeResourceState = 'idle' | 'loading' | 'success' | 'error' | 'ssr-blocked';

const HOME_COLLECTION_LIMIT = 3;

const INITIAL_ERRORS: PublicHomeLoadErrors = {
  sections: null,
  services: null,
  projects: null,
  businessUnits: null,
};

interface PublicHomeTransferState {
  sections: readonly LandingSectionResponse[];
  services: readonly ServiceResponse[];
  projects: readonly ProjectResponse[];
  businessUnits: readonly BusinessUnitResponse[];
  errors: PublicHomeLoadErrors;
  sectionsState: PublicHomeResourceState;
  servicesState: PublicHomeResourceState;
  projectsState: PublicHomeResourceState;
  businessUnitsState: PublicHomeResourceState;
  ssrBlocked: boolean;
}

const PUBLIC_HOME_STATE = makeStateKey<PublicHomeTransferState>('public-home');

@Injectable()
export class PublicHomeFacade {
  private readonly landingSectionApi = inject(LandingSectionApiService);
  private readonly serviceApi = inject(ServiceApiService);
  private readonly projectApi = inject(ProjectApiService);
  private readonly businessUnitApi = inject(BusinessUnitApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly transferState = inject(TransferState);

  private readonly _sections = signal<readonly LandingSectionResponse[]>([]);
  private readonly _services = signal<readonly ServiceResponse[]>([]);
  private readonly _projects = signal<readonly ProjectResponse[]>([]);
  private readonly _businessUnits = signal<readonly BusinessUnitResponse[]>([]);
  private readonly _loading = signal(true);
  private readonly _loaded = signal(false);
  private readonly _errors = signal<PublicHomeLoadErrors>(INITIAL_ERRORS);
  private readonly _ssrBlocked = signal(false);
  private readonly _sectionsState = signal<PublicHomeResourceState>('idle');
  private readonly _servicesState = signal<PublicHomeResourceState>('idle');
  private readonly _projectsState = signal<PublicHomeResourceState>('idle');
  private readonly _businessUnitsState = signal<PublicHomeResourceState>('idle');

  private pendingRequests = 0;
  private requestInFlight = false;

  readonly sections = this._sections.asReadonly();
  readonly services = this._services.asReadonly();
  readonly projects = this._projects.asReadonly();
  readonly businessUnits = this._businessUnits.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly loaded = this._loaded.asReadonly();
  readonly errors = this._errors.asReadonly();
  readonly ssrBlocked = this._ssrBlocked.asReadonly();
  readonly sectionsState = this._sectionsState.asReadonly();
  readonly servicesState = this._servicesState.asReadonly();
  readonly projectsState = this._projectsState.asReadonly();
  readonly businessUnitsState = this._businessUnitsState.asReadonly();

  readonly heroSection = computed(() => this.findSection(LandingSectionType.HERO));
  readonly companySection = computed(() => this.findSection(LandingSectionType.EMPRESA));
  readonly servicesSection = computed(() => this.findSection(LandingSectionType.SERVICIOS));
  readonly projectsSection = computed(() => this.findSection(LandingSectionType.PROYECTOS));
  readonly contactSection = computed(() => this.findSection(LandingSectionType.CONTACTO));
  readonly ctaSection = computed(() => this.findSection(LandingSectionType.CTA));
  readonly customSections = computed(() =>
    this._sections().filter((section) => section.tipo === LandingSectionType.PERSONALIZADA),
  );
  readonly featuredServices = computed(() =>
    this._services().filter((service) => service.destacado === true),
  );
  readonly featuredProjects = computed(() =>
    this._projects().filter((project) => project.destacado === true),
  );
  readonly homeServices = computed(() => {
    const featured = this.featuredServices();
    return (featured.length > 0 ? featured : this._services()).slice(0, HOME_COLLECTION_LIMIT);
  });
  readonly homeProjects = computed(() => {
    const featured = this.featuredProjects();
    return (featured.length > 0 ? featured : this._projects()).slice(0, HOME_COLLECTION_LIMIT);
  });
  readonly isEmpty = computed(
    () =>
      this._loaded() &&
      this._sections().length === 0 &&
      this._services().length === 0 &&
      this._projects().length === 0 &&
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

    const restoredState = this.restoreTransferredState();
    if (restoredState && !this._ssrBlocked()) return;

    if (!this.canRequestOnCurrentPlatform()) {
      this.markSsrBlocked();
      this.writeTransferState();
      return;
    }

    const preservesSsrFallback = restoredState && this._ssrBlocked();
    this.requestInFlight = true;
    this.pendingRequests = 4;
    this._loading.set(true);
    this._loaded.set(false);
    this._errors.set(INITIAL_ERRORS);

    if (!preservesSsrFallback) {
      this._sectionsState.set('loading');
      this._servicesState.set('loading');
      this._projectsState.set('loading');
      this._businessUnitsState.set('loading');
    }

    this.landingSectionApi
      .getVisible()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.finishRequest()),
      )
      .subscribe({
        next: (sections) => {
          this._sections.set(sections);
          this._sectionsState.set('success');
        },
        error: () => {
          this._sectionsState.set('error');
          this.setError('sections', 'No pudimos cargar las secciones públicas.');
        },
      });

    this.serviceApi
      .getActive()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.finishRequest()),
      )
      .subscribe({
        next: (services) => {
          this._services.set(services);
          this._servicesState.set('success');
        },
        error: () => {
          this._servicesState.set('error');
          this.setError('services', 'No pudimos cargar los servicios activos.');
        },
      });

    this.projectApi
      .getActive()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.finishRequest()),
      )
      .subscribe({
        next: (projects) => {
          this._projects.set(projects);
          this._projectsState.set('success');
        },
        error: () => {
          this._projectsState.set('error');
          this.setError('projects', 'No pudimos cargar los proyectos activos.');
        },
      });

    this.businessUnitApi
      .getActive()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.finishRequest()),
      )
      .subscribe({
        next: (businessUnits) => {
          this._businessUnits.set(businessUnits);
          this._businessUnitsState.set('success');
        },
        error: () => {
          this._businessUnitsState.set('error');
          this.setError('businessUnits', 'No pudimos cargar las unidades de negocio activas.');
        },
      });
  }

  projectImage(project: ProjectResponse): string | null {
    const orderedImages = [...(project.imagenes ?? [])]
      .filter((image) => image.url.trim().length > 0)
      .sort(
        (first, second) =>
          (first.orden ?? Number.MAX_SAFE_INTEGER) - (second.orden ?? Number.MAX_SAFE_INTEGER),
      );

    return (
      orderedImages.find((image) => image.esPrincipal === true)?.url ??
      orderedImages[0]?.url ??
      null
    );
  }

  private findSection(type: LandingSectionType): LandingSectionResponse | null {
    return this._sections().find((section) => section.tipo === type) ?? null;
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
    if (!isPlatformBrowser(this.platformId) || !this.transferState.hasKey(PUBLIC_HOME_STATE)) {
      return false;
    }

    const state = this.transferState.get(PUBLIC_HOME_STATE, {
      sections: [],
      services: [],
      projects: [],
      businessUnits: [],
      errors: INITIAL_ERRORS,
      sectionsState: 'idle',
      servicesState: 'idle',
      projectsState: 'idle',
      businessUnitsState: 'idle',
      ssrBlocked: false,
    });
    this.transferState.remove(PUBLIC_HOME_STATE);

    this._sections.set(state.sections);
    this._services.set(state.services);
    this._projects.set(state.projects);
    this._businessUnits.set(state.businessUnits);
    this._errors.set(state.errors);
    this._sectionsState.set(state.sectionsState);
    this._servicesState.set(state.servicesState);
    this._projectsState.set(state.projectsState);
    this._businessUnitsState.set(state.businessUnitsState);
    this._ssrBlocked.set(state.ssrBlocked);
    this._loading.set(state.ssrBlocked);
    this._loaded.set(!state.ssrBlocked);
    return true;
  }

  private markSsrBlocked(): void {
    this._ssrBlocked.set(true);
    this._sectionsState.set('ssr-blocked');
    this._servicesState.set('ssr-blocked');
    this._projectsState.set('ssr-blocked');
    this._businessUnitsState.set('ssr-blocked');
    this._loading.set(false);
    this._loaded.set(false);
  }

  private setError(resource: keyof PublicHomeLoadErrors, message: string): void {
    this._errors.update((errors) => ({ ...errors, [resource]: message }));
  }

  private finishRequest(): void {
    this.pendingRequests -= 1;
    if (this.pendingRequests > 0) return;

    this.requestInFlight = false;
    this._ssrBlocked.set(false);
    this._loading.set(false);
    this._loaded.set(true);

    this.writeTransferState();
  }

  private writeTransferState(): void {
    if (!isPlatformServer(this.platformId)) return;

    this.transferState.set(PUBLIC_HOME_STATE, {
      sections: this._sections(),
      services: this._services(),
      projects: this._projects(),
      businessUnits: this._businessUnits(),
      errors: this._errors(),
      sectionsState: this._sectionsState(),
      servicesState: this._servicesState(),
      projectsState: this._projectsState(),
      businessUnitsState: this._businessUnitsState(),
      ssrBlocked: this._ssrBlocked(),
    });
  }
}
