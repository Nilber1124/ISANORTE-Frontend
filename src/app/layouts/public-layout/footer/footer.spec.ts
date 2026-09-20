import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BusinessUnitResponse } from '../../../data/models/business-unit/business-unit-response.model';
import { CompanyResponse } from '../../../data/models/company/company-response.model';
import { SiteConfigResponse } from '../../../data/models/site-config/site-config-response.model';
import { PublicLayoutFacade, PublicLayoutResourceState } from '../public-layout.facade';
import { Footer } from './footer';

@Component({ template: '' })
class RouteStub {}

const company: CompanyResponse = {
  id: 'company-1',
  razonSocial: 'Norte Ingeniería SAC',
  nombreComercial: 'Norte Dinámico',
  ruc: '20123456789',
  direccion: 'Av. Industrial 123',
  ciudad: 'Lima',
  telefono: '+51 999 111 222',
  telefonoSecundario: null,
  email: 'contacto@norte.pe',
  emailVentas: null,
  whatsapp: '+51 (999) 111-222',
  horarioAtencion: null,
  mision: null,
  vision: null,
  valores: null,
  resumenNosotros: 'Resumen corporativo administrado.',
  redesSociales: [
    {
      id: 'instagram',
      nombre: 'Instagram',
      url: 'https://instagram.com/norte',
      icono: 'instagram',
      orden: 2,
      activo: true,
    },
    {
      id: 'linkedin',
      nombre: 'LinkedIn',
      url: 'https://linkedin.com/company/norte',
      icono: 'linkedin',
      orden: 0,
      activo: true,
    },
    {
      id: 'facebook-disabled',
      nombre: 'Facebook',
      url: 'https://facebook.com/norte',
      icono: 'facebook',
      orden: 1,
      activo: false,
    },
  ],
  fechaCreacion: null,
  fechaActualizacion: null,
};

const siteConfig: SiteConfigResponse = {
  id: 'config-1',
  tituloSitio: 'Título configurado',
  descripcionSitio: null,
  logoUrl: '/images/logo-normal.png',
  logoBlancoUrl: '/images/logo-blanco.png',
  faviconUrl: null,
  colorPrimario: null,
  colorSecundario: null,
  textoPiePagina: 'Pie configurado exactamente.',
  empresa: { id: company.id, nombreComercial: company.nombreComercial },
  secciones: null,
  fechaActualizacion: null,
};

const isadecor: BusinessUnitResponse = {
  id: 'unit-isadecor',
  nombre: 'ISADECOR',
  slug: 'isadecor',
  descripcion: null,
  icono: null,
  imagenUrl: null,
  activo: true,
  orden: 0,
  empresa: { id: company.id, nombreComercial: company.nombreComercial },
  fechaCreacion: null,
  fechaActualizacion: null,
};

class PublicLayoutFacadeStub {
  company = signal<CompanyResponse | null>(company);
  siteConfig = signal<SiteConfigResponse | null>(siteConfig);
  businessUnits = signal<readonly BusinessUnitResponse[]>([isadecor]);
  hasAmbiguousCompany = signal(false);
  hasAmbiguousSiteConfig = signal(false);
  companyState = signal<PublicLayoutResourceState>('success');
  siteConfigState = signal<PublicLayoutResourceState>('success');
  businessUnitsState = signal<PublicLayoutResourceState>('success');
}

describe('Footer', () => {
  let fixture: ComponentFixture<Footer>;
  let facade: PublicLayoutFacadeStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Footer],
      providers: [
        PublicLayoutFacadeStub,
        { provide: PublicLayoutFacade, useExisting: PublicLayoutFacadeStub },
        provideRouter([
          { path: '', component: RouteStub },
          { path: 'nosotros', component: RouteStub },
          { path: 'servicios', component: RouteStub },
          { path: 'proyectos', component: RouteStub },
          { path: 'contacto', component: RouteStub },
          { path: 'isadecor', component: RouteStub },
        ]),
      ],
    });
    facade = TestBed.inject(PublicLayoutFacadeStub);
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(Footer);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the company name and summary from API data', () => {
    const element = render();
    expect(element.textContent).toContain('Norte Dinámico');
    expect(element.textContent).toContain('Resumen corporativo administrado.');
  });

  it('combines the real address and city without demo locations', () => {
    const element = render();
    expect(element.textContent).toContain('Av. Industrial 123, Lima');
    expect(element.textContent).not.toContain('Quito, Ecuador');
  });

  it('creates actionable telephone and email links', () => {
    const element = render();
    expect(element.querySelector('a[href="tel:+51 999 111 222"]')?.textContent).toContain(
      '+51 999 111 222',
    );
    expect(element.querySelector('a[href="mailto:contacto@norte.pe"]')?.textContent).toContain(
      'contacto@norte.pe',
    );
  });

  it('builds a safe WhatsApp URL without adding a country code', () => {
    const link = render().querySelector<HTMLAnchorElement>('a[href^="https://wa.me/"]');
    expect(link?.getAttribute('href')).toBe('https://wa.me/51999111222');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
  });

  it('shows only active social networks and preserves order zero', () => {
    const socials = [...render().querySelectorAll<HTMLElement>('[data-social-id]')];
    expect(socials.map((social) => social.dataset['socialId'])).toEqual(['linkedin', 'instagram']);
    expect(render().querySelector('[data-social-id="facebook-disabled"]')).toBeNull();
  });

  it('opens external social links safely and exposes accessible names', () => {
    const link = render().querySelector<HTMLAnchorElement>('[data-social-id="linkedin"]');
    expect(link?.getAttribute('target')).toBe('_blank');
    expect(link?.getAttribute('rel')).toBe('noopener noreferrer');
    expect(link?.getAttribute('aria-label')).toBe('Visitar LinkedIn');
  });

  it('prefers the white footer logo and falls back to the regular logo', () => {
    let logo = render().querySelector<HTMLImageElement>('footer img');
    expect(logo?.getAttribute('src')).toBe('/images/logo-blanco.png');

    logo?.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    logo = fixture.nativeElement.querySelector('footer img');
    expect(logo?.getAttribute('src')).toBe('/images/logo-normal.png');
  });

  it('renders textoPiePagina exactly as configured', () => {
    expect(render().textContent).toContain('Pie configurado exactamente.');
  });

  it('uses a current Angular year when textoPiePagina is null', () => {
    facade.siteConfig.set({ ...siteConfig, textoPiePagina: null });
    expect(render().textContent).toContain(`© ${new Date().getFullYear()} Norte Dinámico.`);
  });

  it('does not revive demo company data after a successful response with null fields', () => {
    facade.company.set({
      ...company,
      direccion: null,
      ciudad: null,
      telefono: null,
      email: null,
      whatsapp: null,
      resumenNosotros: null,
      redesSociales: null,
    });
    const element = render();
    expect(element.textContent).not.toContain('Quito, Ecuador');
    expect(element.textContent).not.toContain('hola@isanorte.com');
    expect(element.textContent).not.toContain('+593 (0) 999 999 999');
    expect(element.querySelectorAll('[data-social-id]')).toHaveLength(0);
  });

  it('keeps configuration data when only the company resource fails', () => {
    facade.company.set(null);
    facade.companyState.set('error');
    const element = render();
    expect(element.textContent).toContain('Quito, Ecuador');
    expect(element.textContent).toContain('Pie configurado exactamente.');
    expect(element.querySelector('footer img')?.getAttribute('src')).toBe(
      '/images/logo-blanco.png',
    );
  });

  it('uses only the Angular services route instead of a second demo collection', () => {
    const element = render();
    expect(element.textContent).toContain('Todos los servicios');
    expect(element.textContent).not.toContain('Acabados Premium');
    expect(element.querySelector('a[href="/servicios"]')).not.toBeNull();
  });
});
