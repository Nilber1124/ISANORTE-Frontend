import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PublicBusinessUnitLink, PublicSiteFacade } from '../public-site.facade';
import { Navbar } from './navbar';

describe('Navbar', () => {
  let fixture: ComponentFixture<Navbar>;
  let businessUnitLinks: ReturnType<typeof signal<readonly PublicBusinessUnitLink[]>>;

  beforeEach(async () => {
    businessUnitLinks = signal<readonly PublicBusinessUnitLink[]>([
      { name: 'ISADECOR', slug: 'isadecor', url: '/isadecor', order: 0 },
      { name: 'Unidad futura', slug: 'unidad-futura', url: '/unidad-futura', order: 1 },
    ]);
    const facade = {
      brandLogoWhite: signal<string | null>('/logo-white.svg'),
      brandLogo: signal<string | null>('/logo.svg'),
      siteName: signal('Marca Backend'),
      businessUnitLinks,
    };

    await TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([]), { provide: PublicSiteFacade, useValue: facade }],
    }).compileComponents();
    fixture = TestBed.createComponent(Navbar);
    fixture.detectChanges();
  });

  it('renders backend branding and keeps only the corporate Angular routes', () => {
    const nav = fixture.nativeElement as HTMLElement;
    const logo = nav.querySelector('img');
    expect(logo?.getAttribute('src')).toBe('/logo-white.svg');
    expect(logo?.getAttribute('alt')).toBe('Marca Backend');
    expect(nav.textContent).toContain('Marca Backend');

    const desktopLinks = Array.from(nav.querySelectorAll('.hidden.md\\:flex > a')).map((link) =>
      link.getAttribute('href'),
    );
    expect(desktopLinks).toEqual(['/', '/nosotros', '/servicios', '/proyectos', '/contacto']);
    expect(nav.textContent).not.toContain('Conoce ISADECOR');
    expect(nav.querySelector('app-button')).toBeNull();
    expect(nav.querySelector('#business-units-desktop-menu a[href="/isadecor"]')).toBeTruthy();
    expect(nav.querySelector('.hidden.md\\:flex > a[href="/isadecor"]')).toBeNull();
  });

  it('opens an accessible desktop unit selector with slug-derived backend links', () => {
    const nav = fixture.nativeElement as HTMLElement;
    const button = Array.from(nav.querySelectorAll('button')).find((candidate) =>
      candidate.textContent?.includes('Unidades de negocio'),
    ) as HTMLButtonElement;

    expect(button.getAttribute('aria-controls')).toBe('business-units-desktop-menu');
    expect(button.getAttribute('aria-expanded')).toBe('false');
    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('aria-expanded')).toBe('true');
    const menu = nav.querySelector('#business-units-desktop-menu');
    expect(menu?.querySelector('a[href="/isadecor"]')?.textContent).toContain('ISADECOR');
    expect(menu?.querySelector('a[href="/unidad-futura"]')?.textContent).toContain('Unidad futura');
    expect(nav.querySelectorAll('a[href="/isadecor"]')).toHaveLength(1);
  });

  it('does not render an empty selector after a successful empty unit list', () => {
    businessUnitLinks.set([]);
    fixture.detectChanges();

    const labels = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).map((button) => button.textContent?.trim());
    expect(labels.some((label) => label?.includes('Unidades de negocio'))).toBe(false);
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('ISADECOR');
  });

  it('exposes corporate routes and the unit accordion in the mobile menu', () => {
    const nav = fixture.nativeElement as HTMLElement;
    const menuButton = nav.querySelector(
      'button[aria-controls="public-mobile-menu"]',
    ) as HTMLButtonElement;
    menuButton.click();
    fixture.detectChanges();

    const mobileMenu = nav.querySelector('#public-mobile-menu') as HTMLElement;
    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
    expect(mobileMenu.querySelector('a[href="/nosotros"]')).toBeTruthy();

    const unitsButton = mobileMenu.querySelector(
      'button[aria-controls="business-units-mobile-menu"]',
    ) as HTMLButtonElement;
    expect(unitsButton.getAttribute('aria-expanded')).toBe('false');
    unitsButton.click();
    fixture.detectChanges();

    expect(unitsButton.getAttribute('aria-expanded')).toBe('true');
    expect(nav.querySelector('#business-units-mobile-menu a[href="/isadecor"]')).toBeTruthy();
  });

  it('closes open navigation with Escape and closes desktop selector on outside click', () => {
    const component = fixture.componentInstance;
    component.toggleDesktopUnits();
    component.toggleMobileMenu();
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(component.desktopUnitsOpen()).toBe(false);
    expect(component.mobileMenuOpen()).toBe(false);

    component.toggleDesktopUnits();
    document.body.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    expect(component.desktopUnitsOpen()).toBe(false);
  });
});
