import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { BusinessUnitCreateRequest } from '../../../../../data/models/business-unit/business-unit-create-request.model';
import { BusinessUnitResponse } from '../../../../../data/models/business-unit/business-unit-response.model';
import { BusinessUnitUpdateRequest } from '../../../../../data/models/business-unit/business-unit-update-request.model';
import { CompanyResponse } from '../../../../../data/models/company/company-response.model';
import { Alert } from '../../../../../shared/components/alert/alert';
import { Button } from '../../../../../shared/components/button/button';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Modal } from '../../../../../shared/components/modal/modal';
import {
  SelectField,
  SelectOption,
} from '../../../../../shared/components/select-field/select-field';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';
import { BusinessUnitFormMode } from '../../admin-business-units.facade';

export type BusinessUnitFormSubmission =
  | { mode: 'create'; request: BusinessUnitCreateRequest }
  | { mode: 'edit'; request: BusinessUnitUpdateRequest };
interface FormErrors {
  nombre?: string;
  slug?: string;
  empresaId?: string;
  orden?: string;
}

@Component({
  selector: 'app-business-unit-form',
  imports: [Alert, Button, InputField, Modal, SelectField, TextareaField],
  templateUrl: './business-unit-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BusinessUnitForm implements OnInit {
  readonly mode = input.required<BusinessUnitFormMode>();
  readonly businessUnit = input<BusinessUnitResponse | null>(null);
  readonly companies = input.required<readonly CompanyResponse[]>();
  readonly loadingFormData = input(false);
  readonly submitting = input(false);
  readonly serverError = input<string | null>(null);
  readonly canceled = output<void>();
  readonly saved = output<BusinessUnitFormSubmission>();
  readonly nombre = signal('');
  readonly slug = signal('');
  readonly descripcion = signal('');
  readonly icono = signal('');
  readonly imagenUrl = signal('');
  readonly imagenAlt = signal('');
  readonly empresaId = signal('');
  readonly orden = signal('');
  readonly activo = signal(true);
  readonly destacado = signal(false);
  readonly submitted = signal(false);
  readonly previewFailed = signal(false);
  readonly companyOptions = computed<readonly SelectOption[]>(() =>
    this.companies().map((company) => ({ value: company.id, label: company.nombreComercial })),
  );
  readonly errors = computed<FormErrors>(() => this.validationErrors());
  readonly hasCompanies = computed(() => this.companies().length > 0);

  ngOnInit(): void {
    const businessUnit = this.businessUnit();
    if (businessUnit !== null) {
      this.nombre.set(businessUnit.nombre);
      this.slug.set(businessUnit.slug);
      this.descripcion.set(businessUnit.descripcion ?? '');
      this.icono.set(businessUnit.icono ?? '');
      this.imagenUrl.set(businessUnit.imagenUrl ?? '');
      this.imagenAlt.set(businessUnit.imagenAlt ?? '');
      this.empresaId.set(businessUnit.empresa.id);
      this.orden.set(String(businessUnit.orden ?? 0));
      this.activo.set(businessUnit.activo === true);
      this.destacado.set(businessUnit.destacado === true);
      return;
    }
    if (this.companies().length === 1) this.empresaId.set(this.companies()[0].id);
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.hasErrors() || this.submitting()) return;
    const common = {
      nombre: this.nombre().trim(),
      slug: this.slug().trim(),
      descripcion: this.optionalValue(this.descripcion()),
      icono: this.optionalValue(this.icono()),
      imagenUrl: this.optionalValue(this.imagenUrl()),
      imagenAlt: this.optionalValue(this.imagenAlt()),
      activo: this.activo(),
      destacado: this.destacado(),
    };
    if (this.mode() === 'create') {
      this.saved.emit({
        mode: 'create',
        request: {
          ...common,
          orden: this.orden().trim() === '' ? null : Number(this.orden()),
          empresaId: this.empresaId(),
        },
      });
      return;
    }
    this.saved.emit({
      mode: 'edit',
      request: {
        ...common,
        orden: Number(this.orden()),
        empresaId: this.businessUnit()!.empresa.id,
      },
    });
  }
  protected updateImageUrl(value: string): void {
    this.imagenUrl.set(value);
    this.previewFailed.set(false);
  }
  protected markPreviewFailed(): void {
    this.previewFailed.set(true);
  }
  protected updateActive(event: Event): void {
    this.activo.set((event.target as HTMLInputElement).checked);
  }
  protected updateFeatured(event: Event): void {
    this.destacado.set((event.target as HTMLInputElement).checked);
  }
  private validationErrors(): FormErrors {
    if (!this.submitted()) return {};
    const order = Number(this.orden());
    return {
      nombre: this.nombre().trim() ? undefined : 'Ingresa el nombre de la unidad.',
      slug: this.slug().trim() ? undefined : 'Ingresa el slug de la unidad.',
      empresaId:
        this.mode() === 'create' && !this.empresaId() ? 'Selecciona una empresa.' : undefined,
      orden:
        this.mode() === 'create' && this.orden().trim() === ''
          ? undefined
          : Number.isFinite(order) && Number.isInteger(order)
            ? undefined
            : 'Ingresa un número entero.',
    };
  }
  private hasErrors(): boolean {
    return (
      (!this.hasCompanies() && this.mode() === 'create') ||
      Object.values(this.validationErrors()).some(Boolean)
    );
  }
  private optionalValue(value: string): string | null {
    return value.trim() || null;
  }
}
