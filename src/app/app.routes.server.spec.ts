import { RenderMode } from '@angular/ssr';

import { serverRoutes } from './app.routes.server';

describe('server routes', () => {
  // Vercel publica la aplicación como archivos estáticos y no ejecuta el servidor de Angular,
  // así que ninguna ruta puede depender de SSR ni de prerender: todas se resuelven en el cliente.
  it('renders every route on the client with a single catch-all', () => {
    expect(serverRoutes).toEqual([{ path: '**', renderMode: RenderMode.Client }]);
  });

  it('does not prerender or server-render any route', () => {
    expect(serverRoutes.some((route) => route.renderMode !== RenderMode.Client)).toBe(false);
  });
});
