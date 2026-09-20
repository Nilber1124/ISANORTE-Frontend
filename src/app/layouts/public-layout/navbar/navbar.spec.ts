import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { BusinessUnitResponse } from '../../../data/models/business-unit/business-unit-response.model';
import { CompanyResponse } from '../../../data/models/company/company-response.model';
import { SiteConfigResponse } from '../../../data/models/site-config/site-config-response.model';
import { PublicLayoutFacade, PublicLayoutResourceState } from '../public-layout.facade';
import { Navbar } from './navbar';

@Component({ template: '' })
class RouteStub {}

const company: CompanyResponse = {
  id: 'company-1',
  razonSocial: 'Norte Ingeniería SAC',
  nombreComercial: 'Norte Dinámico',
  ruc: '20123456789',
  direccion: null,
  ciudad: null,
  telefono: null,
  telefonoSecundario: null,
  email: null,
  emailVentas: null,
  whatsapp: null,
  horarioAtencion: null,
  mision: null,
  vision: null,
  valores: null,
  resumenNosotros: null,
  redesSociales: null,
  fechaCreacion: null,
  fechaActualizacion: null,
};

const siteConfig: SiteConfigResponse = {
  id: 'config-1',
  tituloSitio: 'Título configurado',
  descripcionSitio: null,
  logoUrl: '/images/logo-dinamico.png',
  logoBlancoUrl: null,
  faviconUrl: null,
  colorPrimario: null,
  colorSecundario: null,
  textoPiePagina: null,
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

describe('Navbar', () => {
  let fixture: ComponentFixture<Navbar>;
  let facade: PublicLayoutFacadeStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Navbar],
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
    fixture = TestBed.createComponent(Navbar);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('renders the commercial name from the only company', () => {
    const element = render();
    expect(element.textContent).toContain('Norte Dinámico');
    expect(element.textContent).not.toContain('CONSTRUCCIÓN & ACABADOS');
  });

  it('renders the configured logo', () => {
    const logo = render().querySelector<HTMLImageElement>('[data-testid="navbar-brand"] img');
    expect(logo?.getAttribute('src')).toBe('/images/logo-dinamico.png');
    expect(logo?.getAttribute('alt')).toContain('Norte Dinámico');
  });

  it('keeps the visual monogram when no logo is configured', () => {
    facade.siteConfig.set({ ...siteConfig, logoUrl: null });
    const element = render();
    expect(element.querySelector('[data-testid="navbar-brand"] img')).toBeNull();
    expect(element.querySelector('[data-testid="navbar-brand"]')?.textContent).toContain('IN');
  });

  it('does not revive demo brand copy after successful empty responses', () => {
    facade.company.set(null);
    facade.siteConfig.set(null);
    const element = render();
    expect(element.textContent).not.toContain('ISANORTE');
    expect(element.textContent).not.toContain('CONSTRUCCIÓN & ACABADOS');
  });

  it('shows ISADECOR only when the active collection contains its real slug', () => {
    expect(render().querySelectorAll('[data-nav-url="/isadecor"]').length).toBeGreaterThan(0);

    facade.businessUnits.set([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[data-nav-url="/isadecor"]')).toBeNull();
  });

  it('uses the explicit fallback when company and configuration are ambiguous', () => {
    facade.company.set(null);
    facade.siteConfig.set(null);
    facade.hasAmbiguousCompany.set(true);
    facade.hasAmbiguousSiteConfig.set(true);
    expect(render().textContent).toContain('ISANORTE');
  });

  it('does not add the demo subtitle to a dynamic company actually named ISANORTE', () => {
    facade.company.set({ ...company, nombreComercial: 'ISANORTE' });
    facade.siteConfigState.set('error');
    const element = render();
    expect(element.textContent).toContain('ISANORTE');
    expect(element.textContent).not.toContain('CONSTRUCCIÓN & ACABADOS');
  });

  it('opens an accessible mobile menu with the same Angular routes', () => {
    const element = render();
    const button = element.querySelector<HTMLButtonElement>('button[aria-controls]')!;
    button.click();
    fixture.detectChanges();

    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(element.querySelector('#public-mobile-menu')).not.toBeNull();
    expect(element.querySelector('[data-mobile-nav-url="/contacto"]')).not.toBeNull();
    expect(element.querySelector('[data-mobile-nav-url="/isadecor"]')).not.toBeNull();
  });

  it('closes the mobile menu after selecting a route', () => {
    const element = render();
    element.querySelector<HTMLButtonElement>('button[aria-controls]')!.click();
    fixture.detectChanges();
    element.querySelector<HTMLAnchorElement>('[data-mobile-nav-url="/nosotros"]')!.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.mobileMenuOpen()).toBe(false);
    expect(element.querySelector('#public-mobile-menu')).toBeNull();
  });

  it('closes the mobile menu with Escape and returns focus to its button', () => {
    const element = render();
    const button = element.querySelector<HTMLButtonElement>('button[aria-controls]')!;
    button.click();
    fixture.detectChanges();
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
    fixture.detectChanges();

    expect(fixture.componentInstance.mobileMenuOpen()).toBe(false);
    expect(document.activeElement).toBe(button);
  });
});
