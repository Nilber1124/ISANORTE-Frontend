import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ClienteAuthService } from './cliente-auth.service';

export const clienteGuard: CanActivateFn = (_route, state) => {
  const auth = inject(ClienteAuthService);
  return auth.token() !== null
    ? true
    : inject(Router).createUrlTree(['/isadecor/ingresar'], { queryParams: { returnUrl: state.url } });
};
