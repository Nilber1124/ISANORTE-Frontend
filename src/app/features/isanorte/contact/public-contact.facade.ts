import { DOCUMENT } from '@angular/common';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Meta, Title } from '@angular/platform-browser';
import { finalize } from 'rxjs';

import { PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import {
  PublicPageResponse,
  PublicPageType,
} from '../../../data/models/public-content/public-page.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { PublicSiteFacade } from '../../../layouts/public-layout/public-site.facade';
import {
  PublicPageSeoDefaults,
  DEFAULT_SHARE_IMAGE,
  applyPublicPageSeo,
  clearPublicPageSeo,
} from '../../../shared/utils/public-page-seo.util';
import { isValidEmail } from '../../../shared/utils/text';

/** Datos del formulario que viajan en el mensaje de WhatsApp. */
export interface ContactMessageData {
  nombre: string;
  telefono: string;
  email: string;
  empresa: string;
  servicio: string;
  ubicacion: string;
  mensaje: string;
}

/** Texto de WhatsApp con la solicitud: una línea por dato que se haya llenado. */
export function buildContactWhatsappMessage(data: ContactMessageData): string {
  const lines = ['Hola, quisiera cotizar un proyecto con ISANORTE.', ''];
  const add = (label: string, value: string): void => {
    if (value.trim()) lines.push(`*${label}:* ${value.trim()}`);
  };
  add('Nombre', data.nombre);
  add('Teléfono', data.telefono);
  add('Correo', data.email);
  add('Empresa', data.empresa);
  add('Servicio de interés', data.servicio);
  add('Ubicación', data.ubicacion);
  add('Mensaje', data.mensaje);
  return lines.join('\n');
}

/**
 * El formulario no guarda nada en el sistema: al enviarlo abre WhatsApp con los datos escritos en el mensaje,
 * que es por donde se atienden las solicitudes.
 */
@Injectable()
export class PublicContactFacade {
  private readonly api = inject(PublicContentApiService);
  private readonly site = inject(PublicSiteFacade, { optional: true });
  private readonly destroyRef = inject(DestroyRef);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT, { optional: true });

  private readonly seoDefaults: PublicPageSeoDefaults = {
    title: 'Contacto | ISANORTE Cajamarca',
    description:
      'Escríbenos por WhatsApp o llámanos para cotizar tu obra en Cajamarca.',
    automatic: true,
    imageUrl: DEFAULT_SHARE_IMAGE,
  };

  private readonly _page = signal<PublicPageResponse | null>(null);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);
  private requestInFlight = false;
  private destroyed = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      clearPublicPageSeo(this.title, this.meta);
    });
  }

  readonly nombre = signal('');
  readonly email = signal('');
  readonly telefono = signal('');
  readonly empresa = signal('');
  readonly mensaje = signal('');
  /** Servicio de interés (opcional). */
  readonly servicio = signal('');
  /** Ubicación del terreno u obra (opcional). */
  readonly ubicacion = signal('');
  /** Autorización para usar los datos y responder la solicitud; es obligatoria para enviar. */
  readonly consentimiento = signal(false);
  readonly submitted = signal(false);
  readonly nombreTouched = signal(false);
  readonly emailTouched = signal(false);
  readonly telefonoTouched = signal(false);
  readonly empresaTouched = signal(false);
  readonly mensajeTouched = signal(false);
  readonly ubicacionTouched = signal(false);
  readonly consentimientoTouched = signal(false);
  readonly submitSuccess = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly page = this._page.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly content = computed(() => this.page()?.contenido ?? null);
  readonly seo = computed(() => this.page()?.seo ?? null);
  readonly nombreError = computed(() =>
    this.textError(this.nombre(), this.nombreTouched(), 150, 'Ingresa tu nombre completo.'),
  );
  readonly emailError = computed(() => {
    if (!this.shouldShowError(this.emailTouched())) return undefined;
    const value = this.email().trim();
    if (!value) return 'Ingresa tu correo electrónico.';
    if (!isValidEmail(value)) return 'Ingresa un correo electrónico válido.';
    return value.length > 180 ? 'El correo no puede superar 180 caracteres.' : undefined;
  });
  readonly telefonoError = computed(() =>
    this.textError(this.telefono(), this.telefonoTouched(), 30, 'Ingresa tu teléfono de contacto.'),
  );
  readonly empresaError = computed(() =>
    this.optionalTextError(this.empresa(), this.empresaTouched(), 180),
  );
  /** El mensaje es opcional: solo se valida su largo máximo. */
  readonly mensajeError = computed(() =>
    this.optionalTextError(this.mensaje(), this.mensajeTouched(), 4000),
  );
  readonly ubicacionError = computed(() =>
    this.optionalTextError(this.ubicacion(), this.ubicacionTouched(), 150),
  );
  readonly consentimientoError = computed(() =>
    this.shouldShowError(this.consentimientoTouched()) && !this.consentimiento()
      ? 'Debes aceptar para poder enviar tu solicitud.'
      : undefined,
  );
  readonly isValid = computed(
    () =>
      !this.nombreErrorForValue() &&
      !this.emailErrorForValue() &&
      !this.telefonoErrorForValue() &&
      !this.empresaErrorForValue() &&
      !this.mensajeErrorForValue() &&
      !this.ubicacionErrorForValue() &&
      this.consentimiento(),
  );

  load(): void {
    if (this.destroyed || this.requestInFlight) return;

    this.requestInFlight = true;
    this._loading.set(true);
    this._error.set(null);
    this.api
      .getPage(PUBLIC_SITE_KEY, PublicPageType.CONTACTO)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.requestInFlight = false;
          this._loading.set(false);
        }),
      )
      .subscribe({
        next: (page) => {
          if (this.destroyed) return;
          this._page.set(page);
          applyPublicPageSeo(this.title, this.meta, page, this.seoDefaults, this.document);
        },
        error: () => {
          if (this.destroyed) return;
          this._page.set(null);
          this._error.set('No pudimos cargar el contenido de Contacto.');
          applyPublicPageSeo(this.title, this.meta, null, this.seoDefaults, this.document);
        },
      });
  }

  submit(): void {
    this.submitted.set(true);
    this.submitSuccess.set(false);
    this.submitError.set(null);
    if (!this.isValid()) return;

    const href = this.site?.whatsappHrefFor(
      buildContactWhatsappMessage({
        nombre: this.nombre(),
        telefono: this.telefono(),
        email: this.email(),
        empresa: this.empresa(),
        servicio: this.servicio(),
        ubicacion: this.ubicacion(),
        mensaje: this.mensaje(),
      }),
    );
    if (!href) {
      this.submitError.set(
        'Por ahora no podemos abrir WhatsApp. Escríbenos por correo o llámanos a los datos de contacto.',
      );
      return;
    }
    this.document?.defaultView?.open(href, '_blank', 'noopener');
    this.submitSuccess.set(true);
    this.resetForm();
  }

  dismissSubmitSuccess(): void {
    this.submitSuccess.set(false);
  }

  private resetForm(): void {
    this.nombre.set('');
    this.email.set('');
    this.telefono.set('');
    this.empresa.set('');
    this.mensaje.set('');
    this.servicio.set('');
    this.ubicacion.set('');
    this.consentimiento.set(false);
    this.submitted.set(false);
    this.nombreTouched.set(false);
    this.emailTouched.set(false);
    this.telefonoTouched.set(false);
    this.empresaTouched.set(false);
    this.mensajeTouched.set(false);
    this.ubicacionTouched.set(false);
    this.consentimientoTouched.set(false);
  }

  private shouldShowError(touched: boolean): boolean {
    return this.submitted() || touched;
  }

  private textError(
    value: string,
    touched: boolean,
    maxLength: number,
    requiredMessage: string,
  ): string | undefined {
    if (!this.shouldShowError(touched)) return undefined;
    const normalized = value.trim();
    if (!normalized) return requiredMessage;
    return normalized.length > maxLength
      ? `Este campo no puede superar ${maxLength} caracteres.`
      : undefined;
  }

  private optionalTextError(
    value: string,
    touched: boolean,
    maxLength: number,
  ): string | undefined {
    if (!this.shouldShowError(touched)) return undefined;
    return value.trim().length > maxLength
      ? `Este campo no puede superar ${maxLength} caracteres.`
      : undefined;
  }

  private nombreErrorForValue(): boolean {
    const value = this.nombre().trim();
    return !value || value.length > 150;
  }

  private emailErrorForValue(): boolean {
    const value = this.email().trim();
    return !value || !isValidEmail(value) || value.length > 180;
  }

  private telefonoErrorForValue(): boolean {
    const value = this.telefono().trim();
    return !value || value.length > 30;
  }

  private empresaErrorForValue(): boolean {
    return this.empresa().trim().length > 180;
  }

  private mensajeErrorForValue(): boolean {
    return this.mensaje().trim().length > 4000;
  }

  private ubicacionErrorForValue(): boolean {
    return this.ubicacion().trim().length > 150;
  }
}
