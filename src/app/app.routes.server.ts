import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Rutas públicas con contenido dinámico del backend: SSR en runtime.
  // Prerender requeriría BACKEND_ORIGIN durante el build, lo que bloquea
  // despliegues sin el backend disponible en CI/CD.
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
    path: 'isadecor/carrito',
    renderMode: RenderMode.Server,
  },
  {
    path: 'isadecor/cotizacion',
    renderMode: RenderMode.Client,
  },
  {
    path: 'proyectos/:slug',
    renderMode: RenderMode.Client,
  },
  {
    path: 'isadecor/ingresar',
    renderMode: RenderMode.Client,
  },
  {
    path: 'isadecor/mi-cuenta',
    renderMode: RenderMode.Client,
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
    renderMode: RenderMode.Client,
  },
];
