import { HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';

import { CompanyResponse } from '../../../data/models/company/company-response.model';
import { LandingSectionType } from '../../../data/models/landing-section/landing-section-type.enum';
import { SiteConfigCreateRequest } from '../../../data/models/site-config/site-config-create-request.model';
import { SiteConfigResponse } from '../../../data/models/site-config/site-config-response.model';
import { SiteConfigUpdateRequest } from '../../../data/models/site-config/site-config-update-request.model';
import { CompanyApiService } from '../../../data/services/company-api.service';
import { SiteConfigApiService } from '../../../data/services/site-config-api.service';
import { AdminSiteConfigFacade } from './admin-site-config.facade';

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
  descripcionSitio: 'Construcción y diseño',
  logoUrl: 'https://example.com/logo.png',
  logoBlancoUrl: 'https://example.com/logo-white.png',
  faviconUrl: 'https://example.com/favicon.png',
  colorPrimario: '#111111',
  colorSecundario: '#f97316',
  textoPiePagina: 'Texto original',
  empresa: { id: company.id, nombreComercial: company.nombreComercial },
  secciones: [
    {
      id: 'section-1',
      tipo: LandingSectionType.HERO,
      etiqueta: null,
      titulo: 'Hero',
      subtitulo: null,
      contenido: null,
      imagenUrl: null,
      imagenAlt: null,
      textoBoton: null,
      enlaceBoton: null,
      orden: 1,
      visible: true,
    },
  ],
  fechaActualizacion: '2026-09-18T12:00:00Z',
};

const createRequest: SiteConfigCreateRequest = {
  empresaId: company.id,
  tituloSitio: 'Nuevo sitio',
  descripcionSitio: null,
  logoUrl: null,
  logoBlancoUrl: null,
  faviconUrl: null,
  colorPrimario: null,
  colorSecundario: null,
  textoPiePagina: 'Pie exacto ',
};

const updateRequest: SiteConfigUpdateRequest = {
  clave: 'isanorte',
  tituloSitio: 'Sitio actualizado',
  descripcionSitio: null,
  logoUrl: null,
  logoBlancoUrl: null,
  faviconUrl: null,
  colorPrimario: '#000',
  colorSecundario: null,
  textoPiePagina: 'Pie actualizado',
};

class SiteConfigApiStub {
  getAllResponse$: Observable<SiteConfigResponse[]> = of([config]);
  createResponse$: Observable<SiteConfigResponse> = of({ ...config, id: 'config-2' });
  updateResponse$: Observable<SiteConfigResponse> = of({
    ...config,
    ...updateRequest,
    clave: updateRequest.clave ?? config.clave,
  });
  getByIdResponse$: Observable<SiteConfigResponse> = of(config);
  getByIdRequests: string[] = [];
  createRequests: SiteConfigCreateRequest[] = [];
  updateRequests: Array<{ id: string; request: SiteConfigUpdateRequest }> = [];

  getAll() {
    return this.getAllResponse$;
  }

  getById(id: string) {
    this.getByIdRequests.push(id);
    return this.getByIdResponse$;
  }

  create(request: SiteConfigCreateRequest) {
    this.createRequests.push(request);
    return this.createResponse$;
  }

  update(id: string, request: SiteConfigUpdateRequest) {
    this.updateRequests.push({ id, request });
    return this.updateResponse$;
  }
}

class CompanyApiStub {
  response$: Observable<CompanyResponse[]> = of([company]);

  getAll() {
    return this.response$;
  }
}

describe('AdminSiteConfigFacade', () => {
  let facade: AdminSiteConfigFacade;
  let siteConfigApi: SiteConfigApiStub;
  let companyApi: CompanyApiStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminSiteConfigFacade,
        SiteConfigApiStub,
        CompanyApiStub,
        { provide: SiteConfigApiService, useExisting: SiteConfigApiStub },
        { provide: CompanyApiService, useExisting: CompanyApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    facade = TestBed.inject(AdminSiteConfigFacade);
    siteConfigApi = TestBed.inject(SiteConfigApiStub);
    companyApi = TestBed.inject(CompanyApiStub);
  });

  it('loads configurations', () => {
    facade.load();
    expect(facade.configs()).toEqual([config]);
    expect(facade.loading()).toBe(false);
  });

  it('loads companies', () => {
    facade.load();
    expect(facade.companies()).toEqual([company]);
    expect(facade.loadingFormData()).toBe(false);
  });

  it('represents an empty configuration list', () => {
    siteConfigApi.getAllResponse$ = of([]);
    facade.load();
    expect(facade.configs()).toEqual([]);
    expect(facade.selectedConfig()).toBeNull();
  });

  it('selects the only configuration automatically', () => {
    facade.load();
    expect(facade.selectedConfig()).toEqual(config);
  });

  it('does not select arbitrarily when multiple configurations exist', () => {
    const second = { ...config, id: 'config-2', tituloSitio: 'Segundo' };
    siteConfigApi.getAllResponse$ = of([config, second]);
    siteConfigApi.getByIdResponse$ = of(second);
    facade.load();
    expect(facade.selectedConfig()).toBeNull();
    facade.selectConfig(second.id);
    expect(facade.selectedConfig()).toEqual(second);
    expect(siteConfigApi.getByIdRequests).toEqual([second.id]);
  });

  it('creates a configuration and omits nested sections', () => {
    siteConfigApi.getAllResponse$ = of([]);
    facade.load();
    facade.openCreate();
    facade.create({ ...createRequest, secciones: [] });
    expect(siteConfigApi.createRequests).toEqual([createRequest]);
    expect(facade.formOpen()).toBe(false);
  });

  it('updates the selected configuration', () => {
    facade.load();
    facade.openEdit();
    facade.update(updateRequest);
    expect(siteConfigApi.updateRequests).toEqual([{ id: config.id, request: updateRequest }]);
    expect(facade.selectedConfig()?.tituloSitio).toBe('Sitio actualizado');
  });

  it('blocks creation when no companies exist', () => {
    companyApi.response$ = of([]);
    siteConfigApi.getAllResponse$ = of([]);
    facade.load();
    facade.openCreate();
    facade.create(createRequest);
    expect(siteConfigApi.createRequests).toHaveLength(0);
    expect(facade.error()).toContain('empresa');
    expect(facade.formOpen()).toBe(true);
  });

  it('uses the real selected company UUID on create', () => {
    facade.load();
    facade.openCreate();
    facade.create(createRequest);
    expect(siteConfigApi.createRequests[0].empresaId).toBe(company.id);
  });

  it('sends PUT without company, sections, scripts, id or timestamps', () => {
    facade.load();
    facade.openEdit();
    facade.update({
      ...updateRequest,
      empresaId: company.id,
      empresa: config.empresa,
      secciones: [],
      scriptsHead: 'unsafe',
      scriptsBody: 'unsafe',
      id: config.id,
      fechaActualizacion: config.fechaActualizacion,
    } as SiteConfigUpdateRequest);
    expect(Object.keys(siteConfigApi.updateRequests[0].request).sort()).toEqual(
      Object.keys(updateRequest).sort(),
    );
  });

  it.each([
    [400, 'no son válidos'],
    [404, 'ya no existe'],
    [409, 'conflicto'],
  ])('maps HTTP %s safely and keeps the modal open', (status, expectedMessage) => {
    facade.load();
    siteConfigApi.updateResponse$ = throwError(() => new HttpErrorResponse({ status }));
    facade.openEdit();
    facade.update(updateRequest);
    expect(facade.error()).toContain(expectedMessage);
    expect(facade.formOpen()).toBe(true);
  });

  it('returns submitting to false and prevents duplicate submissions', () => {
    const pending = new Subject<SiteConfigResponse>();
    siteConfigApi.createResponse$ = pending;
    facade.load();
    facade.openCreate();
    facade.create(createRequest);
    facade.create(createRequest);
    expect(siteConfigApi.createRequests).toHaveLength(1);
    pending.next(config);
    pending.complete();
    expect(facade.submitting()).toBe(false);
  });
});
