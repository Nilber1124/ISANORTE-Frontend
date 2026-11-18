import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  input,
  output,
  signal,
} from '@angular/core';

import { CompanyResponse } from '../../../../../data/models/company/company-response.model';
import { SiteConfigCreateRequest } from '../../../../../data/models/site-config/site-config-create-request.model';
import { SiteConfigResponse } from '../../../../../data/models/site-config/site-config-response.model';
import { SiteConfigUpdateRequest } from '../../../../../data/models/site-config/site-config-update-request.model';
import { Alert } from '../../../../../shared/components/alert/alert';
import { Button } from '../../../../../shared/components/button/button';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Drawer } from '../../../../../shared/components/drawer/drawer';
import {
  SelectField,
  SelectOption,
} from '../../../../../shared/components/select-field/select-field';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';
import { ImageUploaderComponent } from '../../../../../shared/components/image-uploader/image-uploader.component';
import { FormsModule } from '@angular/forms';
import { SiteConfigFormMode } from '../../admin-site-config.facade';

export type SiteConfigFormSubmission =
  | { mode: 'create'; request: SiteConfigCreateRequest }
  | { mode: 'edit'; request: SiteConfigUpdateRequest };

@Component({
  selector: 'app-site-config-form',
  imports: [Alert, Button, Drawer, InputField, SelectField, TextareaField, ImageUploaderComponent, FormsModule],
  templateUrl: './site-config-form.html',
  styleUrl: './site-config-form.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteConfigForm implements OnInit {
  readonly mode = input.required<SiteConfigFormMode>();
  readonly config = input<SiteConfigResponse | null>(null);
  readonly companies = input.required<readonly CompanyResponse[]>();
  readonly loadingFormData = input(false);
  readonly submitting = input(false);
  readonly serverError = input<string | null>(null);
  readonly canceled = output<void>();
  readonly saved = output<SiteConfigFormSubmission>();

  readonly tituloSitio = signal('');
  readonly clave = signal('');
  readonly claveError = signal<string | undefined>(undefined);
  readonly descripcionSitio = signal('');
  readonly logoUrl = signal('');
  readonly logoBlancoUrl = signal('');
  readonly faviconUrl = signal('');
  readonly colorPrimario = signal('');
  readonly colorSecundario = signal('');
  readonly textoPiePagina = signal('');
  readonly empresaId = signal('');
  readonly empresaError = signal<string | undefined>(undefined);
  readonly companyOptions = computed<readonly SelectOption[]>(() =>
    this.companies().map((company) => ({ value: company.id, label: company.nombreComercial })),
  );
  readonly hasCompanies = computed(() => this.companies().length > 0);

  ngOnInit(): void {
    const config = this.config();
    if (this.mode() === 'edit' && config) {
      this.tituloSitio.set(config.tituloSitio ?? '');
      this.clave.set(config.clave ?? '');
      this.descripcionSitio.set(config.descripcionSitio ?? '');
      this.logoUrl.set(config.logoUrl ?? '');
      this.logoBlancoUrl.set(config.logoBlancoUrl ?? '');
      this.faviconUrl.set(config.faviconUrl ?? '');
      this.colorPrimario.set(config.colorPrimario ?? '');
      this.colorSecundario.set(config.colorSecundario ?? '');
      this.textoPiePagina.set(config.textoPiePagina ?? '');
      return;
    }
    if (this.companies().length === 1) this.empresaId.set(this.companies()[0].id);
  }

  protected submit(): void {
    if (this.submitting()) return;
    const key = this.clave().trim();
    if (key && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(key)) {
      this.claveError.set('Usa minúsculas, números y guiones simples; por ejemplo, isanorte.');
      return;
    }
    this.claveError.set(undefined);
    if (this.mode() === 'create') {
      if (!this.hasCompanies() || !this.empresaId()) {
        this.empresaError.set('Selecciona una empresa.');
        return;
      }
      this.saved.emit({
        mode: 'create',
        request: { empresaId: this.empresaId(), ...this.editableFields() },
      });
      return;
    }
    this.saved.emit({ mode: 'edit', request: this.editableFields() });
  }

  private editableFields(): SiteConfigUpdateRequest {
    return {
      tituloSitio: this.optionalValue(this.tituloSitio()),
      clave: this.optionalValue(this.clave()),
      descripcionSitio: this.optionalValue(this.descripcionSitio()),
      logoUrl: this.optionalValue(this.logoUrl()),
      logoBlancoUrl: this.optionalValue(this.logoBlancoUrl()),
      faviconUrl: this.optionalValue(this.faviconUrl()),
      colorPrimario: this.optionalValue(this.colorPrimario()),
      colorSecundario: this.optionalValue(this.colorSecundario()),
      textoPiePagina: this.optionalValue(this.textoPiePagina()),
    };
  }

  private optionalValue(value: string): string | null {
    return value === '' ? null : value;
  }
}
