import { Provider } from '@angular/core';

import { API_BASE_URL } from './api.config';

type ServerEnvironment = Readonly<Record<string, string | undefined>>;

declare const process: { readonly env: ServerEnvironment };

export const BACKEND_ORIGIN_ENV = 'BACKEND_ORIGIN';

export function resolveBackendOrigin(environment: ServerEnvironment = process.env): string {
  const configuredOrigin = environment[BACKEND_ORIGIN_ENV]?.trim();
  if (!configuredOrigin) {
    throw new Error(
      `${BACKEND_ORIGIN_ENV} es obligatorio para renderizar contenido público en SSR.`,
    );
  }

  let origin: URL;
  try {
    origin = new URL(configuredOrigin);
  } catch {
    throw new Error(`${BACKEND_ORIGIN_ENV} debe ser una URL absoluta HTTP o HTTPS.`);
  }

  if (!['http:', 'https:'].includes(origin.protocol) || origin.origin === 'null') {
    throw new Error(`${BACKEND_ORIGIN_ENV} debe ser una URL absoluta HTTP o HTTPS.`);
  }

  return origin.origin;
}

export const SERVER_API_BASE_URL_PROVIDER: Provider = {
  provide: API_BASE_URL,
  useFactory: resolveBackendOrigin,
};
