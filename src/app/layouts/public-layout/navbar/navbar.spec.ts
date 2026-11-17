import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PublicSiteFacade } from '../public-site.facade';
import { Navbar } from './navbar';

describe('Navbar', () => {
  let fixture: ComponentFixture<Navbar>;
  let whatsappNumber: ReturnType<typeof signal<string | null>>;

  beforeEach(async () => {
    whatsappNumber = signal<string | null>('51999111222');
    const facade = {
      brandLogoWhite: signal<string | null>('/logo-white.svg'),
      brandLogo: signal<string | null>('/logo.svg'),
      siteName: signal('Marca Backend'),
      whatsappHref: signal<string | null>('https://wa.me/51999111222'),
      whatsappNumber,
      contactPhones: signal<readonly string[]>(['+51 999 111 222']),
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

    const desktopLinks = Array.from(nav.querySelectorAll('.hidden.nav-md\\:flex a')).map((link) =>
      link.getAttribute('href'),
    );
    expect(desktopLinks.filter((href) => href?.startsWith('/'))).toEqual([
      '/',
      '/nosotros',
      '/servicios',
      '/proyectos',
      '/isadecor',
      '/contacto',
    ]);
    expect(nav.querySelector('app-button')).toBeNull();
  });

  it('links ISADECOR directly in a new tab, without a units selector or a separate store button', () => {
    const nav = fixture.nativeElement as HTMLElement;
    const isadecor = nav.querySelectorAll('a[href="/isadecor"]');
    expect(isadecor).toHaveLength(1);
    expect(isadecor[0].textContent?.trim()).toBe('ISADECOR');
    expect(isadecor[0].getAttribute('target')).toBe('_blank');
    expect(nav.textContent).not.toContain('Unidades de negocio');
    expect(nav.textContent).not.toContain('Tienda');
    expect(nav.querySelector('#business-units-desktop-menu')).toBeNull();
  });

  it('exposes corporate routes and ISADECOR in the mobile menu', () => {
    const nav = fixture.nativeElement as HTMLElement;
    const menuButton = nav.querySelector(
      'button[aria-controls="public-mobile-menu"]',
    ) as HTMLButtonElement;
    menuButton.click();
    fixture.detectChanges();

    const mobileMenu = nav.querySelector('#public-mobile-menu') as HTMLElement;
    expect(menuButton.getAttribute('aria-expanded')).toBe('true');
    expect(mobileMenu.querySelector('a[href="/nosotros"]')).toBeTruthy();
    expect(mobileMenu.querySelector('a[href="/isadecor"]')?.textContent?.trim()).toBe('ISADECOR');
    expect(mobileMenu.textContent).not.toContain('Tienda');
  });

  it('shows only WhatsApp when it is the same number as the phone', () => {
    const nav = fixture.nativeElement as HTMLElement;
    expect(nav.querySelector('a[href^="tel:"]')).toBeNull();
    expect(nav.querySelectorAll('a[href="https://wa.me/51999111222"]')).toHaveLength(2);
  });

  it('shows the phone too when it differs from the WhatsApp number', () => {
    whatsappNumber.set('51988777666');
    fixture.detectChanges();
    const nav = fixture.nativeElement as HTMLElement;
    expect(nav.querySelector('a[href="tel:+51999111222"]')).toBeTruthy();
  });

  it('keeps WhatsApp and the quote button one tap away in the header', () => {
    const nav = fixture.nativeElement as HTMLElement;
    const whatsapp = nav.querySelectorAll('a[href="https://wa.me/51999111222"]');
    // Una versión de escritorio y otra móvil.
    expect(whatsapp).toHaveLength(2);
    expect(whatsapp[0].getAttribute('target')).toBe('_blank');
    expect(nav.querySelector('a[href="/contacto"]')?.textContent?.trim()).toBe('Cotizar');
  });

  it('closes the open mobile menu with Escape', () => {
    const component = fixture.componentInstance;
    component.toggleMobileMenu();
    fixture.detectChanges();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();
    expect(component.mobileMenuOpen()).toBe(false);
  });
});
