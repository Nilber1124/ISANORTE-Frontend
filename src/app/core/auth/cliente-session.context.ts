import { HttpContext, HttpContextToken } from '@angular/common/http';

/** Marca las peticiones que requieren la sesión de cliente (cotizar, comparar y cuenta). */
export const REQUIERE_SESION_CLIENTE = new HttpContextToken<boolean>(() => false);

export function conSesionCliente(): HttpContext {
  return new HttpContext().set(REQUIERE_SESION_CLIENTE, true);
}
