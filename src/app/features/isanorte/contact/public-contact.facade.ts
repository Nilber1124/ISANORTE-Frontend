import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import { PublicContactRequest } from '../../../data/models/contact/public-contact-request.model';
import {
  PublicPageResponse,
  PublicPageType,
} from '../../../data/models/public-content/public-page.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

@Injectable()
export class PublicContactFacade {
  private readonly api = inject(PublicContentApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly _page = signal<PublicPageResponse | null>(null);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);
  private requestInFlight = false;

  readonly nombre = signal('');
  readonly email = signal('');
  readonly telefono = signal('');
  readonly empresa = signal('');
  readonly mensaje = signal('');
  readonly submitted = signal(false);
  readonly nombreTouched = signal(false);
  readonly emailTouched = signal(false);
  readonly telefonoTouched = signal(false);
  readonly empresaTouched = signal(false);
  readonly mensajeTouched = signal(false);
  readonly submitting = signal(false);
  readonly submitSuccess = signal(false);
  readonly submitError = signal<string | null>(null);

  readonly page = this._page.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly content = computed(() => this.page()?.contenido ?? null);
  readonly seo = computed(() => this.page()?.seo ?? null);
  readonly nombreError = computed(() => this.textError(this.nombre(), this.nombreTouched(), 150, 'Ingresa tu nombre completo.'));
  readonly emailError = computed(() => {
    if (!this.shouldShowError(this.emailTouched())) return undefined;
    const value = this.email().trim();
    if (!value) return 'Ingresa tu correo electrónico.';
    if (!EMAIL_PATTERN.test(value)) return 'Ingresa un correo electrónico válido.';
    return value.length > 180 ? 'El correo no puede superar 180 caracteres.' : undefined;
  });
  readonly telefonoError = computed(() => this.textError(this.telefono(), this.telefonoTouched(), 30, 'Ingresa tu teléfono de contacto.'));
  readonly empresaError = computed(() => this.optionalTextError(this.empresa(), this.empresaTouched(), 180));
  readonly mensajeError = computed(() => this.textError(this.mensaje(), this.mensajeTouched(), 5000, 'Cuéntanos brevemente sobre tu proyecto.'));
  readonly isValid = computed(
    () =>
      !this.nombreErrorForValue() &&
      !this.emailErrorForValue() &&
      !this.telefonoErrorForValue() &&
      !this.empresaErrorForValue() &&
      !this.mensajeErrorForValue(),
  );

  load(): void {
    if (this.requestInFlight) return;

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
        next: (page) => this._page.set(page),
        error: () => {
          this._page.set(null);
          this._error.set('No pudimos cargar el contenido de Contacto.');
        },
      });
  }

  submit(): void {
    this.submitted.set(true);
    this.submitSuccess.set(false);
    this.submitError.set(null);
    if (this.submitting() || !this.isValid()) return;

    this.submitting.set(true);
    this.api
      .submitContact(this.request())
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this.submitting.set(false)),
      )
      .subscribe({
        next: () => {
          this.submitSuccess.set(true);
          this.resetForm();
        },
        error: (error: unknown) => this.submitError.set(this.submitMessage(error)),
      });
  }

  dismissSubmitSuccess(): void {
    this.submitSuccess.set(false);
  }

  private request(): PublicContactRequest {
    const empresa = this.empresa().trim();
    return {
      nombre: this.nombre().trim(),
      email: this.email().trim(),
      telefono: this.telefono().trim(),
      empresa: empresa || null,
      mensaje: this.mensaje().trim(),
    };
  }

  private resetForm(): void {
    this.nombre.set('');
    this.email.set('');
    this.telefono.set('');
    this.empresa.set('');
    this.mensaje.set('');
    this.submitted.set(false);
    this.nombreTouched.set(false);
    this.emailTouched.set(false);
    this.telefonoTouched.set(false);
    this.empresaTouched.set(false);
    this.mensajeTouched.set(false);
  }

  private shouldShowError(touched: boolean): boolean {
    return this.submitted() || touched;
  }

  private textError(value: string, touched: boolean, maxLength: number, requiredMessage: string): string | undefined {
    if (!this.shouldShowError(touched)) return undefined;
    const normalized = value.trim();
    if (!normalized) return requiredMessage;
    return normalized.length > maxLength ? `Este campo no puede superar ${maxLength} caracteres.` : undefined;
  }

  private optionalTextError(value: string, touched: boolean, maxLength: number): string | undefined {
    if (!this.shouldShowError(touched)) return undefined;
    return value.trim().length > maxLength ? `Este campo no puede superar ${maxLength} caracteres.` : undefined;
  }

  private nombreErrorForValue(): boolean {
    const value = this.nombre().trim();
    return !value || value.length > 150;
  }

  private emailErrorForValue(): boolean {
    const value = this.email().trim();
    return !value || !EMAIL_PATTERN.test(value) || value.length > 180;
  }

  private telefonoErrorForValue(): boolean {
    const value = this.telefono().trim();
    return !value || value.length > 30;
  }

  private empresaErrorForValue(): boolean {
    return this.empresa().trim().length > 180;
  }

  private mensajeErrorForValue(): boolean {
    const value = this.mensaje().trim();
    return !value || value.length > 5000;
  }

  private submitMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse && error.status === 400) {
      return 'Revisa los datos ingresados e inténtalo nuevamente.';
    }
    return 'No pudimos enviar tu mensaje. Inténtalo nuevamente.';
  }
}
