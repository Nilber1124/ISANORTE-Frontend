import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyResponse } from '../../../data/models/company/company-response.model';
import { SiteConfigResponse } from '../../../data/models/site-config/site-config-response.model';
import { AdminSiteConfig } from './admin-site-config';
import { AdminSiteConfigFacade, SiteConfigFormMode } from './admin-site-config.facade';

const company: CompanyResponse = {
  id: 'company-1',
  razonSocial: 'ISANORTE SAC',
  nombreComercial: 'ISANORTE',
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
  estadisticas: null,
  fechaCreacion: null,
  fechaActualizacion: null,
};

const config: SiteConfigResponse = {
  id: 'config-1',
  clave: 'isanorte',
  tituloSitio: 'ISANORTE',
  descripcionSitio: 'Descripción',
  logoUrl: 'https://example.com/logo.png',
  logoBlancoUrl: 'https://example.com/logo-white.png',
  faviconUrl: 'https://example.com/favicon.png',
  colorPrimario: '#111111',
  colorSecundario: '#f97316',
  textoPiePagina: 'Pie configurado',
  empresa: { id: company.id, nombreComercial: company.nombreComercial },
  secciones: [],
  fechaActualizacion: null,
};

class FacadeStub {
  readonly configs = signal<readonly SiteConfigResponse[]>([config]);
  readonly companies = signal<readonly CompanyResponse[]>([company]);
  readonly selectedConfig = signal<SiteConfigResponse | null>(config);
  readonly loading = signal(false);
  readonly loadingFormData = signal(false);
  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly formOpen = signal(false);
  readonly formMode = signal<SiteConfigFormMode>('create');
  createOpens = 0;
  editOpens = 0;
  selections: string[] = [];
  load() {}
  openCreate() {
    this.createOpens++;
  }
  openEdit() {
    this.editOpens++;
  }
  selectConfig(id: string) {
    this.selections.push(id);
    this.selectedConfig.set(this.configs().find((item) => item.id === id) ?? null);
  }
  closeForm() {}
  create() {}
  update() {}
}

describe('AdminSiteConfig', () => {
  let fixture: ComponentFixture<AdminSiteConfig>;
  let facade: FacadeStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AdminSiteConfig] })
      .overrideComponent(AdminSiteConfig, {
        set: { providers: [{ provide: AdminSiteConfigFacade, useClass: FacadeStub }] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(AdminSiteConfig);
    facade = fixture.debugElement.injector.get(AdminSiteConfigFacade) as unknown as FacadeStub;
    fixture.detectChanges();
  });

  it('renders the EmptyState and creation action', () => {
    facade.configs.set([]);
    facade.selectedConfig.set(null);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'No hay configuración de sitio registrada.',
    );
    const button = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((item) => item.textContent?.includes('Crear configuración'));
    button?.click();
    expect(facade.createOpens).toBe(1);
  });

  it('renders configuration data, logo previews and color fields', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Identidad del sitio');
    expect(element.textContent).toContain('Empresa asociada');
    expect(element.textContent).toContain('Pie configurado');
    expect(element.querySelectorAll('img')).toHaveLength(3);
    expect(element.textContent).toContain('#111111');
    expect(element.textContent).toContain('#f97316');
  });

  it('opens configuration editing', () => {
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((item) => item.textContent?.includes('Editar configuración'))
      ?.click();
    expect(facade.editOpens).toBe(1);
  });

  it('requires explicit selection for multiple configurations', () => {
    const second = { ...config, id: 'config-2', tituloSitio: 'Segundo sitio' };
    facade.configs.set([config, second]);
    facade.selectedConfig.set(null);
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Selecciona una configuración',
    );
    const selector = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((item) => item.textContent?.includes('Segundo sitio'));
    selector?.click();
    expect(facade.selections).toEqual([second.id]);
  });
});
