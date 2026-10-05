import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'nosotros',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'servicios',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'proyectos',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'contacto',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'isadecor',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'isadecor/catalogo',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'isadecor/carrito',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'isadecor/cotizacion',
    renderMode: RenderMode.Prerender,
  },
  {
    path: 'isadecor/productos/:slug',
    renderMode: RenderMode.Client,
  },
  {
    path: 'admin/**',
    renderMode: RenderMode.Client,
  },
  {
    path: 'acceso-interno',
    renderMode: RenderMode.Client,
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender,
  },
];
