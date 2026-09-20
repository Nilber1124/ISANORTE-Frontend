import { RenderMode } from '@angular/ssr';

import { serverRoutes } from './app.routes.server';

describe('server routes', () => {
  it('renders the canonical Home per request instead of prerendering it', () => {
    expect(serverRoutes.find((route) => route.path === '')?.renderMode).toBe(RenderMode.Server);
    expect(serverRoutes.at(-1)).toEqual({ path: '**', renderMode: RenderMode.Prerender });
  });
});
