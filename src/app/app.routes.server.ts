import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Server,
  },
  {
    path: 'nosotros',
    renderMode: RenderMode.Server,
  },
  {
    path: 'servicios',
    renderMode: RenderMode.Server,
  },
  {
    path: 'proyectos',
    renderMode: RenderMode.Server,
  },
  {
    path: 'contacto',
    renderMode: RenderMode.Server,
  },
  {
    path: 'isadecor',
    renderMode: RenderMode.Server,
  },
  {
    path: 'isadecor/catalogo',
    renderMode: RenderMode.Server,
  },
  {
    path: 'isadecor/cotizacion',
    renderMode: RenderMode.Server,
  },
  {
    path: 'isadecor/productos/:slug',
    renderMode: RenderMode.Server,
  },
  {
    path: 'admin/**',
    renderMode: RenderMode.Prerender,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
