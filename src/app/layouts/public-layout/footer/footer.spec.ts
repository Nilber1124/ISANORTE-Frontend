import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { PublicSiteFacade } from '../public-site.facade';
import { Footer } from './footer';

describe('Footer', () => {
  let fixture: ComponentFixture<Footer>;
  let facade: {
    brandLogoWhite: ReturnType<typeof signal<string | null>>;
    brandLogo: ReturnType<typeof signal<string | null>>;
    siteName: ReturnType<typeof signal<string>>;
    companyName: ReturnType<typeof signal<string>>;
    companySummary: ReturnType<typeof signal<string | null>>;
    presentableSocialNetworks: ReturnType<
      typeof signal<readonly { nombre: string; url: string; icono: string | null; orden: number }[]>
    >;
    hasContactDetails: ReturnType<typeof signal<boolean>>;
    contactEmails: ReturnType<typeof signal<readonly string[]>>;
    contactPhones: ReturnType<typeof signal<readonly string[]>>;
    address: ReturnType<typeof signal<string | null>>;
    city: ReturnType<typeof signal<string | null>>;
    footerText: ReturnType<typeof signal<string | null>>;
  };

  beforeEach(async () => {
    facade = {
      brandLogoWhite: signal<string | null>('/footer-logo.svg'),
      brandLogo: signal<string | null>(null),
      siteName: signal('Sitio Backend'),
      companyName: signal('Empresa Backend'),
      companySummary: signal<string | null>('Resumen corporativo backend'),
      presentableSocialNetworks: signal([
        {
          nombre: 'LinkedIn real',
          url: 'https://linkedin.example/company',
          icono: 'linkedin',
          orden: 0,
        },
      ]),
      hasContactDetails: signal(true),
      contactEmails: signal<readonly string[]>(['contacto@example.com']),
      contactPhones: signal<readonly string[]>(['+51 555 0101']),
      address: signal<string | null>('Av. Backend 123'),
      city: signal<string | null>('Ciudad Backend'),
      footerText: signal<string | null>('Empresa Backend. Todos los derechos reservados.'),
    };

    await TestBed.configureTestingModule({
      imports: [Footer],
      providers: [provideRouter([]), { provide: PublicSiteFacade, useValue: facade }],
    }).compileComponents();
    fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
  });

  it('renders backend branding, summary, contact, networks and footer text', () => {
    const footer = fixture.nativeElement as HTMLElement;
    expect(footer.querySelector('img')?.getAttribute('src')).toBe('/footer-logo.svg');
    expect(footer.textContent).toContain('Empresa Backend');
    expect(footer.textContent).toContain('Resumen corporativo backend');
    expect(footer.textContent).toContain('Av. Backend 123');
    expect(footer.textContent).toContain('Ciudad Backend');
    expect(footer.querySelector('a[href="mailto:contacto@example.com"]')).toBeTruthy();
    expect(footer.querySelector('a[href="tel:+51 555 0101"]')).toBeTruthy();
    expect(footer.querySelector('a[href="https://linkedin.example/company"]')).toBeTruthy();
    expect(footer.textContent).toContain('Empresa Backend. Todos los derechos reservados.');
    expect(footer.textContent).toContain(`© ${new Date().getFullYear()}`);
  });

  it('keeps corporate navigation, one structural Services link and no fake legal links', () => {
    const footer = fixture.nativeElement as HTMLElement;
    expect(footer.querySelector('a[href="/"]')).toBeTruthy();
    expect(footer.querySelector('a[href="/nosotros"]')).toBeTruthy();
    expect(footer.querySelector('a[href="/proyectos"]')).toBeTruthy();
    expect(footer.querySelector('a[href="/contacto"]')).toBeTruthy();
    expect(footer.querySelectorAll('a[href="/servicios"]')).toHaveLength(2);
    expect(footer.querySelector('a[href="#"]')).toBeNull();
    expect(footer.querySelector('a[href="/isadecor"]')).toBeNull();
    expect(footer.textContent).not.toContain('Construcción');
    expect(footer.textContent).not.toContain('Acabados Premium');
    expect(footer.textContent).not.toContain('Diseño e Interiorismo');
    expect(footer.textContent).not.toContain('Arquitectura');
  });

  it('does not invent optional backend data after a successful empty response', () => {
    facade.brandLogoWhite.set(null);
    facade.companyName.set('');
    facade.companySummary.set(null);
    facade.presentableSocialNetworks.set([]);
    facade.hasContactDetails.set(false);
    facade.contactEmails.set([]);
    facade.contactPhones.set([]);
    facade.address.set(null);
    facade.city.set(null);
    facade.footerText.set(null);
    fixture.detectChanges();

    const footer = fixture.nativeElement as HTMLElement;
    expect(footer.textContent).not.toContain('Resumen corporativo backend');
    expect(footer.textContent).not.toContain('Quito');
    expect(footer.textContent).not.toContain('+593');
    expect(footer.querySelector('[aria-label="Redes sociales"]')).toBeNull();
    expect(footer.textContent).not.toContain('CONTACTO');
    expect(footer.textContent).toContain(`© ${new Date().getFullYear()}`);
  });
});
