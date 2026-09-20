import { PLATFORM_ID, TransferState } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';

import { API_BASE_URL } from '../../core/config/api.config';
import { BusinessUnitResponse } from '../../data/models/business-unit/business-unit-response.model';
import { CompanyResponse } from '../../data/models/company/company-response.model';
import { SiteConfigResponse } from '../../data/models/site-config/site-config-response.model';
import { BusinessUnitApiService } from '../../data/services/business-unit-api.service';
import { CompanyApiService } from '../../data/services/company-api.service';
import { SiteConfigApiService } from '../../data/services/site-config-api.service';
import { PublicLayoutFacade } from './public-layout.facade';

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
  fechaCreacion: null,
  fechaActualizacion: null,
};

const siteConfig: SiteConfigResponse = {
  id: 'config-1',
  tituloSitio: 'ISANORTE',
  descripcionSitio: null,
  logoUrl: null,
  logoBlancoUrl: null,
  faviconUrl: null,
  colorPrimario: null,
  colorSecundario: null,
  textoPiePagina: null,
  empresa: { id: company.id, nombreComercial: company.nombreComercial },
  secciones: null,
  fechaActualizacion: null,
};

const businessUnit: BusinessUnitResponse = {
  id: 'unit-1',
  nombre: 'ISADECOR',
  slug: 'isadecor',
  descripcion: null,
  icono: null,
  imagenUrl: null,
  activo: true,
  orden: 1,
  empresa: { id: company.id, nombreComercial: company.nombreComercial },
  fechaCreacion: null,
  fechaActualizacion: null,
};

class CompanyApiStub {
  response$: Observable<CompanyResponse[]> = of([company]);
  calls = 0;

  getAll(): Observable<CompanyResponse[]> {
    this.calls += 1;
    return this.response$;
  }
}

class SiteConfigApiStub {
  response$: Observable<SiteConfigResponse[]> = of([siteConfig]);
  calls = 0;

  getAll(): Observable<SiteConfigResponse[]> {
    this.calls += 1;
    return this.response$;
  }
}

class BusinessUnitApiStub {
  response$: Observable<BusinessUnitResponse[]> = of([businessUnit]);
  activeCalls = 0;

  getActive(): Observable<BusinessUnitResponse[]> {
    this.activeCalls += 1;
    return this.response$;
  }
}

describe('PublicLayoutFacade', () => {
  let facade: PublicLayoutFacade;
  let companyApi: CompanyApiStub;
  let siteConfigApi: SiteConfigApiStub;
  let businessUnitApi: BusinessUnitApiStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PublicLayoutFacade,
        CompanyApiStub,
        SiteConfigApiStub,
        BusinessUnitApiStub,
        { provide: CompanyApiService, useExisting: CompanyApiStub },
        { provide: SiteConfigApiService, useExisting: SiteConfigApiStub },
        { provide: BusinessUnitApiService, useExisting: BusinessUnitApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    facade = TestBed.inject(PublicLayoutFacade);
    companyApi = TestBed.inject(CompanyApiStub);
    siteConfigApi = TestBed.inject(SiteConfigApiStub);
    businessUnitApi = TestBed.inject(BusinessUnitApiStub);
  });

  it('loads the company list', () => {
    facade.load();
    expect(facade.companies()).toEqual([company]);
    expect(companyApi.calls).toBe(1);
  });

  it('loads the site configuration list', () => {
    facade.load();
    expect(facade.siteConfigs()).toEqual([siteConfig]);
    expect(siteConfigApi.calls).toBe(1);
  });

  it('loads only active business units', () => {
    facade.load();
    expect(facade.businessUnits()).toEqual([businessUnit]);
    expect(businessUnitApi.activeCalls).toBe(1);
  });

  it('represents zero companies without selecting one', () => {
    companyApi.response$ = of([]);
    facade.load();
    expect(facade.company()).toBeNull();
    expect(facade.hasAmbiguousCompany()).toBe(false);
  });

  it('selects the only company', () => {
    facade.load();
    expect(facade.company()).toBe(company);
    expect(facade.hasAmbiguousCompany()).toBe(false);
  });

  it('does not select a company when several exist', () => {
    companyApi.response$ = of([company, { ...company, id: 'company-2' }]);
    facade.load();
    expect(facade.company()).toBeNull();
    expect(facade.hasAmbiguousCompany()).toBe(true);
  });

  it('represents zero site configurations without selecting one', () => {
    siteConfigApi.response$ = of([]);
    facade.load();
    expect(facade.siteConfig()).toBeNull();
    expect(facade.hasAmbiguousSiteConfig()).toBe(false);
  });

  it('selects the only site configuration', () => {
    facade.load();
    expect(facade.siteConfig()).toBe(siteConfig);
    expect(facade.hasAmbiguousSiteConfig()).toBe(false);
  });

  it('does not select a site configuration when several exist', () => {
    siteConfigApi.response$ = of([siteConfig, { ...siteConfig, id: 'config-2' }]);
    facade.load();
    expect(facade.siteConfig()).toBeNull();
    expect(facade.hasAmbiguousSiteConfig()).toBe(true);
  });

  it('keeps successful resources available when another request fails', () => {
    companyApi.response$ = throwError(() => new Error('offline'));
    facade.load();
    expect(facade.company()).toBeNull();
    expect(facade.siteConfig()).toBe(siteConfig);
    expect(facade.businessUnits()).toEqual([businessUnit]);
    expect(facade.errors().company).not.toBeNull();
    expect(facade.error()).toContain('empresa');
    expect(facade.loading()).toBe(false);
    expect(facade.companyState()).toBe('error');
    expect(facade.siteConfigState()).toBe('success');
    expect(facade.businessUnitsState()).toBe('success');
  });

  it('exposes loading and empty after all requests finish', () => {
    const companies$ = new Subject<CompanyResponse[]>();
    companyApi.response$ = companies$;
    siteConfigApi.response$ = of([]);
    businessUnitApi.response$ = of([]);
    facade.load();
    expect(facade.loading()).toBe(true);
    expect(facade.isEmpty()).toBe(false);

    companies$.next([]);
    companies$.complete();
    expect(facade.loading()).toBe(false);
    expect(facade.loaded()).toBe(true);
    expect(facade.isEmpty()).toBe(true);
    expect(facade.companyState()).toBe('success');
    expect(facade.siteConfigState()).toBe('success');
    expect(facade.businessUnitsState()).toBe('success');
  });
});

describe('PublicLayoutFacade SSR state', () => {
  it('transfers an SSR-blocked state so hydration can preserve the technical fallback', () => {
    const transferState = new TransferState();
    TestBed.configureTestingModule({
      providers: [
        PublicLayoutFacade,
        CompanyApiStub,
        SiteConfigApiStub,
        BusinessUnitApiStub,
        { provide: CompanyApiService, useExisting: CompanyApiStub },
        { provide: SiteConfigApiService, useExisting: SiteConfigApiStub },
        { provide: BusinessUnitApiService, useExisting: BusinessUnitApiStub },
        { provide: TransferState, useValue: transferState },
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: API_BASE_URL, useValue: '' },
      ],
    });

    const facade = TestBed.inject(PublicLayoutFacade);
    facade.load();

    expect(facade.ssrBlocked()).toBe(true);
    expect(facade.companyState()).toBe('ssr-blocked');
    expect(facade.siteConfigState()).toBe('ssr-blocked');
    expect(facade.businessUnitsState()).toBe('ssr-blocked');
    expect(transferState.isEmpty).toBe(false);
  });

  it('restores absolute-URL SSR data without repeating requests in the browser', () => {
    const transferState = new TransferState();
    TestBed.configureTestingModule({
      providers: [
        PublicLayoutFacade,
        CompanyApiStub,
        SiteConfigApiStub,
        BusinessUnitApiStub,
        { provide: CompanyApiService, useExisting: CompanyApiStub },
        { provide: SiteConfigApiService, useExisting: SiteConfigApiStub },
        { provide: BusinessUnitApiService, useExisting: BusinessUnitApiStub },
        { provide: TransferState, useValue: transferState },
        { provide: PLATFORM_ID, useValue: 'server' },
        { provide: API_BASE_URL, useValue: 'http://backend.example' },
      ],
    });
    TestBed.inject(PublicLayoutFacade).load();
    expect(transferState.isEmpty).toBe(false);

    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        PublicLayoutFacade,
        CompanyApiStub,
        SiteConfigApiStub,
        BusinessUnitApiStub,
        { provide: CompanyApiService, useExisting: CompanyApiStub },
        { provide: SiteConfigApiService, useExisting: SiteConfigApiStub },
        { provide: BusinessUnitApiService, useExisting: BusinessUnitApiStub },
        { provide: TransferState, useValue: transferState },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    const browserCompanyApi = TestBed.inject(CompanyApiStub);
    const browserSiteConfigApi = TestBed.inject(SiteConfigApiStub);
    const browserBusinessUnitApi = TestBed.inject(BusinessUnitApiStub);
    const browserFacade = TestBed.inject(PublicLayoutFacade);
    browserFacade.load();

    expect(browserFacade.company()).toEqual(company);
    expect(browserFacade.siteConfig()).toEqual(siteConfig);
    expect(browserFacade.businessUnits()).toEqual([businessUnit]);
    expect(browserCompanyApi.calls).toBe(0);
    expect(browserSiteConfigApi.calls).toBe(0);
    expect(browserBusinessUnitApi.activeCalls).toBe(0);
  });
});
