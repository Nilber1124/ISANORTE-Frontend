import { ChangeDetectionStrategy, Component, OnInit, input, output, signal } from '@angular/core';
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
import { Modal } from '../../../../../shared/components/modal/modal';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';

@Component({
  selector: 'app-page-seo-form',
  imports: [Button, InputField, Modal, TextareaField],
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
  readonly types = Object.values(SeoPageType);
  readonly robotsValues = Object.values(SeoRobots);
  readonly configuracionSitioId = signal('');
  readonly tipoPagina = signal<SeoPageType>(SeoPageType.HOME);
  readonly title = signal('');
  readonly description = signal('');
  readonly ogImageUrl = signal('');
  readonly robots = signal<SeoRobots>(SeoRobots.INDEX_FOLLOW);
  readonly unidadNegocioId = signal('');
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
    } else if (this.configurations().length)
      this.configuracionSitioId.set(this.configurations()[0].id);
  }
  protected typeChanged(event: Event): void {
    this.tipoPagina.set((event.target as HTMLSelectElement).value as SeoPageType);
    if (this.tipoPagina() !== SeoPageType.UNIDAD_NEGOCIO) this.unidadNegocioId.set('');
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
