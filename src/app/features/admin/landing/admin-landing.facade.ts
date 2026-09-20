import { HttpErrorResponse } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { catchError, finalize, forkJoin, tap, EMPTY } from 'rxjs';

import { LandingSectionCreateRequest } from '../../../data/models/landing-section/landing-section-create-request.model';
import { LandingSectionResponse } from '../../../data/models/landing-section/landing-section-response.model';
import { LandingSectionUpdateRequest } from '../../../data/models/landing-section/landing-section-update-request.model';
import {
  HeroSceneRequest,
  HeroSceneResponse,
} from '../../../data/models/landing-section/hero-scene.model';
import {
  LandingActionRequest,
  LandingActionResponse,
} from '../../../data/models/landing-section/landing-action.model';
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
  readonly managedSection = signal<LandingSectionResponse | null>(null);
  readonly childKind = signal<'scene' | 'action'>('action');
  readonly childSaving = signal(false);

  load(): void {
    this.loading.set(true);
    this.clearMessages();

    forkJoin({
      sections: this.landingApi.getAll(),
      siteConfigs: this.siteConfigApi.getAll(),
    })
      .pipe(
        tap(({ sections, siteConfigs }) => {
          this.sections.set(sections);
          this.siteConfigurations.set(siteConfigs);
        }),
        catchError((err: HttpErrorResponse) => {
          this.error.set('Ocurrió un error al cargar los datos.');
          return EMPTY;
        }),
        finalize(() => this.loading.set(false)),
      )
      .subscribe();
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

    this.landingApi
      .create(request)
      .pipe(
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
        finalize(() => this.submitting.set(false)),
      )
      .subscribe();
  }

  update(request: LandingSectionUpdateRequest): void {
    const section = this.selectedSection();
    if (!section || this.submitting()) return;

    this.clearMessages();
    this.submitting.set(true);

    this.landingApi
      .update(section.id, request)
      .pipe(
        tap((updatedSection) => {
          this.sections.update((curr) =>
            curr.map((s) => (s.id === updatedSection.id ? updatedSection : s)),
          );
          this.success.set('Sección actualizada exitosamente.');
          this.formOpen.set(false);
          this.selectedSection.set(null);
        }),
        catchError((err: HttpErrorResponse) => {
          this.handleError(err);
          return EMPTY;
        }),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe();
  }

  changeVisibility(section: LandingSectionResponse, visible: boolean): void {
    if (this.changingVisibilityId()) return;

    this.clearMessages();
    this.changingVisibilityId.set(section.id);

    this.landingApi
      .changeVisibility(section.id, { visible })
      .pipe(
        tap((updatedSection) => {
          this.sections.update((curr) =>
            curr.map((s) => (s.id === updatedSection.id ? updatedSection : s)),
          );
        }),
        catchError((err: HttpErrorResponse) => {
          this.error.set('No se pudo cambiar la visibilidad de la sección.');
          return EMPTY;
        }),
        finalize(() => this.changingVisibilityId.set(null)),
      )
      .subscribe();
  }

  openChildren(section: LandingSectionResponse, kind: 'scene' | 'action'): void {
    this.clearMessages();
    this.managedSection.set(section);
    this.childKind.set(kind);
  }

  closeChildren(): void {
    if (!this.childSaving()) this.managedSection.set(null);
  }

  saveScene(request: HeroSceneRequest, sceneId: string | null): void {
    const section = this.managedSection();
    if (!section || this.childSaving()) return;
    this.childSaving.set(true);
    this.clearMessages();
    const operation = sceneId
      ? this.landingApi.updateScene(section.id, sceneId, request)
      : this.landingApi.createScene(section.id, request);
    operation
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.handleError(err);
          return EMPTY;
        }),
        finalize(() => this.childSaving.set(false)),
      )
      .subscribe((scene) =>
        this.updateManaged(section, 'escenas', this.upsert(section.escenas, scene)),
      );
  }

  deleteScene(sceneId: string): void {
    const section = this.managedSection();
    if (!section || this.childSaving()) return;
    this.childSaving.set(true);
    this.landingApi
      .deleteScene(section.id, sceneId)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.handleError(err);
          return EMPTY;
        }),
        finalize(() => this.childSaving.set(false)),
      )
      .subscribe(() =>
        this.updateManaged(
          section,
          'escenas',
          section.escenas.filter((item) => item.id !== sceneId),
        ),
      );
  }

  saveAction(request: LandingActionRequest, actionId: string | null): void {
    const section = this.managedSection();
    if (!section || this.childSaving()) return;
    this.childSaving.set(true);
    this.clearMessages();
    const operation = actionId
      ? this.landingApi.updateAction(section.id, actionId, request)
      : this.landingApi.createAction(section.id, request);
    operation
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.handleError(err);
          return EMPTY;
        }),
        finalize(() => this.childSaving.set(false)),
      )
      .subscribe((action) =>
        this.updateManaged(section, 'acciones', this.upsert(section.acciones, action)),
      );
  }

  deleteAction(actionId: string): void {
    const section = this.managedSection();
    if (!section || this.childSaving()) return;
    this.childSaving.set(true);
    this.landingApi
      .deleteAction(section.id, actionId)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          this.handleError(err);
          return EMPTY;
        }),
        finalize(() => this.childSaving.set(false)),
      )
      .subscribe(() =>
        this.updateManaged(
          section,
          'acciones',
          section.acciones.filter((item) => item.id !== actionId),
        ),
      );
  }

  private upsert<T extends HeroSceneResponse | LandingActionResponse>(
    items: readonly T[],
    item: T,
  ): T[] {
    return [
      ...(items.some((value) => value.id === item.id)
        ? items.map((value) => (value.id === item.id ? item : value))
        : [...items, item]),
    ].sort((a, b) => a.orden - b.orden);
  }

  private updateManaged<K extends 'escenas' | 'acciones'>(
    section: LandingSectionResponse,
    key: K,
    items: LandingSectionResponse[K],
  ): void {
    const updated = { ...section, [key]: items };
    this.sections.update((all) => all.map((item) => (item.id === updated.id ? updated : item)));
    this.managedSection.set(updated);
    this.success.set('Contenido de la sección actualizado.');
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
