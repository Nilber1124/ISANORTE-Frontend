import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

import { Alert } from '../../../shared/components/alert/alert';
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { InputField } from '../../../shared/components/input-field/input-field';
import { TextareaField } from '../../../shared/components/textarea-field/textarea-field';

export type ContactChannelIcon = 'chat' | 'mail' | 'pin';

export interface ContactChannel {
  id: string;
  icon: ContactChannelIcon;
  label: string;
  value: string;
  hint: string;
}

export interface ContactHeaderData {
  eyebrow: string;
  title: string;
  description: string;
}

export interface ContactFieldContent {
  label: string;
  placeholder: string;
}

export interface ContactFormContent {
  title: string;
  description: string;
  name: ContactFieldContent;
  email: ContactFieldContent;
  phone: ContactFieldContent;
  company: ContactFieldContent;
  message: ContactFieldContent;
  submitLabel: string;
  successTitle: string;
  successMessage: string;
}

export interface ContactValidationMessages {
  nameRequired: string;
  emailRequired: string;
  emailInvalid: string;
  phoneRequired: string;
  phoneInvalid: string;
  messageRequired: string;
}

export interface ContactRequest {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_PATTERN = /^\+?[0-9\s()-]{7,20}$/;

@Component({
  imports: [Alert, Button, Card, InputField, TextareaField],
  selector: 'app-isanorte-contact',
  styleUrl: './contact.css',
  templateUrl: './contact.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  readonly header: ContactHeaderData = {
    eyebrow: 'CONTACTO DIRECTO // HABLEMOS',
    title: 'Conectemos con tu próximo proyecto',
    description:
      'Nuestro equipo técnico e ingenieros están disponibles para agendar visitas a obra o responder cotizaciones detalladas de manera rápida.',
  };

  readonly channels: ContactChannel[] = [
    {
      id: 'whatsapp',
      icon: 'chat',
      label: 'WhatsApp Corporativo',
      value: '+57 (312) 456-7890',
      hint: 'Respuesta inmediata',
    },
    {
      id: 'email',
      icon: 'mail',
      label: 'Correo de Proyecto',
      value: 'cotizaciones@isanorte.com',
      hint: 'Envío de planos y presupuestos',
    },
    {
      id: 'office',
      icon: 'pin',
      label: 'Oficinas Centrales',
      value: 'Av. 19 # 104-50, Oficina 402, Bogotá',
      hint: 'Visitas bajo cita',
    },
  ];

  readonly form: ContactFormContent = {
    title: 'Enviar Mensaje Directo',
    description: 'Completa el formulario y te responderemos en menos de 24 horas.',
    name: { label: 'Nombre Completo', placeholder: 'Ej. Carlos Mendoza' },
    email: { label: 'Correo Electrónico', placeholder: 'carlos@ejemplo.com' },
    phone: { label: 'Teléfono de Contacto', placeholder: 'Ej. 312 456 7890' },
    company: { label: 'Empresa / Constructora (Opcional)', placeholder: 'Nombre de la empresa' },
    message: {
      label: 'Cuéntanos sobre tu Proyecto',
      placeholder: 'Describe tu proyecto, ubicación, alcance o servicios requeridos',
    },
    submitLabel: 'ENVIAR SOLICITUD',
    successTitle: 'Solicitud registrada',
    successMessage:
      'Gracias por escribirnos. Un asesor técnico revisará tu mensaje y te responderá en menos de 24 horas.',
  };

  readonly validationMessages: ContactValidationMessages = {
    nameRequired: 'Ingresa tu nombre completo.',
    emailRequired: 'Ingresa tu correo electrónico.',
    emailInvalid: 'Ingresa un correo electrónico válido.',
    phoneRequired: 'Ingresa tu teléfono de contacto.',
    phoneInvalid: 'Ingresa un teléfono válido (mínimo 7 dígitos).',
    messageRequired: 'Cuéntanos brevemente sobre tu proyecto.',
  };

  readonly name = signal('');
  readonly email = signal('');
  readonly phone = signal('');
  readonly company = signal('');
  readonly message = signal('');

  readonly nameTouched = signal(false);
  readonly emailTouched = signal(false);
  readonly phoneTouched = signal(false);
  readonly messageTouched = signal(false);

  readonly submitted = signal(false);
  readonly sent = signal(false);

  readonly nameError = computed<string | undefined>(() => {
    if (!this.submitted() && !this.nameTouched()) return undefined;
    return this.name().trim() ? undefined : this.validationMessages.nameRequired;
  });

  readonly emailError = computed<string | undefined>(() => {
    if (!this.submitted() && !this.emailTouched()) return undefined;
    const value = this.email().trim();
    if (!value) return this.validationMessages.emailRequired;
    return EMAIL_PATTERN.test(value) ? undefined : this.validationMessages.emailInvalid;
  });

  readonly phoneError = computed<string | undefined>(() => {
    if (!this.submitted() && !this.phoneTouched()) return undefined;
    const value = this.phone().trim();
    if (!value) return this.validationMessages.phoneRequired;
    return PHONE_PATTERN.test(value) ? undefined : this.validationMessages.phoneInvalid;
  });

  readonly messageError = computed<string | undefined>(() => {
    if (!this.submitted() && !this.messageTouched()) return undefined;
    return this.message().trim() ? undefined : this.validationMessages.messageRequired;
  });

  readonly isValid = computed(
    () =>
      this.name().trim().length > 0 &&
      EMAIL_PATTERN.test(this.email().trim()) &&
      PHONE_PATTERN.test(this.phone().trim()) &&
      this.message().trim().length > 0,
  );

  protected onSubmit(event: Event): void {
    event.preventDefault();
    this.submitted.set(true);
    if (!this.isValid()) return;
    this.submit(this.buildRequest());
  }

  private buildRequest(): ContactRequest {
    return {
      name: this.name().trim(),
      email: this.email().trim(),
      phone: this.phone().trim(),
      company: this.company().trim(),
      message: this.message().trim(),
    };
  }

  private submit(request: ContactRequest): void {
    void request;
    this.sent.set(true);
    this.resetForm();
  }

  private resetForm(): void {
    this.name.set('');
    this.email.set('');
    this.phone.set('');
    this.company.set('');
    this.message.set('');
    this.nameTouched.set(false);
    this.emailTouched.set(false);
    this.phoneTouched.set(false);
    this.messageTouched.set(false);
    this.submitted.set(false);
  }
}
