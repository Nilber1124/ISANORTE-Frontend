import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';

import { routes } from '../../app.routes';

describe('AdminLayout', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideRouter(routes)] });
  });

  it('renders the admin layout, navigation and dashboard at /admin', async () => {
    const harness = await RouterTestingHarness.create('/admin');
    const element = harness.routeNativeElement as HTMLElement;

    expect(element.querySelector('app-admin-topbar')).toBeTruthy();
    expect(element.querySelector('app-admin-sidebar')).toBeTruthy();
    expect(element.querySelector('h1')?.textContent).toContain('Panel administrativo');
    expect(element.querySelectorAll('nav[aria-label="Navegación administrativa"] a')).toHaveLength(
      10,
    );
  });

  it('marks Dashboard active only at the exact /admin route', async () => {
    const harness = await RouterTestingHarness.create('/admin');
    let element = harness.routeNativeElement as HTMLElement;
    const dashboardLink = element.querySelector(
      'nav[aria-label="Navegación administrativa"] a[href="/admin"]',
    );
    expect(dashboardLink?.getAttribute('aria-current')).toBe('page');

    await harness.navigateByUrl('/admin/productos');
    element = harness.routeNativeElement as HTMLElement;
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
    const element = harness.routeNativeElement as HTMLElement;
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
