import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, debounceTime, distinctUntilChanged, switchMap } from 'rxjs';
import { DOCUMENT } from '@angular/common';

import { ServiceCreateRequest } from '../../../../../data/models/service/service-create-request.model';
import { ServiceResponse } from '../../../../../data/models/service/service-response.model';
import { ServiceUpdateRequest } from '../../../../../data/models/service/service-update-request.model';
import { ServiceApiService } from '../../../../../data/services/service-api.service';
import { FormsModule } from '@angular/forms';
import { ImageUploaderComponent } from '../../../../../shared/components/image-uploader/image-uploader.component';
import { Alert } from '../../../../../shared/components/alert/alert';
import { Button } from '../../../../../shared/components/button/button';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Drawer } from '../../../../../shared/components/drawer/drawer';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';
import { slugify } from '../../../../../shared/utils/slugify';
import { ServiceFormMode } from '../../admin-services.facade';

export type ServiceFormSubmission =
  | { mode: 'create'; request: ServiceCreateRequest }
  | { mode: 'edit'; request: ServiceUpdateRequest };

type SlugState = 'idle' | 'checking' | 'available' | 'taken';

interface ServiceFormErrors {
  nombre?: string;
  slug?: string;
  resumen?: string;
  descripcion?: string;
  imagenAlt?: string;
}

@Component({
  selector: 'app-service-form',
  imports: [Alert, Button, Drawer, InputField, TextareaField, ImageUploaderComponent, FormsModule],
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
  readonly slugLocked = signal(false);
  readonly slugSynced = signal(false);
  readonly slugState = signal<SlugState>('idle');
  readonly resumen = signal('');
  readonly etiqueta = signal('');
  readonly descripcion = signal('');
  readonly imagenUrl = signal('');
  readonly imagenAlt = signal('');
  readonly orden = signal('');
  readonly destacado = signal(false);
  readonly activo = signal(false);
  readonly submitted = signal(false);
  readonly confirmingClose = signal(false);

  readonly resumenLength = computed(() => this.resumen().trim().length);
  readonly descripcionLength = computed(() => this.descripcion().trim().length);
  readonly resumenOverLimit = computed(() => this.resumenLength() > 160);
  readonly hasImagen = computed(() => !!this.imagenUrl().trim());
  readonly canPublish = computed(() => this.hasImagen());
  readonly canHighlight = computed(() => this.activo() === true);
  readonly imagenAltRequired = computed(() => this.hasImagen());

  readonly etiquetaPlaceholder = computed(() => {
    const n = this.nombre().trim();
    if (!n) return 'Ej: Especialidad';
    const first = n.split(/\s+/)[0];
    return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
  });

  readonly errors = computed<ServiceFormErrors>(() => this.validationErrors());

  readonly isDirty = computed(() => {
    const svc = this.service();
    if (this.mode() === 'create') {
      return this.nombre().trim() !== '' || this.descripcion().trim() !== '';
    }
    if (svc === null) return false;
    return (
      this.nombre() !== svc.nombre ||
      this.slug() !== svc.slug ||
      this.resumen() !== (svc.resumen ?? '') ||
      this.etiqueta() !== (svc.etiqueta ?? '') ||
      this.descripcion() !== svc.descripcion ||
      this.imagenUrl() !== (svc.imagenUrl ?? '') ||
      this.imagenAlt() !== (svc.imagenAlt ?? '') ||
      this.orden() !== String(svc.orden ?? '') ||
      this.destacado() !== (svc.destacado === true) ||
      this.activo() !== (svc.activo === true)
    );
  });

  readonly canSave = computed(
    () =>
      !this.submitting() &&
      this.slugState() !== 'taken' &&
      this.slugState() !== 'checking' &&
      (this.mode() === 'create' || this.isDirty()),
  );

  private readonly slugCheck$ = new Subject<string>();
  private readonly destroyRef = inject(DestroyRef);
  private readonly api = inject(ServiceApiService);
  private readonly document = inject(DOCUMENT);

  ngOnInit(): void {
    this.initSlugCheck();

    const svc = this.service();
    if (svc === null) {
      this.slugSynced.set(true);
      this.activo.set(false);
      return;
    }

    this.nombre.set(svc.nombre);
    this.slug.set(svc.slug);
    this.slugLocked.set(true);
    this.resumen.set(svc.resumen ?? '');
    this.etiqueta.set(svc.etiqueta ?? '');
    this.descripcion.set(svc.descripcion);
    this.imagenUrl.set(svc.imagenUrl ?? '');
    this.imagenAlt.set(svc.imagenAlt ?? '');
    this.orden.set(svc.orden != null ? String(svc.orden) : '');
    this.destacado.set(svc.destacado === true);
    this.activo.set(svc.activo === true);
  }

  protected submit(): void {
    this.submitted.set(true);
    if (this.hasErrors() || this.submitting()) return;

    const common = {
      nombre: this.nombre().trim(),
      slug: this.slug().trim(),
      resumen: this.resumen().trim() || null,
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
    this.saved.emit({
      mode: 'edit',
      request: {
        ...common,
        orden: this.orden().trim() === '' ? 0 : Number(this.orden()),
      },
    });
  }

  protected updateNombre(value: string): void {
    this.nombre.set(value);
    if (this.slugSynced()) {
      const generated = slugify(value);
      this.slug.set(generated);
      if (generated) this.checkSlug(generated);
    }
  }

  protected updateSlugManual(value: string): void {
    this.slug.set(value);
    this.slugSynced.set(false);
    if (value.trim()) this.checkSlug(value.trim());
    else this.slugState.set('idle');
  }

  protected resetSlug(): void {
    this.slugSynced.set(true);
    const generated = slugify(this.nombre());
    this.slug.set(generated);
    if (generated) this.checkSlug(generated);
  }

  protected unlockSlug(): void {
    this.slugLocked.set(false);
    this.slugSynced.set(false);
  }

  protected updateImageUrl(value: string): void {
    this.imagenUrl.set(value);
    if (value.trim() && !this.imagenAlt().trim()) {
      this.imagenAlt.set(this.nombre().trim());
    }
    if (!value.trim() && this.activo()) {
      this.activo.set(false);
      this.destacado.set(false);
    }
  }

  protected toggleActive(): void {
    if (!this.canPublish() && !this.activo()) return;
    const next = !this.activo();
    this.activo.set(next);
    if (!next) this.destacado.set(false);
  }

  protected toggleHighlight(): void {
    if (!this.canHighlight()) return;
    this.destacado.update((v) => !v);
  }

  protected requestClose(): void {
    if (this.isDirty() && !this.submitting()) {
      this.confirmingClose.set(true);
      return;
    }
    this.canceled.emit();
  }

  protected confirmClose(): void {
    this.confirmingClose.set(false);
    this.canceled.emit();
  }

  protected cancelClose(): void {
    this.confirmingClose.set(false);
  }

  private checkSlug(slug: string): void {
    this.slugState.set('checking');
    this.slugCheck$.next(slug);
  }

  private initSlugCheck(): void {
    const excludeId = this.service()?.id ?? undefined;
    this.slugCheck$
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((slug) => this.api.checkSlugAvailable(slug, excludeId)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => this.slugState.set(res.available ? 'available' : 'taken'),
        error: () => this.slugState.set('idle'),
      });
  }

  private scrollToFirstError(): void {
    const el = this.document.querySelector<HTMLElement>('[data-field-error]');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  private validationErrors(): ServiceFormErrors {
    if (!this.submitted()) return {};
    const errors: ServiceFormErrors = {};
    if (!this.nombre().trim()) errors.nombre = 'Ingresa el nombre del servicio.';
    if (!this.slug().trim()) errors.slug = 'La ruta no puede estar vacía.';
    else if (this.slugState() === 'taken') errors.slug = 'Esta ruta ya está en uso.';
    if (!this.resumen().trim()) errors.resumen = 'Ingresa un resumen del servicio.';
    else if (this.resumenOverLimit())
      errors.resumen = 'El resumen no puede superar los 160 caracteres.';
    if (!this.descripcion().trim()) errors.descripcion = 'Ingresa la descripción del servicio.';
    if (this.imagenAltRequired() && !this.imagenAlt().trim())
      errors.imagenAlt = 'Agrega un texto alternativo para la imagen.';
    return errors;
  }

  private hasErrors(): boolean {
    const errors = this.validationErrors();
    const hasAny = Object.values(errors).some(Boolean);
    if (hasAny) {
      setTimeout(() => this.scrollToFirstError(), 50);
    }
    return hasAny;
  }

  private optionalValue(value: string): string | null {
    return value.trim() || null;
  }
}
