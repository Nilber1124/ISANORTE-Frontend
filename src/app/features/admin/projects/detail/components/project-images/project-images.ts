import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';

import { ProjectImageRequest } from '../../../../../../data/models/project/project-image-request.model';
import { ProjectImageType } from '../../../../../../data/models/project/project-image-type.enum';
import { ProjectImageResponse } from '../../../../../../data/models/project/project-response.model';
import { Alert } from '../../../../../../shared/components/alert/alert';
import { Badge } from '../../../../../../shared/components/badge/badge';
import { Button } from '../../../../../../shared/components/button/button';
import { EmptyState } from '../../../../../../shared/components/empty-state/empty-state';
import { InputField } from '../../../../../../shared/components/input-field/input-field';
import { Modal } from '../../../../../../shared/components/modal/modal';
import {
  SelectField,
  SelectOption,
} from '../../../../../../shared/components/select-field/select-field';
import { TextareaField } from '../../../../../../shared/components/textarea-field/textarea-field';

export interface ProjectImageSubmission {
  imageId: string | null;
  request: ProjectImageRequest;
}

interface ImageFormErrors {
  url?: string;
  orden?: string;
}

@Component({
  selector: 'app-project-images',
  imports: [Alert, Badge, Button, EmptyState, InputField, Modal, SelectField, TextareaField],
  templateUrl: './project-images.html',
  styleUrl: './project-images.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectImages {
  readonly images = input<readonly ProjectImageResponse[]>([]);
  readonly saving = input(false);
  readonly deletingImageId = input<string | null>(null);
  readonly serverError = input<string | null>(null);
  readonly success = input<string | null>(null);

  readonly saved = output<ProjectImageSubmission>();
  readonly deleted = output<string>();
  readonly feedbackCleared = output<void>();

  readonly formOpen = signal(false);
  readonly editingImageId = signal<string | null>(null);
  readonly imageToDelete = signal<ProjectImageResponse | null>(null);
  readonly url = signal('');
  readonly titulo = signal('');
  readonly descripcion = signal('');
  readonly tipo = signal<ProjectImageType>(ProjectImageType.GENERAL);
  readonly esPrincipal = signal(false);
  readonly orden = signal('0');
  readonly submitted = signal(false);
  readonly failedPreviews = signal<ReadonlySet<string>>(new Set());
  readonly errors = computed<ImageFormErrors>(() => this.validationErrors());

  readonly typeOptions: readonly SelectOption[] = [
    { value: ProjectImageType.GENERAL, label: 'General' },
    { value: ProjectImageType.ANTES, label: 'Antes' },
    { value: ProjectImageType.DESPUES, label: 'Después' },
  ];

  protected openCreate(): void {
    this.feedbackCleared.emit();
    this.editingImageId.set(null);
    this.url.set('');
    this.titulo.set('');
    this.descripcion.set('');
    this.tipo.set(ProjectImageType.GENERAL);
    this.esPrincipal.set(false);
    this.orden.set('0');
    this.submitted.set(false);
    this.formOpen.set(true);
  }

  protected openEdit(image: ProjectImageResponse): void {
    this.feedbackCleared.emit();
    this.editingImageId.set(image.id);
    this.url.set(image.url);
    this.titulo.set(image.titulo ?? '');
    this.descripcion.set(image.descripcion ?? '');
    this.tipo.set(image.tipo);
    this.esPrincipal.set(image.esPrincipal === true);
    this.orden.set(String(image.orden ?? 0));
    this.submitted.set(false);
    this.formOpen.set(true);
  }

  protected closeForm(): void {
    if (this.saving()) return;
    this.formOpen.set(false);
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.hasErrors() || this.saving()) return;
    this.saved.emit({
      imageId: this.editingImageId(),
      request: {
        url: this.url().trim(),
        titulo: this.optionalValue(this.titulo()),
        descripcion: this.optionalValue(this.descripcion()),
        tipo: this.tipo(),
        esPrincipal: this.esPrincipal(),
        orden: Number(this.orden()),
      },
    });
  }

  protected updateType(value: string): void {
    this.tipo.set(value as ProjectImageType);
  }

  protected updateUrl(value: string): void {
    this.url.set(value);
    this.failedPreviews.update((keys) => {
      const next = new Set(keys);
      next.delete('draft');
      return next;
    });
  }

  protected updatePrincipal(event: Event): void {
    this.esPrincipal.set((event.target as HTMLInputElement).checked);
  }

  protected requestDelete(image: ProjectImageResponse): void {
    this.feedbackCleared.emit();
    this.imageToDelete.set(image);
  }

  protected confirmDelete(): void {
    const image = this.imageToDelete();
    if (image === null || this.deletingImageId() !== null) return;
    this.deleted.emit(image.id);
    this.imageToDelete.set(null);
  }

  protected closeDelete(): void {
    if (this.deletingImageId() !== null) return;
    this.imageToDelete.set(null);
  }

  protected markPreviewFailed(key: string): void {
    this.failedPreviews.update((keys) => new Set([...keys, key]));
  }

  protected previewFailed(key: string): boolean {
    return this.failedPreviews().has(key);
  }

  protected typeLabel(type: ProjectImageType): string {
    return {
      [ProjectImageType.GENERAL]: 'General',
      [ProjectImageType.ANTES]: 'Antes',
      [ProjectImageType.DESPUES]: 'Después',
    }[type];
  }

  private validationErrors(): ImageFormErrors {
    if (!this.submitted()) return {};
    const order = Number(this.orden());
    return {
      url: this.url().trim() ? undefined : 'Ingresa la URL de la imagen.',
      orden:
        this.orden().trim() !== '' && Number.isFinite(order) && Number.isInteger(order)
          ? undefined
          : 'Ingresa un número entero.',
    };
  }

  private hasErrors(): boolean {
    return Object.values(this.validationErrors()).some(Boolean);
  }

  private optionalValue(value: string): string | null {
    return value.trim() || null;
  }
}
