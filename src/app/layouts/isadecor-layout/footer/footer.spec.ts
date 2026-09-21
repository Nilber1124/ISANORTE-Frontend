import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PublicSiteFacade } from '../../public-layout/public-site.facade';
import { Footer } from './footer';

describe('Isadecor Footer', () => {
  let fixture: ComponentFixture<Footer>;
  let facade: {
    hasContactDetails: ReturnType<typeof signal<boolean>>;
    contactEmails: ReturnType<typeof signal<readonly string[]>>;
    contactPhones: ReturnType<typeof signal<readonly string[]>>;
    address: ReturnType<typeof signal<string | null>>;
    city: ReturnType<typeof signal<string | null>>;
  };

  beforeEach(async () => {
    facade = {
      hasContactDetails: signal(true),
      contactEmails: signal<readonly string[]>(['isadecor@example.com']),
      contactPhones: signal<readonly string[]>(['+593 98 765 4321']),
      address: signal<string | null>('Av. República del Salvador 100'),
      city: signal<string | null>('Quito'),
    };

    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([]), { provide: PublicSiteFacade, useValue: facade }],
    }).compileComponents();

    fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
  });

  it('renders dynamic contact emails, phones and location from facade', () => {
    const footer = fixture.nativeElement as HTMLElement;
    expect(footer.querySelector('a[href="mailto:isadecor@example.com"]')).toBeTruthy();
    expect(footer.querySelector('a[href="tel:+593 98 765 4321"]')).toBeTruthy();
    expect(footer.textContent).toContain('Av. República del Salvador 100');
    expect(footer.textContent).toContain('Quito');
    expect(footer.textContent).not.toContain('hola@isanorte.com');
  });

  it('preserves ISADECOR branding, navigation and static footer copy', () => {
    const footer = fixture.nativeElement as HTMLElement;
    expect(footer.textContent).toContain('ISADECOR');
    expect(footer.textContent).toContain('Acabados y revestimientos para interiores');
    expect(footer.querySelector('a[href="/isadecor"]')).toBeTruthy();
    expect(footer.querySelector('a[href="/isadecor/catalogo"]')).toBeTruthy();
    expect(footer.querySelector('a[href="/isadecor/cotizacion"]')).toBeTruthy();
    expect(footer.textContent).toContain('© 2025 ISADECOR. Todos los derechos reservados.');
  });

  it('hides the contact section when there are no contact details', () => {
    facade.hasContactDetails.set(false);
    facade.contactEmails.set([]);
    facade.contactPhones.set([]);
    facade.address.set(null);
    facade.city.set(null);
    fixture.detectChanges();

    const footer = fixture.nativeElement as HTMLElement;
    expect(footer.textContent).not.toContain('Contacto');
    expect(footer.querySelector('a[href^="mailto:"]')).toBeNull();
    expect(footer.querySelector('a[href^="tel:"]')).toBeNull();
  });
});
