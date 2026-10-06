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
    expect(element.querySelector('h1')?.textContent).toContain('Panel administrativo');
    expect(element.querySelectorAll('nav[aria-label="Navegación administrativa"] a')).toHaveLength(
      9,
    );
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
