import { InjectionToken } from '@angular/core';

/**
 * URL base del backend Spring Boot.
 *
 * El valor predeterminado corresponde al servidor de desarrollo documentado
 * en OpenAPI. Puede sustituirse con un provider en el bootstrap de cada
 * entorno sin modificar los ApiServices.
 */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL', {
  providedIn: 'root',
  factory: () => 'http://localhost:8080',
});
