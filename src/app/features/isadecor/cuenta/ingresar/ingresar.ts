import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ClienteAuthForm } from '../components/cliente-auth-form/cliente-auth-form';

const DESTINO_POR_DEFECTO = '/isadecor/mi-cuenta';

@Component({ selector: 'app-isadecor-ingresar', imports: [ClienteAuthForm], templateUrl: './ingresar.html', changeDetection: ChangeDetectionStrategy.OnPush })
export class IsadecorIngresar {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  protected continuar(): void { void this.router.navigateByUrl(this.destino()); }
  private destino(): string {
    const requested = this.route.snapshot.queryParamMap.get('returnUrl');
    return requested && requested.startsWith('/isadecor') && !requested.startsWith('//') ? requested : DESTINO_POR_DEFECTO;
  }
}
