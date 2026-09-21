import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { routes } from './app.routes';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the application router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).toBeTruthy();
  });

  it('should expose every current public route', () => {
    const publicRoute = routes.find((route) => route.path === '');
    expect(publicRoute?.children?.map((route) => route.path)).toEqual([
      '',
      'nosotros',
      'servicios',
      'proyectos',
      'contacto',
    ]);
  });

  it('should keep ISADECOR routes isolated from the public layout', () => {
    const isadecorRoute = routes.find((route) => route.path === 'isadecor');
    const publicRoute = routes.find((route) => route.path === '');

    expect(isadecorRoute?.component).toBeTruthy();
    expect(isadecorRoute?.component).not.toBe(publicRoute?.component);
    expect(isadecorRoute?.loadComponent).toBeUndefined();
    expect(isadecorRoute?.children?.map((route) => route.path)).toEqual([
      '',
      'catalogo',
      'cotizacion',
      'productos/:slug',
    ]);
    expect(publicRoute?.children?.some((route) => route.path?.startsWith('isadecor'))).toBe(false);
  });

  it('should keep admin routes isolated from the public layout', () => {
    const adminRoute = routes.find((route) => route.path === 'admin');
    const publicRoute = routes.find((route) => route.path === '');

    expect(adminRoute?.loadComponent).toBeTruthy();
    expect(adminRoute?.component).toBeUndefined();
    expect(adminRoute?.loadComponent).not.toBe(publicRoute?.loadComponent);
    expect(adminRoute?.children?.map((route) => route.path)).toEqual([
      '',
      'categorias',
      'productos',
      'cotizaciones',
      'proyectos',
      'proyectos/:id',
      'servicios',
      'unidades-negocio',
      'empresa',
      'landing',
      'configuracion',
      'contenido',
      'contacto',
    ]);
  });

  it('should lazy-load AdminLanding for the admin landing route', async () => {
    const adminRoute = routes.find((route) => route.path === 'admin');
    const landingRoute = adminRoute?.children?.find((route) => route.path === 'landing');

    expect(landingRoute?.component).toBeUndefined();
    expect(landingRoute?.loadComponent).toBeTypeOf('function');

    const loadedComponent = await landingRoute?.loadComponent?.();
    const [{ AdminLanding }, { AdminModulePlaceholder }] = await Promise.all([
      import('./features/admin/landing/admin-landing'),
      import('./features/admin/module-placeholder/admin-module-placeholder'),
    ]);

    expect(loadedComponent).toBe(AdminLanding);
    expect(loadedComponent).not.toBe(AdminModulePlaceholder);
  });
});
