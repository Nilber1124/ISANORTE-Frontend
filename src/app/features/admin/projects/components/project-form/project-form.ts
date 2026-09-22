import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

import { ProjectCreateRequest } from '../../../../../data/models/project/project-create-request.model';
import { ProjectResponse } from '../../../../../data/models/project/project-response.model';
import { ProjectUpdateRequest } from '../../../../../data/models/project/project-update-request.model';
import { ServiceResponse } from '../../../../../data/models/service/service-response.model';
import { Alert } from '../../../../../shared/components/alert/alert';
import { Button } from '../../../../../shared/components/button/button';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Modal } from '../../../../../shared/components/modal/modal';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';
import { ProjectFormMode } from '../../admin-projects.facade';

export type ProjectFormSubmission =
  | { mode: 'create'; request: ProjectCreateRequest }
  | { mode: 'edit'; request: ProjectUpdateRequest };

interface ProjectFormErrors {
  nombre?: string;
  slug?: string;
  descripcion?: string;
}

@Component({
  selector: 'app-project-form',
  imports: [Alert, Button, InputField, Modal, TextareaField],
  templateUrl: './project-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectForm implements OnInit {
  readonly mode = input.required<ProjectFormMode>();
  readonly project = input<ProjectResponse | null>(null);
  readonly services = input.required<readonly ServiceResponse[]>();
  readonly loadingFormData = input(false);
  readonly submitting = input(false);
  readonly serverError = input<string | null>(null);

  readonly canceled = output<void>();
  readonly saved = output<ProjectFormSubmission>();

  readonly nombre = signal('');
  readonly slug = signal('');
  readonly cliente = signal('');
  readonly ubicacion = signal('');
  readonly fechaProyecto = signal('');
  readonly descripcion = signal('');
  readonly imagenUrl = signal('');
  readonly imagenAlt = signal('');
  readonly previewFailed = signal(false);
  readonly orden = signal('0');
  readonly destacado = signal(false);
  readonly activo = signal(true);
  readonly servicioIds = signal<readonly string[]>([]);
  readonly submitted = signal(false);
  readonly errors = computed<ProjectFormErrors>(() => this.validationErrors());

  ngOnInit(): void {
    const project = this.project();
    if (project === null) return;
    this.nombre.set(project.nombre);
    this.slug.set(project.slug);
    this.cliente.set(project.cliente ?? '');
    this.ubicacion.set(project.ubicacion ?? '');
    this.fechaProyecto.set(project.fechaProyecto ?? '');
    this.descripcion.set(project.descripcion);
    this.imagenUrl.set(project.imagenUrl ?? '');
    this.imagenAlt.set(project.imagenAlt ?? '');
    this.previewFailed.set(false);
    this.orden.set(String(project.orden));
    this.destacado.set(project.destacado === true);
    this.activo.set(project.activo === true);
    this.servicioIds.set(project.servicios?.map((service) => service.id) ?? []);
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.hasErrors() || this.submitting()) return;

    const common = {
      nombre: this.nombre().trim(),
      slug: this.slug().trim(),
      cliente: this.optionalValue(this.cliente()),
      ubicacion: this.optionalValue(this.ubicacion()),
      fechaProyecto: this.optionalValue(this.fechaProyecto()),
      descripcion: this.descripcion().trim(),
      imagenUrl: this.optionalValue(this.imagenUrl()),
      imagenAlt: this.optionalValue(this.imagenAlt()),
      orden: Number(this.orden()),
      destacado: this.destacado(),
      activo: this.activo(),
      servicioIds: [...this.servicioIds()],
    };

    this.saved.emit(
      this.mode() === 'create'
        ? { mode: 'create', request: common }
        : { mode: 'edit', request: common },
    );
  }

  protected generateSlug(): void {
    const s = this.nombre()
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    if (s) this.slug.set(s);
  }

  protected updateImageUrl(value: string): void {
    this.imagenUrl.set(value);
    this.previewFailed.set(false);
  }

  protected markPreviewFailed(): void {
    this.previewFailed.set(true);
  }

  protected updateFeatured(event: Event): void {
    this.destacado.set((event.target as HTMLInputElement).checked);
  }

  protected updateActive(event: Event): void {
    this.activo.set((event.target as HTMLInputElement).checked);
  }

  protected updateService(serviceId: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.servicioIds.update((ids) =>
      checked ? [...ids, serviceId] : ids.filter((id) => id !== serviceId),
    );
  }

  protected serviceSelected(serviceId: string): boolean {
    return this.servicioIds().includes(serviceId);
  }

  private validationErrors(): ProjectFormErrors {
    if (!this.submitted()) return {};
    return {
      nombre: this.nombre().trim() ? undefined : 'Ingresa el nombre del proyecto.',
      slug: this.slug().trim() ? undefined : 'Ingresa el slug del proyecto.',
      descripcion: this.descripcion().trim() ? undefined : 'Ingresa la descripción del proyecto.',
    };
  }

  private hasErrors(): boolean {
    return Object.values(this.validationErrors()).some(Boolean);
  }

  private optionalValue(value: string): string | null {
    return value.trim() || null;
  }
}
