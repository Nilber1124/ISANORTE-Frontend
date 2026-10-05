import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';

import { SocialNetworkResponse } from '../../../../../data/models/company/company-response.model';
import { SocialNetworkRequest } from '../../../../../data/models/company/social-network-request.model';
import { Button } from '../../../../../shared/components/button/button';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { Modal } from '../../../../../shared/components/modal/modal';

export interface SocialNetworkFormSubmission {
  request: SocialNetworkRequest;
}

@Component({
  selector: 'app-social-network-form',
  imports: [Button, InputField, Modal],
  templateUrl: './social-network-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SocialNetworkForm {
  readonly mode = input.required<'create' | 'edit'>();
  readonly initialData = input<SocialNetworkResponse | null>(null);
  readonly submitting = input<boolean>(false);
  
  readonly saved = output<SocialNetworkFormSubmission>();
  readonly canceled = output<void>();

  readonly nombre = signal('');
  readonly url = signal('');
  readonly icono = signal('');
  readonly orden = signal('');
  readonly activo = signal(true);

  readonly nombreError = signal<string | undefined>(undefined);
  readonly urlError = signal<string | undefined>(undefined);

  constructor() {
    effect(() => {
      const data = this.initialData();
      if (data) {
        this.nombre.set(data.nombre);
        this.url.set(data.url);
        this.icono.set(data.icono ?? '');
        this.orden.set(data.orden !== null && data.orden !== undefined ? data.orden.toString() : '');
        this.activo.set(data.activo ?? false);
      } else {
        this.reset();
      }
      this.clearErrors();
    });
  }

  protected updateActive(event: Event): void {
    if (this.submitting()) return;
    const target = event.target as HTMLInputElement;
    this.activo.set(target.checked);
  }

  protected submit(): void {
    if (this.submitting()) return;
    this.clearErrors();
    
    let hasError = false;
    if (!this.nombre().trim()) {
      this.nombreError.set('El nombre es obligatorio.');
      hasError = true;
    }
    if (!this.url().trim()) {
      this.urlError.set('La URL es obligatoria.');
      hasError = true;
    }
    
    if (hasError) return;

    const request: SocialNetworkRequest = {
      nombre: this.nombre().trim(),
      url: this.url().trim(),
      icono: this.icono().trim() || null,
      orden: this.orden().trim() === '' ? null : Number(this.orden().trim()),
      activo: this.activo(),
    };

    this.saved.emit({ request });
  }

  private reset(): void {
    this.nombre.set('');
    this.url.set('');
    this.icono.set('');
    this.orden.set('');
    this.activo.set(true);
  }

  private clearErrors(): void {
    this.nombreError.set(undefined);
    this.urlError.set(undefined);
  }
}
