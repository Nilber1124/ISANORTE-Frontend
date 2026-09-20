import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';

import { LandingSectionCreateRequest } from '../../../../../data/models/landing-section/landing-section-create-request.model';
import { LandingSectionResponse } from '../../../../../data/models/landing-section/landing-section-response.model';
import { LandingSectionType } from '../../../../../data/models/landing-section/landing-section-type.enum';
import { LandingSectionUpdateRequest } from '../../../../../data/models/landing-section/landing-section-update-request.model';
import { SiteConfigResponse } from '../../../../../data/models/site-config/site-config-response.model';
import { Button } from '../../../../../shared/components/button/button';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Modal } from '../../../../../shared/components/modal/modal';
import {
  SelectField,
  SelectOption,
} from '../../../../../shared/components/select-field/select-field';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';
import { LandingFormMode } from '../../admin-landing.facade';

@Component({
  selector: 'app-landing-section-form',
  imports: [Modal, InputField, SelectField, TextareaField, Button],
  templateUrl: './landing-section-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingSectionForm {
  readonly open = input.required<boolean>();
  readonly mode = input.required<LandingFormMode>();
  readonly initialData = input.required<LandingSectionResponse | null>();
  readonly siteConfigurations = input.required<SiteConfigResponse[]>();
  readonly submitting = input.required<boolean>();

  readonly closed = output<void>();
  readonly created = output<LandingSectionCreateRequest>();
  readonly updated = output<LandingSectionUpdateRequest>();

  readonly tipo = signal<string>(LandingSectionType.PERSONALIZADA);
  readonly titulo = signal<string>('');
  readonly etiqueta = signal<string>('');
  readonly subtitulo = signal<string>('');
  readonly contenido = signal<string>('');
  readonly imagenUrl = signal<string>('');
  readonly imagenAlt = signal<string>('');
  readonly textoBoton = signal<string>('');
  readonly enlaceBoton = signal<string>('');
  readonly orden = signal<string>('0');
  readonly visible = signal<boolean>(true);
  readonly configuracionSitioId = signal<string>('');

  readonly hasMultipleConfigs = computed(() => this.siteConfigurations().length > 1);

  readonly configOptions = computed<SelectOption[]>(() =>
    this.siteConfigurations().map((c) => ({
      value: c.id,
      label: c.tituloSitio || 'Configuración de sitio',
    })),
  );

  readonly typeOptions: SelectOption[] = [
    { value: LandingSectionType.HERO, label: 'Hero' },
    { value: LandingSectionType.EMPRESA, label: 'Empresa' },
    { value: LandingSectionType.SERVICIOS, label: 'Servicios' },
    { value: LandingSectionType.PROYECTOS, label: 'Proyectos' },
    { value: LandingSectionType.UNIDAD_NEGOCIO, label: 'Unidad de negocio' },
    { value: LandingSectionType.CONTACTO, label: 'Contacto' },
    { value: LandingSectionType.CTA, label: 'Llamada a la acción' },
    { value: LandingSectionType.PERSONALIZADA, label: 'Personalizada' },
  ];

  constructor() {
    effect(() => {
      const isOpen = this.open();
      if (isOpen) {
        untracked(() => this.resetForm());
      }
    });
  }

  protected submit(event: Event): void {
    event.preventDefault();
    if (this.submitting()) return;

    if (this.mode() === 'create') {
      const createReq: LandingSectionCreateRequest = {
        configuracionSitioId: this.configuracionSitioId(),
        tipo: this.tipo() as LandingSectionType,
        etiqueta: this.etiqueta().trim() || null,
        titulo: this.titulo().trim() || null,
        subtitulo: this.subtitulo().trim() || null,
        contenido: this.contenido().trim() || null,
        imagenUrl: this.imagenUrl().trim() || null,
        imagenAlt: this.imagenAlt().trim() || null,
        textoBoton: this.textoBoton().trim() || null,
        enlaceBoton: this.enlaceBoton().trim() || null,
        orden: this.orden() ? parseInt(this.orden(), 10) : 0,
        visible: this.visible(),
      };
      this.created.emit(createReq);
    } else {
      const updateReq: LandingSectionUpdateRequest = {
        configuracionSitioId: this.initialData()!.configuracionSitioId,
        tipo: this.tipo() as LandingSectionType,
        etiqueta: this.etiqueta().trim() || null,
        titulo: this.titulo().trim() || null,
        subtitulo: this.subtitulo().trim() || null,
        contenido: this.contenido().trim() || null,
        imagenUrl: this.imagenUrl().trim() || null,
        imagenAlt: this.imagenAlt().trim() || null,
        textoBoton: this.textoBoton().trim() || null,
        enlaceBoton: this.enlaceBoton().trim() || null,
        orden: this.orden() ? parseInt(this.orden(), 10) : 0,
        visible: this.visible(),
      };
      this.updated.emit(updateReq);
    }
  }

  protected handleVisibilityChange(event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this.visible.set(isChecked);
  }

  private resetForm(): void {
    const data = this.initialData();
    if (data) {
      this.tipo.set(data.tipo);
      this.etiqueta.set(data.etiqueta || '');
      this.titulo.set(data.titulo || '');
      this.subtitulo.set(data.subtitulo || '');
      this.contenido.set(data.contenido || '');
      this.imagenUrl.set(data.imagenUrl || '');
      this.imagenAlt.set(data.imagenAlt || '');
      this.textoBoton.set(data.textoBoton || '');
      this.enlaceBoton.set(data.enlaceBoton || '');
      this.orden.set(data.orden != null ? data.orden.toString() : '0');
      this.visible.set(data.visible ?? true);
      this.configuracionSitioId.set(data.configuracionSitioId);
    } else {
      this.tipo.set(LandingSectionType.PERSONALIZADA);
      this.etiqueta.set('');
      this.titulo.set('');
      this.subtitulo.set('');
      this.contenido.set('');
      this.imagenUrl.set('');
      this.imagenAlt.set('');
      this.textoBoton.set('');
      this.enlaceBoton.set('');
      this.orden.set('0');
      this.visible.set(true);

      const configs = this.siteConfigurations();
      if (configs.length > 0) {
        this.configuracionSitioId.set(configs[0].id);
      }
    }
  }
}
