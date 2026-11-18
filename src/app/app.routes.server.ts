import { RenderMode, ServerRoute } from '@angular/ssr';

// Vercel solo publica archivos estáticos (no ejecuta el servidor de Angular),
// por lo que todas las rutas se resuelven en el cliente.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
