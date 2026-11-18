import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';

import { ClienteAuthService } from './cliente-auth.service';
import { REQUIERE_SESION_CLIENTE } from './cliente-session.context';

/**
 * Adjunta el token de cliente solo a las peticiones marcadas con conSesionCliente().
 * Así el token de cliente nunca viaja a rutas públicas, donde un token expirado daría 401.
 */
export const clienteAuthInterceptor: HttpInterceptorFn = (request, next) => {
  if (!request.context.get(REQUIERE_SESION_CLIENTE)) {
    return next(request);
  }

  const auth = inject(ClienteAuthService);
  const token = auth.token();
  if (!token) {
    return next(request);
  }

  return next(request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse && error.status === 401) {
        auth.logout();
      }
      return throwError(() => error);
    }),
  );
};
