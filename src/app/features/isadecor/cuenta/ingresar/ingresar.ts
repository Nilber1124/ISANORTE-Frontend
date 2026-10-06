import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, finalize } from 'rxjs';

import { ClienteAuthService } from '../../../../core/auth/cliente-auth.service';
import { ClienteAuthResponse } from '../../../../data/models/cliente/cliente.model';
import { Alert } from '../../../../shared/components/alert/alert';
import { Button } from '../../../../shared/components/button/button';

type ModoAcceso = 'ingresar' | 'registrar';

const DESTINO_POR_DEFECTO = '/isadecor/mi-cuenta';

@Component({
  selector: 'app-isadecor-ingresar',
  imports: [Alert, Button],
  templateUrl: './ingresar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IsadecorIngresar {
  private readonly auth = inject(ClienteAuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly modo = signal<ModoAcceso>('ingresar');
  readonly nombre = signal('');
  readonly apellido = signal('');
  readonly email = signal('');
  readonly telefono = signal('');
  readonly password = signal('');
  readonly aceptaDatos = signal(false);
  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  cambiarModo(modo: ModoAcceso): void {
    this.modo.set(modo);
    this.error.set(null);
  }

  submit(event: Event): void {
    event.preventDefault();
    if (this.loading()) return;

    const validation = this.validar();
    if (validation) {
      this.error.set(validation);
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    this.solicitud()
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl(this.destino()),
        error: (error: unknown) => this.error.set(this.mensajeError(error)),
      });
  }

  valor(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  private solicitud(): Observable<ClienteAuthResponse> {
    const email = this.email().trim();
    if (this.modo() === 'registrar') {
      return this.auth.registrar({
        nombre: this.nombre().trim(),
        apellido: this.apellido().trim() || null,
        email,
        password: this.password(),
        telefono: this.telefono().trim() || null,
        aceptaTratamientoDatos: this.aceptaDatos(),
      });
    }
    return this.auth.login({ email, password: this.password() });
  }

  private validar(): string | null {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email().trim())) {
      return 'Ingresa un correo electrónico válido.';
    }
    if (this.modo() === 'ingresar') {
      return this.password() ? null : 'Ingresa tu contraseña.';
    }
    if (!this.nombre().trim()) return 'Ingresa tu nombre.';
    if (this.password().length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
    if (!this.aceptaDatos()) return 'Debes aceptar el tratamiento de tus datos personales.';
    return null;
  }

  private destino(): string {
    const requested = this.route.snapshot.queryParamMap.get('returnUrl');
    return requested && requested.startsWith('/isadecor') && !requested.startsWith('//')
      ? requested
      : DESTINO_POR_DEFECTO;
  }

  private mensajeError(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'No pudimos completar la solicitud. Inténtalo nuevamente.';
    }
    if (error.status === 0) {
      return 'No fue posible conectar con el servidor. Inténtalo nuevamente.';
    }
    if (error.status === 401) {
      return 'Correo o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.';
    }
    if (error.status === 409) {
      return this.mensajeBackend(error) ?? 'Ya existe una cuenta con este correo.';
    }
    if (error.status === 400) {
      return 'Revisa los datos: la contraseña debe tener al menos 8 caracteres y debes aceptar el tratamiento de tus datos.';
    }
    return 'No pudimos completar la solicitud. Inténtalo nuevamente.';
  }

  private mensajeBackend(error: HttpErrorResponse): string | null {
    const message = (error.error as { message?: unknown } | null)?.message;
    return typeof message === 'string' ? message : null;
  }
}
