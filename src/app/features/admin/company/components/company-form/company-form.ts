import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';

import { CompanyCreateRequest } from '../../../../../data/models/company/company-create-request.model';
import { CompanyResponse } from '../../../../../data/models/company/company-response.model';
import { CompanyUpdateRequest } from '../../../../../data/models/company/company-update-request.model';
import { Button } from '../../../../../shared/components/button/button';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Modal } from '../../../../../shared/components/modal/modal';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';
import { CompanyFormMode } from '../../admin-company.facade';

export interface CompanyFormSubmission {
  mode: CompanyFormMode;
  request: CompanyCreateRequest | CompanyUpdateRequest;
}

@Component({
  selector: 'app-company-form',
  imports: [Button, InputField, Modal, TextareaField],
  templateUrl: './company-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompanyForm {
  readonly mode = input.required<CompanyFormMode>();
  readonly initialData = input<CompanyResponse | null>(null);
  readonly submitting = input<boolean>(false);
  
  readonly saved = output<CompanyFormSubmission>();
  readonly canceled = output<void>();

  readonly razonSocial = signal('');
  readonly nombreComercial = signal('');
  readonly ruc = signal('');
  readonly direccion = signal('');
  readonly ciudad = signal('');
  readonly telefono = signal('');
  readonly telefonoSecundario = signal('');
  readonly email = signal('');
  readonly emailVentas = signal('');
  readonly whatsapp = signal('');
  readonly horarioAtencion = signal('');
  readonly mision = signal('');
  readonly vision = signal('');
  readonly valores = signal('');
  readonly resumenNosotros = signal('');

  readonly razonSocialError = signal<string | undefined>(undefined);
  readonly nombreComercialError = signal<string | undefined>(undefined);
  readonly rucError = signal<string | undefined>(undefined);

  constructor() {
    effect(() => {
      const data = this.initialData();
      if (data) {
        this.razonSocial.set(data.razonSocial);
        this.nombreComercial.set(data.nombreComercial);
        this.ruc.set(data.ruc);
        this.direccion.set(data.direccion ?? '');
        this.ciudad.set(data.ciudad ?? '');
        this.telefono.set(data.telefono ?? '');
        this.telefonoSecundario.set(data.telefonoSecundario ?? '');
        this.email.set(data.email ?? '');
        this.emailVentas.set(data.emailVentas ?? '');
        this.whatsapp.set(data.whatsapp ?? '');
        this.horarioAtencion.set(data.horarioAtencion ?? '');
        this.mision.set(data.mision ?? '');
        this.vision.set(data.vision ?? '');
        this.valores.set(data.valores ?? '');
        this.resumenNosotros.set(data.resumenNosotros ?? '');
      } else {
        this.reset();
      }
      this.clearErrors();
    });
  }

  protected submit(): void {
    if (this.submitting()) return;
    this.clearErrors();
    
    let hasError = false;
    if (!this.razonSocial().trim()) {
      this.razonSocialError.set('La razón social es obligatoria.');
      hasError = true;
    }
    if (!this.nombreComercial().trim()) {
      this.nombreComercialError.set('El nombre comercial es obligatorio.');
      hasError = true;
    }
    if (!this.ruc().trim()) {
      this.rucError.set('El RUC es obligatorio.');
      hasError = true;
    }
    
    if (hasError) return;

    const request: CompanyCreateRequest | CompanyUpdateRequest = {
      razonSocial: this.razonSocial().trim(),
      nombreComercial: this.nombreComercial().trim(),
      ruc: this.ruc().trim(),
      direccion: this.direccion().trim() || null,
      ciudad: this.ciudad().trim() || null,
      telefono: this.telefono().trim() || null,
      telefonoSecundario: this.telefonoSecundario().trim() || null,
      email: this.email().trim() || null,
      emailVentas: this.emailVentas().trim() || null,
      whatsapp: this.whatsapp().trim() || null,
      horarioAtencion: this.horarioAtencion().trim() || null,
      mision: this.mision().trim() || null,
      vision: this.vision().trim() || null,
      valores: this.valores().trim() || null,
      resumenNosotros: this.resumenNosotros().trim() || null,
    };

    this.saved.emit({ mode: this.mode(), request });
  }

  private reset(): void {
    this.razonSocial.set('');
    this.nombreComercial.set('');
    this.ruc.set('');
    this.direccion.set('');
    this.ciudad.set('');
    this.telefono.set('');
    this.telefonoSecundario.set('');
    this.email.set('');
    this.emailVentas.set('');
    this.whatsapp.set('');
    this.horarioAtencion.set('');
    this.mision.set('');
    this.vision.set('');
    this.valores.set('');
    this.resumenNosotros.set('');
  }

  private clearErrors(): void {
    this.razonSocialError.set(undefined);
    this.nombreComercialError.set(undefined);
    this.rucError.set(undefined);
  }
}
