import { RenderMode } from '@angular/ssr';

import { serverRoutes } from './app.routes.server';

describe('server routes', () => {
  it('renders every route under PublicLayout per request instead of freezing global content', () => {
    const publicPaths = [
      '',
      'nosotros',
      'servicios',
      'proyectos',
      'contacto',
      'isadecor',
      'isadecor/catalogo',
      'isadecor/cotizacion',
      'isadecor/productos/:slug',
    ];

    expect(
      publicPaths.map((path) => serverRoutes.find((route) => route.path === path)?.renderMode),
    ).toEqual(publicPaths.map(() => RenderMode.Server));
  });

  it('keeps Admin and unmatched technical routing modes unchanged', () => {
    expect(serverRoutes.find((route) => route.path === 'admin/**')?.renderMode).toBe(
      RenderMode.Prerender,
    );
    expect(serverRoutes.at(-1)).toEqual({ path: '**', renderMode: RenderMode.Prerender });
  });
});
