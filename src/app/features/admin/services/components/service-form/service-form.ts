import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

import { ServiceCreateRequest } from '../../../../../data/models/service/service-create-request.model';
import { ServiceResponse } from '../../../../../data/models/service/service-response.model';
import { ServiceUpdateRequest } from '../../../../../data/models/service/service-update-request.model';
import { Alert } from '../../../../../shared/components/alert/alert';
import { Badge } from '../../../../../shared/components/badge/badge';
import { Button } from '../../../../../shared/components/button/button';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Modal } from '../../../../../shared/components/modal/modal';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';
import { slugify } from '../../../../../shared/utils/slugify';
import { ServiceFormMode } from '../../admin-services.facade';

export type ServiceFormSubmission =
  | { mode: 'create'; request: ServiceCreateRequest }
  | { mode: 'edit'; request: ServiceUpdateRequest };

interface ServiceFormErrors {
  nombre?: string;
  slug?: string;
  descripcion?: string;
  orden?: string;
}

@Component({
  selector: 'app-service-form',
  imports: [Alert, Button, InputField, Modal, TextareaField],
  templateUrl: './service-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceForm implements OnInit {
  readonly mode = input.required<ServiceFormMode>();
  readonly service = input<ServiceResponse | null>(null);
  readonly submitting = input(false);
  readonly serverError = input<string | null>(null);

  readonly canceled = output<void>();
  readonly saved = output<ServiceFormSubmission>();

  readonly nombre = signal('');
  readonly slug = signal('');
  readonly resumen = signal('');
  readonly etiqueta = signal('');
  readonly descripcion = signal('');
  readonly imagenUrl = signal('');
  readonly imagenAlt = signal('');
  readonly orden = signal('');
  readonly destacado = signal(false);
  readonly activo = signal(true);
  readonly submitted = signal(false);
  readonly previewFailed = signal(false);
  readonly errors = computed<ServiceFormErrors>(() => this.validationErrors());

  ngOnInit(): void {
    const service = this.service();
    if (service === null) return;

    this.nombre.set(service.nombre);
    this.slug.set(service.slug);
    this.resumen.set(service.resumen ?? '');
    this.etiqueta.set(service.etiqueta ?? '');
    this.descripcion.set(service.descripcion);
    this.imagenUrl.set(service.imagenUrl ?? '');
    this.imagenAlt.set(service.imagenAlt ?? '');
    this.orden.set(String(service.orden ?? 0));
    this.destacado.set(service.destacado === true);
    this.activo.set(service.activo === true);
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.hasErrors() || this.submitting()) return;

    const common = {
      nombre: this.nombre().trim(),
      slug: this.slug().trim(),
      resumen: this.optionalValue(this.resumen()),
      etiqueta: this.optionalValue(this.etiqueta()),
      descripcion: this.descripcion().trim(),
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
        },
      });
      return;
    }
    this.saved.emit({ mode: 'edit', request: { ...common, orden: Number(this.orden()) } });
  }

  protected updateNombre(value: string): void {
    this.nombre.set(value);
    this.slug.set(slugify(value));
  }

  protected generateSlug(): void {
    const s = slugify(this.nombre());
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

  private validationErrors(): ServiceFormErrors {
    if (!this.submitted()) return {};
    const order = Number(this.orden());
    return {
      nombre: this.nombre().trim() ? undefined : 'Ingresa el nombre del servicio.',
      slug: this.slug().trim() ? undefined : 'Ingresa el slug del servicio.',
      descripcion: this.descripcion().trim() ? undefined : 'Ingresa la descripción del servicio.',
      orden:
        this.mode() === 'create' && this.orden().trim() === ''
          ? undefined
          : Number.isFinite(order) && Number.isInteger(order)
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
