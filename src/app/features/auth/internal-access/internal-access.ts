import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../../core/auth/auth.service';
import { Alert } from '../../../shared/components/alert/alert';
import { Button } from '../../../shared/components/button/button';

@Component({
  selector: 'app-internal-access',
  imports: [Alert, Button],
  templateUrl: './internal-access.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InternalAccess {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly email = signal('');
  readonly password = signal('');
  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  submit(event: Event): void {
    event.preventDefault();
    const email = this.email().trim();
    if (this.loading() || !email || !this.password()) {
      this.error.set('Ingresa tu correo electrónico y contraseña.');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.auth.login({ email, password: this.password() }).pipe(
      finalize(() => this.loading.set(false)),
    ).subscribe({
      next: () => {
        const requested = this.route.snapshot.queryParamMap.get('returnUrl');
        const destination = requested?.startsWith('/admin') ? requested : '/admin';
        void this.router.navigateByUrl(destination);
      },
      error: (error: unknown) => {
        this.error.set(error instanceof HttpErrorResponse && error.status === 0
          ? 'No fue posible conectar con el servidor. Inténtalo nuevamente.'
          : 'Correo o contraseña incorrectos. Revisa los datos e inténtalo de nuevo.');
      },
    });
  }

  updateEmail(event: Event): void { this.email.set((event.target as HTMLInputElement).value); }
  updatePassword(event: Event): void { this.password.set((event.target as HTMLInputElement).value); }
}
