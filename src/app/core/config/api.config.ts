import { InjectionToken } from '@angular/core';

/**
 * Prefijo anterior a las rutas `/api` del backend Spring Boot.
 *
 * En el navegador se deja vacío para utilizar URLs del mismo origen y el
 * proxy del servidor de desarrollo. Puede sustituirse con un provider por
 * entorno (incluido SSR) sin modificar los ApiServices.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => '',
});
