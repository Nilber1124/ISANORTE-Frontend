import { ChangeDetectionStrategy, Component, OnInit, computed, input, output, signal } from '@angular/core';
import { BusinessUnitResponse } from '../../../../../data/models/business-unit/business-unit-response.model';
import {
  PageSeoRequest,
  PageSeoResponse,
  PageSeoUpdateRequest,
  SeoPageType,
  SeoRobots,
} from '../../../../../data/models/content/page-seo.model';
import { SiteConfigResponse } from '../../../../../data/models/site-config/site-config-response.model';
import { Button } from '../../../../../shared/components/button/button';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Drawer } from '../../../../../shared/components/drawer/drawer';
import { SelectField, SelectOption } from '../../../../../shared/components/select-field/select-field';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';
import { ImageUploaderComponent } from '../../../../../shared/components/image-uploader/image-uploader.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-page-seo-form',
  imports: [Button, Drawer, InputField, SelectField, TextareaField, ImageUploaderComponent, FormsModule],
  templateUrl: './page-seo-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageSeoForm implements OnInit {
  readonly seo = input<PageSeoResponse | null>(null);
  readonly configurations = input.required<readonly SiteConfigResponse[]>();
  readonly units = input.required<readonly BusinessUnitResponse[]>();
  readonly saving = input(false);
  readonly closed = output<void>();
  readonly saved = output<PageSeoRequest | PageSeoUpdateRequest>();

  readonly siteOptions = computed<SelectOption[]>(() =>
    this.configurations().map((c) => ({
      value: c.id,
      label: c.clave || c.tituloSitio || c.id,
    })),
  );

  readonly pageTypeOptions: SelectOption[] = [
    { value: SeoPageType.HOME, label: 'Inicio' },
    { value: SeoPageType.NOSOTROS, label: 'Nosotros' },
    { value: SeoPageType.SERVICIOS, label: 'Servicios' },
    { value: SeoPageType.PROYECTOS, label: 'Proyectos' },
    { value: SeoPageType.CONTACTO, label: 'Contacto' },
    { value: SeoPageType.UNIDAD_NEGOCIO, label: 'Unidad de negocio' },
  ];

  readonly robotsOptions: SelectOption[] = [
    { value: SeoRobots.INDEX_FOLLOW, label: 'Indexar + Seguir enlaces (recomendado)' },
    { value: SeoRobots.NOINDEX_FOLLOW, label: 'No indexar + Seguir enlaces' },
    { value: SeoRobots.INDEX_NOFOLLOW, label: 'Indexar + No seguir enlaces' },
    { value: SeoRobots.NOINDEX_NOFOLLOW, label: 'No indexar + No seguir enlaces' },
  ];

  readonly unitOptions = computed<SelectOption[]>(() =>
    this.units().map((u) => ({ value: u.id, label: u.nombre })),
  );

  readonly configuracionSitioId = signal('');
  readonly tipoPagina = signal<SeoPageType>(SeoPageType.HOME);
  readonly title = signal('');
  readonly description = signal('');
  readonly ogImageUrl = signal('');
  readonly robots = signal<SeoRobots>(SeoRobots.INDEX_FOLLOW);
  readonly unidadNegocioId = signal('');

  readonly descriptionLength = computed(() => this.description().trim().length);
  readonly descriptionOverLimit = computed(() => this.descriptionLength() > 160);

  readonly tipoPaginaLabel = computed(() => {
    const opt = this.pageTypeOptions.find((o) => o.value === this.tipoPagina());
    return opt?.label ?? this.tipoPagina();
  });

  ngOnInit(): void {
    const item = this.seo();
    if (item) {
      this.configuracionSitioId.set(item.configuracionSitioId);
      this.tipoPagina.set(item.tipoPagina);
      this.title.set(item.title);
      this.description.set(item.description);
      this.ogImageUrl.set(item.ogImageUrl ?? '');
      this.robots.set(item.robots);
      this.unidadNegocioId.set(item.unidadNegocioId ?? '');
    } else if (this.configurations().length) {
      this.configuracionSitioId.set(this.configurations()[0].id);
    }
  }

  protected updatePageType(value: string): void {
    this.tipoPagina.set(value as SeoPageType);
    if (value !== SeoPageType.UNIDAD_NEGOCIO) this.unidadNegocioId.set('');
  }

  protected submit(): void {
    const editable: PageSeoUpdateRequest = {
      title: this.title().trim(),
      description: this.description().trim(),
      ogImageUrl: this.ogImageUrl().trim() || null,
      robots: this.robots(),
    };
    this.saved.emit(
      this.seo()
        ? editable
        : {
            ...editable,
            configuracionSitioId: this.configuracionSitioId(),
            tipoPagina: this.tipoPagina(),
            unidadNegocioId:
              this.tipoPagina() === SeoPageType.UNIDAD_NEGOCIO ? this.unidadNegocioId() : null,
          },
    );
  }
}
