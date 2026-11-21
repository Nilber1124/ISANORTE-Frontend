import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from '../../app.routes';

/** /admin está protegido por authGuard: la prueba necesita una sesión de administrador vigente. */
function sesionAdministradorVigente(): string {
  const encode = (value: object) => btoa(JSON.stringify(value));
  const exp = Math.floor(Date.now() / 1000) + 3600;
  return `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: 'admin@example.com', exp })}.firma`;
}

describe('AdminLayout', () => {
  beforeEach(() => {
    sessionStorage.setItem('isanorte.admin.token', sesionAdministradorVigente());
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  afterEach(() => sessionStorage.clear());

  it('renders the admin layout, navigation and dashboard at /admin', async () => {
    const harness = await RouterTestingHarness.create('/admin');
    const element = harness.fixture.nativeElement as HTMLElement;

    expect(element.querySelector('app-admin-topbar')).toBeTruthy();
    expect(element.querySelector('app-admin-sidebar')).toBeTruthy();
    expect(element.querySelector('h1')?.textContent).toContain('ISANORTE Admin');
  });

  it('groups the navigation by brand and folds the groups away from the current page', async () => {
    const harness = await RouterTestingHarness.create('/admin');
    const element = harness.fixture.nativeElement as HTMLElement;
    const nav = element.querySelector('nav[aria-label="Navegación administrativa"]') as HTMLElement;
    const groupButton = (text: string) =>
      Array.from(nav.querySelectorAll('button')).find((b) => b.textContent?.includes(text));

    expect(groupButton('ISADECOR')).toBeTruthy();
    expect(groupButton('ISANORTE')).toBeTruthy();
    // El grupo de Home está plegado al inicio; abrirlo muestra sus enlaces.
    expect(nav.querySelector('a[href="/admin/home-isadecor/hero"]')).toBeNull();
    groupButton('Home')?.click();
    harness.detectChanges();
    expect(nav.querySelector('a[href="/admin/home-isadecor/hero"]')).toBeTruthy();
  });

  it('opens the group of the current page and filters the menu with the search box', async () => {
    const harness = await RouterTestingHarness.create('/admin/sitio/equipo');
    const element = harness.fixture.nativeElement as HTMLElement;
    const nav = element.querySelector('nav[aria-label="Navegación administrativa"]') as HTMLElement;
    expect(nav.querySelector('a[href="/admin/sitio/equipo"]')).toBeTruthy();

    const search = element.querySelector('#admin-nav-search') as HTMLInputElement;
    search.value = 'reseñas';
    search.dispatchEvent(new Event('input'));
    harness.detectChanges();
    const links = Array.from(nav.querySelectorAll('a')).map((a) => a.textContent?.trim());
    expect(links).toEqual(['Reseñas del Home']);
  });

  it('marks Dashboard active only at the exact /admin route', async () => {
    const harness = await RouterTestingHarness.create('/admin');
    let element = harness.fixture.nativeElement as HTMLElement;
    const dashboardLink = element.querySelector(
      'nav[aria-label="Navegación administrativa"] a[href="/admin"]',
    );
    expect(dashboardLink?.getAttribute('aria-current')).toBe('page');

    await harness.navigateByUrl('/admin/productos');
    element = harness.fixture.nativeElement as HTMLElement;
    expect(
      element
        .querySelector('nav[aria-label="Navegación administrativa"] a[href="/admin"]')
        ?.getAttribute('aria-current'),
    ).toBeNull();
    expect(element.querySelector('a[href="/admin/productos"]')?.getAttribute('aria-current')).toBe(
      'page',
    );
  });

  it('opens and closes the mobile navigation from native buttons', async () => {
    const harness = await RouterTestingHarness.create('/admin');
    const element = harness.fixture.nativeElement as HTMLElement;
    const menuButton = element.querySelector(
      'button[aria-controls="admin-sidebar"]',
    ) as HTMLButtonElement;

    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
    menuButton.click();
    harness.detectChanges();
    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
    expect(element.querySelector('#admin-sidebar')?.classList.contains('translate-x-0')).toBe(true);

    (
      element.querySelector('button[aria-label="Cerrar menú administrativo"]') as HTMLButtonElement
    ).click();
    harness.detectChanges();
    expect(menuButton.getAttribute('aria-expanded')).toBe('false');
  });
});
