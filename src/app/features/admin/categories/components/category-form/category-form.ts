import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

import { BusinessUnitResponse } from '../../../../../data/models/business-unit/business-unit-response.model';
import { CategoryCreateRequest } from '../../../../../data/models/category/category-create-request.model';
import { CategoryResponse } from '../../../../../data/models/category/category-response.model';
import { CategoryUpdateRequest } from '../../../../../data/models/category/category-update-request.model';
import { Alert } from '../../../../../shared/components/alert/alert';
import { Button } from '../../../../../shared/components/button/button';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Modal } from '../../../../../shared/components/modal/modal';
import {
  SelectField,
  SelectOption,
} from '../../../../../shared/components/select-field/select-field';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';
import { CategoryFormMode } from '../../admin-categories.facade';

export type CategoryFormSubmission =
  | { mode: 'create'; request: CategoryCreateRequest }
  | { mode: 'edit'; request: CategoryUpdateRequest };

interface CategoryFormErrors {
  nombre?: string;
  slug?: string;
  orden?: string;
}

@Component({
  selector: 'app-category-form',
  imports: [Alert, Button, InputField, Modal, SelectField, TextareaField],
  templateUrl: './category-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryForm implements OnInit {
  readonly mode = input.required<CategoryFormMode>();
  readonly category = input<CategoryResponse | null>(null);
  readonly businessUnits = input.required<readonly BusinessUnitResponse[]>();
  readonly loadingFormData = input(false);
  readonly submitting = input(false);
  readonly serverError = input<string | null>(null);

  readonly canceled = output<void>();
  readonly saved = output<CategoryFormSubmission>();

  readonly nombre = signal('');
  readonly slug = signal('');
  readonly descripcion = signal('');
  readonly imagenUrl = signal('');
  readonly unidadNegocioId = signal('');
  readonly orden = signal('0');
  readonly activo = signal(true);
  readonly previewFailed = signal(false);
  readonly submitted = signal(false);

  readonly businessUnitOptions = computed<readonly SelectOption[]>(() => [
    { value: '', label: 'Sin unidad (Categoría global)' },
    ...this.businessUnits().map((unit) => ({ value: unit.id, label: unit.nombre })),
  ]);
  readonly errors = computed<CategoryFormErrors>(() => this.validationErrors());

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

  protected updateBusinessUnit(value: string): void {
    this.unidadNegocioId.set(value);
  }

  ngOnInit(): void {
    const category = this.category();
    if (category === null) return;

    this.nombre.set(category.nombre);
    this.slug.set(category.slug);
    this.descripcion.set(category.descripcion ?? '');
    this.imagenUrl.set(category.imagenUrl ?? '');
    this.unidadNegocioId.set(category.unidadNegocio?.id ?? '');
    this.orden.set(String(category.orden ?? 0));
    this.activo.set(category.activo === true);
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.hasErrors() || this.submitting()) return;

    const common = {
      nombre: this.nombre().trim(),
      slug: this.slug().trim(),
      descripcion: this.optionalValue(this.descripcion()),
      imagenUrl: this.optionalValue(this.imagenUrl()),
      activo: this.activo(),
      orden: Number(this.orden()),
      unidadNegocioId: this.optionalValue(this.unidadNegocioId()),
    };

    if (this.mode() === 'create') {
      this.saved.emit({ mode: 'create', request: common });
      return;
    }

    this.saved.emit({ mode: 'edit', request: common });
  }

  protected updateActive(event: Event): void {
    this.activo.set((event.target as HTMLInputElement).checked);
  }

  private validationErrors(): CategoryFormErrors {
    if (!this.submitted()) return {};
    const order = Number(this.orden());
    return {
      nombre: this.nombre().trim() ? undefined : 'Ingresa el nombre de la categoría.',
      slug: this.slug().trim() ? undefined : 'Ingresa el slug de la categoría.',
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
