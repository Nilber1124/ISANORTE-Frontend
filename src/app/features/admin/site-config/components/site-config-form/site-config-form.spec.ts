import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyResponse } from '../../../../../data/models/company/company-response.model';
import { SiteConfigResponse } from '../../../../../data/models/site-config/site-config-response.model';
import { SiteConfigForm, SiteConfigFormSubmission } from './site-config-form';

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
  colorPrimario: '#111',
  colorSecundario: '#fff',
  textoPiePagina: ' Pie exacto ',
  empresa: { id: company.id, nombreComercial: company.nombreComercial },
  secciones: [],
  fechaActualizacion: null,
};

describe('SiteConfigForm', () => {
  let fixture: ComponentFixture<SiteConfigForm>;

  async function createForm(
    mode: 'create' | 'edit',
    companies: readonly CompanyResponse[],
    currentConfig: SiteConfigResponse | null = null,
  ) {
    await TestBed.configureTestingModule({ imports: [SiteConfigForm] }).compileComponents();
    fixture = TestBed.createComponent(SiteConfigForm);
    fixture.componentRef.setInput('mode', mode);
    fixture.componentRef.setInput('companies', companies);
    fixture.componentRef.setInput('config', currentConfig);
    fixture.componentRef.setInput('loadingFormData', false);
    fixture.detectChanges();
    return fixture.componentInstance;
  }

  it('blocks creation and explains the missing company', async () => {
    const component = await createForm('create', []);
    const saved: SiteConfigFormSubmission[] = [];
    component.saved.subscribe((value) => saved.push(value));
    const button = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll('button'),
    ).find((item) => item.textContent?.includes('Crear configuración'));
    expect(button?.hasAttribute('disabled')).toBe(true);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'Primero registra una empresa',
    );
    expect(saved).toEqual([]);
  });

  it('preselects the only company and creates without sections', async () => {
    const component = await createForm('create', [company]);
    const saved: SiteConfigFormSubmission[] = [];
    component.saved.subscribe((value) => saved.push(value));
    component.textoPiePagina.set(' Pie exacto ');
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((item) => item.textContent?.includes('Crear configuración'))
      ?.click();
    expect(saved[0].mode).toBe('create');
    if (saved[0].mode === 'create') {
      expect(saved[0].request.empresaId).toBe(company.id);
      expect(saved[0].request.textoPiePagina).toBe(' Pie exacto ');
      expect('secciones' in saved[0].request).toBe(false);
    }
  });

  it('shows a select when multiple companies exist', async () => {
    await createForm('create', [
      company,
      { ...company, id: 'company-2', nombreComercial: 'ISADECOR' },
    ]);
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('#site-config-company'),
    ).not.toBeNull();
  });

  it('rejects a public key outside the backend pattern', async () => {
    const component = await createForm('edit', [company], config);
    const saved: SiteConfigFormSubmission[] = [];
    component.saved.subscribe((value) => saved.push(value));
    component.clave.set('ISA Norte');
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((item) => item.textContent?.includes('Guardar cambios'))
      ?.click();
    fixture.detectChanges();
    expect(saved).toEqual([]);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('minúsculas');
  });

  it('shows the company read-only and emits only update fields on edit', async () => {
    const component = await createForm('edit', [company], config);
    const saved: SiteConfigFormSubmission[] = [];
    component.saved.subscribe((value) => saved.push(value));
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('La empresa no se puede cambiar');
    expect(element.querySelector('#site-config-company')).toBeNull();
    Array.from(element.querySelectorAll('button'))
      .find((item) => item.textContent?.includes('Guardar cambios'))
      ?.click();
    expect(saved[0].mode).toBe('edit');
    if (saved[0].mode === 'edit') {
      expect(Object.keys(saved[0].request).sort()).toEqual([
        'clave',
        'colorPrimario',
        'colorSecundario',
        'descripcionSitio',
        'faviconUrl',
        'logoBlancoUrl',
        'logoUrl',
        'textoPiePagina',
        'tituloSitio',
      ]);
      expect(saved[0].request.textoPiePagina).toBe(' Pie exacto ');
      expect(saved[0].request.clave).toBe('isanorte');
    }
  });

  it('renders image previews and text color fields', async () => {
    await createForm('edit', [company], config);
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelectorAll('img')).toHaveLength(3);
    expect(element.querySelector('#site-config-primary-color')?.getAttribute('type')).toBe('text');
    expect(element.querySelector('#site-config-secondary-color')?.getAttribute('type')).toBe(
      'text',
    );
  });
});
