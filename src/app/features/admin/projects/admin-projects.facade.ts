import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { ProjectCreateRequest } from '../../../data/models/project/project-create-request.model';
import { ProjectResponse } from '../../../data/models/project/project-response.model';
import { ProjectUpdateRequest } from '../../../data/models/project/project-update-request.model';
import { ServiceResponse } from '../../../data/models/service/service-response.model';
import { ProjectApiService } from '../../../data/services/project-api.service';
import { ServiceApiService } from '../../../data/services/service-api.service';

export type ProjectFormMode = 'create' | 'edit';

@Injectable()
export class AdminProjectsFacade {
  private readonly projectApi = inject(ProjectApiService);
  private readonly serviceApi = inject(ServiceApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _projects = signal<readonly ProjectResponse[]>([]);
  private readonly _services = signal<readonly ServiceResponse[]>([]);
  private readonly _loading = signal(true);
  private readonly _loadingFormData = signal(true);
  private readonly _submitting = signal(false);
  private readonly _changingActiveId = signal<string | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _success = signal<string | null>(null);
  private readonly _selectedProject = signal<ProjectResponse | null>(null);
  private readonly _formMode = signal<ProjectFormMode>('create');
  private readonly _formOpen = signal(false);

  readonly projects = this._projects.asReadonly();
  readonly services = this._services.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly loadingFormData = this._loadingFormData.asReadonly();
  readonly submitting = this._submitting.asReadonly();
  readonly changingActiveId = this._changingActiveId.asReadonly();
  readonly error = this._error.asReadonly();
  readonly success = this._success.asReadonly();
  readonly selectedProject = this._selectedProject.asReadonly();
  readonly formMode = this._formMode.asReadonly();
  readonly formOpen = this._formOpen.asReadonly();

  load(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    this.loadProjects();
    this.loadServices();
  }

  openCreate(): void {
    this._selectedProject.set(null);
    this._formMode.set('create');
    this._error.set(null);
    this._success.set(null);
    this._formOpen.set(true);
  }

  openEdit(project: ProjectResponse): void {
    this._selectedProject.set(project);
    this._formMode.set('edit');
    this._error.set(null);
    this._success.set(null);
    this._formOpen.set(true);
  }

  closeForm(): void {
    if (this._submitting()) return;
    this._formOpen.set(false);
    this._selectedProject.set(null);
    this._error.set(null);
  }

  create(request: ProjectCreateRequest): void {
    if (this._submitting()) return;
    this._submitting.set(true);
    this._error.set(null);
    this._success.set(null);

    this.projectApi
      .create(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._submitting.set(false)),
      )
      .subscribe({
        next: (project) => {
          this.upsertProject(project);
          this._success.set('Proyecto creado correctamente. Ya puedes gestionar sus imágenes.');
          this._formOpen.set(false);
          this._selectedProject.set(null);
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  update(request: ProjectUpdateRequest): void {
    const project = this._selectedProject();
    if (project === null || this._submitting()) return;
    this._submitting.set(true);
    this._error.set(null);
    this._success.set(null);

    this.projectApi
      .update(project.id, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._submitting.set(false)),
      )
      .subscribe({
        next: (updatedProject) => {
          this.upsertProject(updatedProject);
          this._success.set('Proyecto actualizado correctamente.');
          this._formOpen.set(false);
          this._selectedProject.set(null);
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  changeActive(project: ProjectResponse): void {
    if (this._changingActiveId() !== null || this._submitting()) return;
    this._changingActiveId.set(project.id);
    this._error.set(null);
    this._success.set(null);

    this.projectApi
      .changeActive(project.id, { activo: project.activo !== true })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._changingActiveId.set(null)),
      )
      .subscribe({
        next: (updatedProject) => {
          this.upsertProject(updatedProject);
          this._success.set(
            updatedProject.activo === true
              ? 'Proyecto activado correctamente.'
              : 'Proyecto desactivado correctamente.',
          );
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  clearFeedback(): void {
    this._error.set(null);
    this._success.set(null);
  }

  private loadProjects(): void {
    this._loading.set(true);
    this._error.set(null);
    this.projectApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (projects) => this._projects.set(this.sortProjects(projects)),
        error: () =>
          this._error.set(
            'No pudimos cargar los proyectos. Comprueba tu conexión e inténtalo nuevamente.',
          ),
      });
  }

  private loadServices(): void {
    this._loadingFormData.set(true);
    this.serviceApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loadingFormData.set(false)),
      )
      .subscribe({
        next: (services) => this._services.set(services),
        error: () =>
          this._error.set('Los proyectos se cargaron, pero no pudimos obtener los servicios.'),
      });
  }

  private upsertProject(project: ProjectResponse): void {
    const projects = this._projects();
    const exists = projects.some((item) => item.id === project.id);
    const next = exists
      ? projects.map((item) => (item.id === project.id ? project : item))
      : [...projects, project];
    this._projects.set(this.sortProjects(next));
  }

  private sortProjects(projects: readonly ProjectResponse[]): ProjectResponse[] {
    return [...projects].sort((first, second) => first.nombre.localeCompare(second.nombre));
  }

  private mutationErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) return 'Revisa los datos ingresados e inténtalo nuevamente.';
      if (error.status === 404) return 'El proyecto o alguno de sus servicios ya no existe.';
      if (error.status === 409) return 'Ya existe un proyecto con ese slug o hay un conflicto.';
    }
    return 'No pudimos guardar el cambio. Comprueba tu conexión e inténtalo nuevamente.';
  }
}
