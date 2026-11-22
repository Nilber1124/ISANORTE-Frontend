import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { ToastService } from '../../../../../core/services/toast.service';
import { ProjectResponse } from '../../../../../data/models/project/project-response.model';
import { ServiceResponse } from '../../../../../data/models/service/service-response.model';
import { trimTrailingSlashes } from '../../../../../shared/utils/text';
import { ProjectForm, ProjectFormSubmission } from '../../../projects/components/project-form/project-form';

/**
 * Formulario completo de un proyecto (el de `/admin/proyectos`, con sus pestañas) sobre la vista previa:
 * sirve para crear un proyecto nuevo o editarlo entero sin salir de la página.
 */
@Component({
  selector: 'app-project-full-editor',
  imports: [ProjectForm],
  template: `
    @if (ready()) {
      <app-project-form
        [mode]="isNew() ? 'create' : 'edit'"
        [project]="project()"
        [services]="services()"
        [defaultOrder]="nextOrder()"
        [submitting]="saving()"
        [serverError]="error()"
        (canceled)="closed.emit()"
        (saved)="save($event)"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectFullEditor {
  /** `'new'` para crear. */
  readonly projectId = input.required<string>();

  readonly saved = output<void>();
  readonly closed = output<void>();

  private readonly http = inject(HttpClient);
  private readonly url = `${trimTrailingSlashes(inject(API_BASE_URL))}/api/proyectos`;
  private readonly servicesUrl = `${trimTrailingSlashes(inject(API_BASE_URL))}/api/servicios`;
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly isNew = computed(() => this.projectId() === 'new');
  protected readonly project = signal<ProjectResponse | null>(null);
  protected readonly services = signal<readonly ServiceResponse[]>([]);
  protected readonly nextOrder = signal(0);
  protected readonly ready = signal(false);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  constructor() {
    effect(() => {
      const id = this.projectId();
      untracked(() => this.load(id));
    });
  }

  private load(id: string): void {
    this.ready.set(false);
    this.error.set(null);
    forkJoin({
      projects: this.http.get<ProjectResponse[]>(this.url),
      services: this.http.get<ServiceResponse[]>(this.servicesUrl),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ projects, services }) => {
          this.services.set(services);
          this.nextOrder.set(projects.reduce((max, p) => Math.max(max, p.orden ?? -1), -1) + 1);
          const found = id === 'new' ? null : (projects.find((p) => p.id === id) ?? null);
          this.project.set(found);
          if (id !== 'new' && !found) {
            this.toast.show('No se encontró el proyecto.', 'error');
            this.closed.emit();
            return;
          }
          this.ready.set(true);
        },
        error: () => {
          this.toast.show('No se pudo cargar el proyecto.', 'error');
          this.closed.emit();
        },
      });
  }

  protected save(submission: ProjectFormSubmission): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    const current = this.project();
    const request =
      submission.mode === 'create'
        ? this.http.post(this.url, submission.request)
        : this.http.put(`${this.url}/${encodeURIComponent(current?.id ?? '')}`, submission.request);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.show(submission.mode === 'create' ? 'Proyecto creado.' : 'Proyecto actualizado.', 'success');
        this.saved.emit();
        this.closed.emit();
      },
      error: (e) => {
        this.saving.set(false);
        const reason = (e as { error?: { message?: string } })?.error?.message;
        this.error.set(reason ?? 'No se pudo guardar el proyecto.');
      },
    });
  }
}
