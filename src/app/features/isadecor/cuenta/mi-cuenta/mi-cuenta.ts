import { DatePipe, DecimalPipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink } from '@angular/router';

import { ClienteAuthService } from '../../../../core/auth/cliente-auth.service';
import { ClienteApiService } from '../../../../data/services/cliente-api.service';
import { PublicQuoteResponse } from '../../../../data/models/public-content/public-quote.model';
import { QuoteStatus } from '../../../../data/models/quote/quote-status.enum';
import { Alert } from '../../../../shared/components/alert/alert';
import { Badge, BadgeVariant } from '../../../../shared/components/badge/badge';
import { Loading } from '../../../../shared/components/loading/loading';

const CERRADAS: readonly QuoteStatus[] = [QuoteStatus.CERRADA, QuoteStatus.CANCELADA];

const ESTADO_VARIANTS: Record<QuoteStatus, BadgeVariant> = {
  [QuoteStatus.NUEVA]: 'info',
  [QuoteStatus.EN_REVISION]: 'warning',
  [QuoteStatus.CONTACTADA]: 'accent',
  [QuoteStatus.COTIZADA]: 'success',
  [QuoteStatus.CERRADA]: 'neutral',
  [QuoteStatus.CANCELADA]: 'error',
};

const ESTADO_LABELS: Record<QuoteStatus, string> = {
  [QuoteStatus.NUEVA]: 'Nueva',
  [QuoteStatus.EN_REVISION]: 'En revisión',
  [QuoteStatus.CONTACTADA]: 'Contactada',
  [QuoteStatus.COTIZADA]: 'Cotizada',
  [QuoteStatus.CERRADA]: 'Cerrada',
  [QuoteStatus.CANCELADA]: 'Cancelada',
};

@Component({
  selector: 'app-isadecor-mi-cuenta',
  imports: [Alert, Badge, DatePipe, DecimalPipe, Loading, RouterLink],
  templateUrl: './mi-cuenta.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MiCuenta {
  private readonly auth = inject(ClienteAuthService);
  private readonly api = inject(ClienteApiService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly cliente = this.auth.cliente;
  readonly cotizaciones = signal<readonly PublicQuoteResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);

  readonly nombreCompleto = computed(() => {
    const cliente = this.cliente();
    return cliente ? [cliente.nombre, cliente.apellido].filter(Boolean).join(' ') : '';
  });
  readonly iniciales = computed(() => {
    const cliente = this.cliente();
    if (!cliente) return '';
    return [cliente.nombre, cliente.apellido]
      .filter(Boolean)
      .map((parte) => parte!.trim().charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  });
  readonly totalCotizaciones = computed(() => this.cotizaciones().length);
  readonly cotizacionesEnCurso = computed(
    () => this.cotizaciones().filter((c) => !CERRADAS.includes(c.estado)).length,
  );

  constructor() {
    // Solo en el navegador: la página es de render en cliente y depende de la sesión local.
    afterNextRender(() => this.cargarCotizaciones());
  }

  estadoLabel(estado: QuoteStatus): string {
    return ESTADO_LABELS[estado] ?? estado;
  }

  estadoVariant(estado: QuoteStatus): BadgeVariant {
    return ESTADO_VARIANTS[estado] ?? 'neutral';
  }

  cerrarSesion(): void {
    this.auth.logout();
    void this.router.navigateByUrl('/isadecor');
  }

  private cargarCotizaciones(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .misCotizaciones()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cotizaciones) => {
          this.cotizaciones.set(cotizaciones);
          this.loading.set(false);
        },
        error: (error: unknown) => {
          this.loading.set(false);
          if (error instanceof HttpErrorResponse && error.status === 401) {
            void this.router.navigate(['/isadecor/ingresar'], {
              queryParams: { returnUrl: '/isadecor/mi-cuenta' },
            });
            return;
          }
          this.error.set('No pudimos cargar tus cotizaciones. Inténtalo nuevamente.');
        },
      });
  }
}
