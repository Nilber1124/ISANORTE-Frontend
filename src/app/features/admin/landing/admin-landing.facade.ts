import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, finalize, forkJoin, tap, EMPTY } from 'rxjs';

import { LandingSectionCreateRequest } from '../../../data/models/landing-section/landing-section-create-request.model';
import { LandingSectionResponse } from '../../../data/models/landing-section/landing-section-response.model';
import { LandingSectionUpdateRequest } from '../../../data/models/landing-section/landing-section-update-request.model';
import { SiteConfigResponse } from '../../../data/models/site-config/site-config-response.model';
import { LandingSectionApiService } from '../../../data/services/landing-section-api.service';
import { SiteConfigApiService } from '../../../data/services/site-config-api.service';

export type LandingFormMode = 'create' | 'edit';

@Injectable()
export class AdminLandingFacade {
  private readonly landingApi = inject(LandingSectionApiService);
  private readonly siteConfigApi = inject(SiteConfigApiService);

  readonly sections = signal<LandingSectionResponse[]>([]);
  readonly siteConfigurations = signal<SiteConfigResponse[]>([]);
  
  readonly loading = signal<boolean>(true);
  readonly submitting = signal<boolean>(false);
  readonly changingVisibilityId = signal<string | null>(null);
  
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  
  readonly selectedSection = signal<LandingSectionResponse | null>(null);
  readonly formMode = signal<LandingFormMode>('create');
  readonly formOpen = signal<boolean>(false);

  load(): void {
    this.loading.set(true);
    this.clearMessages();
    
    forkJoin({
      sections: this.landingApi.getAll(),
      siteConfigs: this.siteConfigApi.getAll()
    }).pipe(
      tap(({ sections, siteConfigs }) => {
        this.sections.set(sections);
        this.siteConfigurations.set(siteConfigs);
      }),
      catchError((err: HttpErrorResponse) => {
        this.error.set('Ocurrió un error al cargar los datos.');
        return EMPTY;
      }),
      finalize(() => this.loading.set(false))
    ).subscribe();
  }

  openCreate(): void {
    if (this.siteConfigurations().length === 0) {
      return;
    }
    this.clearMessages();
    this.selectedSection.set(null);
    this.formMode.set('create');
    this.formOpen.set(true);
  }

  openEdit(section: LandingSectionResponse): void {
    this.clearMessages();
    this.selectedSection.set(section);
    this.formMode.set('edit');
    this.formOpen.set(true);
  }

  closeForm(): void {
    if (this.submitting()) return;
    this.formOpen.set(false);
    this.selectedSection.set(null);
  }

  create(request: LandingSectionCreateRequest): void {
    if (this.submitting()) return;
    this.clearMessages();
    this.submitting.set(true);

    this.landingApi.create(request).pipe(
      tap((newSection) => {
        this.sections.update((curr) => [...curr, newSection]);
        this.success.set('Sección creada exitosamente.');
        this.formOpen.set(false);
        this.selectedSection.set(null);
      }),
      catchError((err: HttpErrorResponse) => {
        this.handleError(err);
        return EMPTY;
      }),
      finalize(() => this.submitting.set(false))
    ).subscribe();
  }

  update(request: LandingSectionUpdateRequest): void {
    const section = this.selectedSection();
    if (!section || this.submitting()) return;

    this.clearMessages();
    this.submitting.set(true);

    this.landingApi.update(section.id, request).pipe(
      tap((updatedSection) => {
        this.sections.update((curr) =>
          curr.map((s) => (s.id === updatedSection.id ? updatedSection : s))
        );
        this.success.set('Sección actualizada exitosamente.');
        this.formOpen.set(false);
        this.selectedSection.set(null);
      }),
      catchError((err: HttpErrorResponse) => {
        this.handleError(err);
        return EMPTY;
      }),
      finalize(() => this.submitting.set(false))
    ).subscribe();
  }

  changeVisibility(section: LandingSectionResponse, visible: boolean): void {
    if (this.changingVisibilityId()) return;
    
    this.clearMessages();
    this.changingVisibilityId.set(section.id);

    this.landingApi.changeVisibility(section.id, { visible }).pipe(
      tap((updatedSection) => {
        this.sections.update((curr) =>
          curr.map((s) => (s.id === updatedSection.id ? updatedSection : s))
        );
      }),
      catchError((err: HttpErrorResponse) => {
        this.error.set('No se pudo cambiar la visibilidad de la sección.');
        return EMPTY;
      }),
      finalize(() => this.changingVisibilityId.set(null))
    ).subscribe();
  }

  private handleError(err: HttpErrorResponse): void {
    if (err.status === 400) {
      this.error.set('Revisa los datos ingresados e inténtalo nuevamente.');
    } else if (err.status === 404) {
      this.error.set('La sección o configuración solicitada ya no existe.');
    } else if (err.status === 409) {
      this.error.set('No se pudo guardar porque existe un conflicto de integridad.');
    } else {
      this.error.set('Ocurrió un error inesperado al guardar.');
    }
  }

  private clearMessages(): void {
    this.error.set(null);
    this.success.set(null);
  }
}
