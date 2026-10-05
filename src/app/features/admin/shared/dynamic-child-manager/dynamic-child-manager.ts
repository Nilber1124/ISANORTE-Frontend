import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import {
  BusinessUnitResourceRequest,
  BusinessUnitResourceResponse,
  BusinessUnitResourceType,
} from '../../../../data/models/business-unit/business-unit-resource.model';
import {
  CompanyStatisticRequest,
  CompanyStatisticResponse,
} from '../../../../data/models/company/company-statistic.model';
import {
  HeroSceneRequest,
  HeroSceneResponse,
} from '../../../../data/models/landing-section/hero-scene.model';
import {
  LandingActionRequest,
  LandingActionResponse,
} from '../../../../data/models/landing-section/landing-action.model';
import {
  ServiceBenefitRequest,
  ServiceBenefitResponse,
} from '../../../../data/models/service/service-benefit.model';
import { Badge } from '../../../../shared/components/badge/badge';
import { Button } from '../../../../shared/components/button/button';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ImageUploaderComponent } from '../../../../shared/components/image-uploader/image-uploader.component';
import { InputField } from '../../../../shared/components/input-field/input-field';
import { Modal } from '../../../../shared/components/modal/modal';
import { FormsModule } from '@angular/forms';

export type DynamicChildKind = 'scene' | 'action' | 'benefit' | 'resource' | 'statistic';
export type DynamicChild =
  | HeroSceneResponse
  | LandingActionResponse
  | ServiceBenefitResponse
  | BusinessUnitResourceResponse
  | CompanyStatisticResponse;
export type DynamicChildRequest =
  | HeroSceneRequest
  | LandingActionRequest
  | ServiceBenefitRequest
  | BusinessUnitResourceRequest
  | CompanyStatisticRequest;
export interface DynamicChildSave {
  id: string | null;
  request: DynamicChildRequest;
}

@Component({
  selector: 'app-dynamic-child-manager',
  imports: [Badge, Button, EmptyState, InputField, Modal, ImageUploaderComponent, FormsModule],
  templateUrl: './dynamic-child-manager.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DynamicChildManager {
  readonly kind = input.required<DynamicChildKind>();
  readonly parentName = input.required<string>();
  readonly parentType = input<string | null>(null);
  readonly items = input.required<readonly DynamicChild[]>();
  readonly saving = input(false);
  readonly error = input<string | null>(null);
  readonly closed = output<void>();
  readonly saved = output<DynamicChildSave>();
  readonly deleted = output<string>();
  readonly editingId = signal<string | null>(null);
  readonly formOpen = signal(false);
  readonly text = signal('');
  readonly url = signal('');
  readonly alt = signal('');
  readonly label = signal('');
  readonly prefix = signal('');
  readonly suffix = signal('');
  readonly order = signal('0');
  readonly active = signal(true);
  readonly previewFailed = signal(false);
  readonly resourceType = signal<BusinessUnitResourceType>(BusinessUnitResourceType.IMAGEN_FONDO);
  readonly resourceTypes = Object.values(BusinessUnitResourceType);

  protected readonly quickLinks: readonly string[] = [
    '/servicios',
    '/proyectos',
    '/nosotros',
    '/contacto',
    '#cotizar',
    'https://wa.me/51987654321',
  ];

  protected setQuickLink(link: string): void {
    this.url.set(link);
  }

  protected title(): string {
    return {
      scene: 'Diapositivas de la Portada Principal (Hero)',
      action: 'Botones y Enlaces de la Sección',
      benefit: 'Beneficios del Servicio',
      resource: 'Recursos de la Unidad de Negocio',
      statistic: 'Estadísticas de la Empresa',
    }[this.kind()];
  }

  protected emptyDescription(): string {
    return {
      scene: 'Este Hero todavía no tiene diapositivas configuradas.',
      action: 'Esta sección todavía no tiene botones adicionales configurados.',
      benefit: 'Este servicio todavía no tiene beneficios registrados.',
      resource: 'Esta unidad todavía no tiene recursos registrados.',
      statistic: 'Esta empresa todavía no tiene estadísticas registradas.',
    }[this.kind()];
  }

  protected asScene(item: DynamicChild): HeroSceneResponse {
    return item as HeroSceneResponse;
  }

  protected asAction(item: DynamicChild): LandingActionResponse {
    return item as LandingActionResponse;
  }

  protected updateUrl(val: string): void {
    this.url.set(val);
    this.previewFailed.set(false);
  }

  protected markPreviewFailed(): void {
    this.previewFailed.set(true);
  }

  protected openCreate(): void {
    this.editingId.set(null);
    this.text.set('');
    this.url.set('');
    this.alt.set('');
    this.label.set('');
    this.prefix.set('');
    this.suffix.set('');
    this.order.set('0');
    this.active.set(true);
    this.previewFailed.set(false);
    this.resourceType.set(BusinessUnitResourceType.IMAGEN_FONDO);
    this.formOpen.set(true);
  }

  protected openEdit(item: DynamicChild): void {
    this.editingId.set(item.id);
    this.order.set(String(item.orden));
    this.active.set(item.activo);
    this.previewFailed.set(false);
    if (this.kind() === 'scene') {
      const value = item as HeroSceneResponse;
      this.url.set(value.imagenUrl);
      this.alt.set(value.alt ?? '');
    } else if (this.kind() === 'action') {
      const value = item as LandingActionResponse;
      this.text.set(value.texto);
      this.url.set(value.enlace);
    } else if (this.kind() === 'benefit') this.text.set((item as ServiceBenefitResponse).texto);
    else if (this.kind() === 'resource') {
      const value = item as BusinessUnitResourceResponse;
      this.resourceType.set(value.tipo);
      this.url.set(value.url);
      this.alt.set(value.alt ?? '');
      this.label.set(value.etiqueta ?? '');
    } else {
      const value = item as CompanyStatisticResponse;
      this.text.set(String(value.valor));
      this.label.set(value.etiqueta);
      this.prefix.set(value.prefijo ?? '');
      this.suffix.set(value.sufijo ?? '');
    }
    this.formOpen.set(true);
  }
  protected itemLabel(item: DynamicChild): string {
    if (this.kind() === 'scene')
      return (item as HeroSceneResponse).alt || (item as HeroSceneResponse).imagenUrl;
    if (this.kind() === 'action') return (item as LandingActionResponse).texto;
    if (this.kind() === 'benefit') return (item as ServiceBenefitResponse).texto;
    if (this.kind() === 'resource')
      return (
        (item as BusinessUnitResourceResponse).etiqueta ||
        (item as BusinessUnitResourceResponse).url
      );
    return `${(item as CompanyStatisticResponse).prefijo ?? ''}${(item as CompanyStatisticResponse).valor}${(item as CompanyStatisticResponse).sufijo ?? ''} · ${(item as CompanyStatisticResponse).etiqueta}`;
  }
  protected toggleActive(event: Event): void {
    this.active.set((event.target as HTMLInputElement).checked);
  }
  protected submit(): void {
    const orden = Number(this.order());
    let request: DynamicChildRequest;
    if (this.kind() === 'scene')
      request = {
        imagenUrl: this.url().trim(),
        alt: this.alt().trim(),
        orden,
        activo: this.active(),
      };
    else if (this.kind() === 'action')
      request = {
        texto: this.text().trim(),
        enlace: this.url().trim(),
        orden,
        activo: this.active(),
      };
    else if (this.kind() === 'benefit')
      request = { texto: this.text().trim(), orden, activo: this.active() };
    else if (this.kind() === 'resource')
      request = {
        tipo: this.resourceType(),
        url: this.url().trim(),
        alt: this.alt().trim() || null,
        etiqueta: this.label().trim() || null,
        orden,
        activo: this.active(),
      };
    else
      request = {
        valor: Number(this.text()),
        prefijo: this.prefix().trim() || null,
        sufijo: this.suffix().trim() || null,
        etiqueta: this.label().trim(),
        orden,
        activo: this.active(),
      };
    this.saved.emit({ id: this.editingId(), request });
  }
  protected activeLimitReached(): boolean {
    const limit =
      this.kind() === 'action' && this.parentType() === 'HERO'
        ? 2
        : this.kind() === 'action' && this.parentType() === 'CTA'
          ? 1
          : null;
    if (limit === null || !this.active()) return false;
    return (
      this.items().filter((item) => item.activo && item.id !== this.editingId()).length >= limit
    );
  }
  protected invalid(): boolean {
    if (!Number.isInteger(Number(this.order()))) return true;
    if (this.kind() === 'scene') return !this.url().trim();
    if (this.kind() === 'action')
      return !this.text().trim() || !this.url().trim() || this.activeLimitReached();
    if (this.kind() === 'benefit') return !this.text().trim();
    if (this.kind() === 'resource')
      return (
        !this.url().trim() ||
        (this.resourceType() === BusinessUnitResourceType.IMAGEN_EDITORIAL && !this.alt().trim())
      );
    return !this.label().trim() || !Number.isFinite(Number(this.text()));
  }
}
