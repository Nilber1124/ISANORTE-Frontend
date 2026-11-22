import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ToastService } from '../../../../../core/services/toast.service';
import { ServiceUpdateRequest } from '../../../../../data/models/service/service-update-request.model';
import { ServiceResponse } from '../../../../../data/models/service/service-response.model';
import { ServiceApiService } from '../../../../../data/services/service-api.service';
import { Button } from '../../../../../shared/components/button/button';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';
import { FieldEditor } from '../field-editor/field-editor';

export type ServiceField = 'nombre' | 'resumen' | 'ambos';

/** Campos sueltos; «ambos» (tocar la tarjeta) muestra nombre y descripción juntos. */
type SingleField = Exclude<ServiceField, 'ambos'>;

const FIELD_LABELS: Record<SingleField, { label: string; rows: number; required: boolean; helper?: string }> = {
  nombre: { label: 'Nombre del servicio', rows: 1, required: true },
  resumen: { label: 'Descripción corta', rows: 3, required: false, helper: 'Se muestra bajo el nombre en la tarjeta.' },
};

/** Edita un campo (nombre o resumen) de un servicio tocado en la tarjeta de la vista previa. */
@Component({
  selector: 'app-service-field-editor',
  imports: [Button, FieldEditor, InputField, TextareaField],
  templateUrl: './service-field-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceFieldEditor {
  /** Slug del servicio (es lo que identifica la tarjeta en la web pública). */
  readonly serviceSlug = input.required<string>();
  readonly field = input.required<ServiceField>();

  /** Lo que se teclea, por campo (borrador en vivo), o `null` si nada difiere de lo guardado. */
  readonly draftChanged = output<Readonly<Record<string, string>> | null>();
  /** El servicio se guardó: la vista previa debe recargarse. */
  readonly saved = output<void>();
  readonly closed = output<void>();

  private readonly api = inject(ServiceApiService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly service = signal<ServiceResponse | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly single = () => (this.field() === 'ambos' ? null : this.field() as SingleField);
  protected readonly meta = () => FIELD_LABELS[this.single() ?? 'nombre'];
  protected readonly nombreText = signal('');
  protected readonly resumenText = signal('');
  protected readonly heading = () => {
    const single = this.single();
    return `${this.service()?.nombre ?? 'Servicio'}${single ? ' · ' + FIELD_LABELS[single].label : ''}`;
  };
  protected readonly currentValue = () => {
    const service = this.service();
    const single = this.single();
    return service && single ? (service[single] ?? '') : '';
  };
  protected readonly bothDirty = () => {
    const service = this.service();
    return !!service && (this.nombreText() !== service.nombre || this.resumenText() !== (service.resumen ?? ''));
  };
  protected readonly bothInvalid = () => this.nombreText().trim() === '';

  constructor() {
    // Modo «ambos»: los dos campos se rellenan al cargar y emiten su borrador conjunto.
    effect(() => {
      const service = this.service();
      untracked(() => {
        this.nombreText.set(service?.nombre ?? '');
        this.resumenText.set(service?.resumen ?? '');
      });
    });
    effect(() => {
      const values = { nombre: this.nombreText(), resumen: this.resumenText() };
      const dirty = this.bothDirty();
      untracked(() => {
        if (this.field() === 'ambos') this.draftChanged.emit(dirty ? values : null);
      });
    });
    effect(() => {
      const slug = this.serviceSlug();
      untracked(() => this.load(slug));
    });
  }

  private load(slug: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.set(null);
    this.api
      .getBySlug(slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (service) => {
          this.service.set(service);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el servicio.');
          this.loading.set(false);
        },
      });
  }

  /** Un solo campo (el que se tocó). */
  protected save(value: string): void {
    const single = this.single();
    if (!single) return;
    this.persist(single === 'nombre' ? { nombre: value } : { resumen: value || null });
  }

  /** Nombre y descripción juntos (se tocó la tarjeta). */
  protected saveBoth(): void {
    if (!this.bothDirty() || this.bothInvalid()) return;
    this.persist({ nombre: this.nombreText().trim(), resumen: this.resumenText().trim() || null });
  }

  /** Mapea el borrador de un campo suelto al formato por campo. */
  protected onSingleDraft(value: string | null): void {
    const single = this.single();
    this.draftChanged.emit(value !== null && single ? { [single]: value } : null);
  }

  private persist(patch: { nombre?: string; resumen?: string | null }): void {
    const service = this.service();
    if (!service || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    // El resto del servicio se envía tal cual está guardado; solo cambian los campos editados.
    const request: ServiceUpdateRequest = {
      nombre: service.nombre,
      slug: service.slug,
      resumen: service.resumen,
      descripcion: service.descripcion,
      imagenUrl: service.imagenUrl,
      etiqueta: service.etiqueta,
      imagenAlt: service.imagenAlt,
      activo: service.activo ?? true,
      destacado: service.destacado ?? false,
      orden: service.orden ?? 0,
      ...patch,
    };
    this.api
      .update(service.id, request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.service.set(updated);
          this.saving.set(false);
          this.toast.show('Servicio actualizado.', 'success');
          this.saved.emit();
        },
        error: () => {
          this.saving.set(false);
          this.error.set('No se pudo guardar. Revisa el texto e inténtalo de nuevo.');
        },
      });
  }
}
