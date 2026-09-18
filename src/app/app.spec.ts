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
      'isadecor/catalogo',
      'isadecor/cotizacion',
      'isadecor/productos/:slug',
      'isadecor',
    ]);
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
      'servicios',
      'unidades-negocio',
      'empresa',
      'landing',
      'configuracion',
    ]);
  });
});
