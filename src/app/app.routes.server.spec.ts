import { RenderMode } from '@angular/ssr';

import { serverRoutes } from './app.routes.server';

describe('server routes', () => {
  it('prerenders the static public pages and renders guarded or dynamic pages on the client', () => {
    const modes = (paths: string[]) =>
      paths.map((path) => serverRoutes.find((route) => route.path === path)?.renderMode);

    expect(
      modes(['', 'nosotros', 'servicios', 'proyectos', 'contacto', 'isadecor', 'isadecor/catalogo', 'isadecor/carrito']),
    ).toEqual([
      RenderMode.Prerender,
      RenderMode.Prerender,
      RenderMode.Prerender,
      RenderMode.Prerender,
      RenderMode.Prerender,
      RenderMode.Prerender,
      RenderMode.Prerender,
      RenderMode.Prerender,
    ]);

    expect(
      modes([
        'isadecor/cotizacion',
        'isadecor/ingresar',
        'isadecor/mi-cuenta',
        'isadecor/productos/:slug',
        'proyectos/:slug',
      ]),
    ).toEqual([
      RenderMode.Client,
      RenderMode.Client,
      RenderMode.Client,
      RenderMode.Client,
      RenderMode.Client,
    ]);
  });

  it('keeps the admin area on the client and the unmatched fallback prerendered', () => {
    expect(serverRoutes.find((route) => route.path === 'admin/**')?.renderMode).toBe(RenderMode.Client);
    expect(serverRoutes.at(-1)).toEqual({ path: '**', renderMode: RenderMode.Prerender });
  });
});
