import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';

import { BusinessUnitResponse } from '../../../data/models/business-unit/business-unit-response.model';
import { LandingSectionResponse } from '../../../data/models/landing-section/landing-section-response.model';
import { LandingSectionType } from '../../../data/models/landing-section/landing-section-type.enum';
import { ProjectResponse } from '../../../data/models/project/project-response.model';
import { ServiceResponse } from '../../../data/models/service/service-response.model';
import { BusinessUnitApiService } from '../../../data/services/business-unit-api.service';
import { LandingSectionApiService } from '../../../data/services/landing-section-api.service';
import { ProjectApiService } from '../../../data/services/project-api.service';
import { ServiceApiService } from '../../../data/services/service-api.service';
import { PublicHomeFacade } from './public-home.facade';

const section = (type: LandingSectionType, id: string = type): LandingSectionResponse => ({
  id,
  tipo: type,
  titulo: type,
  subtitulo: null,
  contenido: null,
  imagenUrl: null,
  textoBoton: null,
  enlaceBoton: null,
  orden: 1,
  visible: true,
  configuracionSitioId: 'config-1',
  fechaCreacion: null,
  fechaActualizacion: null,
});

const service: ServiceResponse = {
  id: 'service-1',
  nombre: 'Construcción',
  slug: 'construccion',
  resumen: null,
  descripcion: 'Construcción integral',
  icono: null,
  imagenUrl: null,
  activo: true,
  destacado: true,
  orden: 1,
  fechaCreacion: null,
  fechaActualizacion: null,
};

const project: ProjectResponse = {
  id: 'project-1',
  nombre: 'Residencia',
  slug: 'residencia',
  cliente: null,
  ubicacion: null,
  fechaProyecto: null,
  descripcion: 'Proyecto residencial',
  destacado: true,
  activo: true,
  servicios: null,
  imagenes: null,
  fechaCreacion: null,
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
  empresa: { id: 'company-1', nombreComercial: 'ISANORTE' },
  fechaCreacion: null,
  fechaActualizacion: null,
};

class LandingSectionApiStub {
  response$: Observable<LandingSectionResponse[]> = of([
    section(LandingSectionType.HERO),
    section(LandingSectionType.SERVICIOS),
    section(LandingSectionType.PROYECTOS),
    section(LandingSectionType.CTA),
  ]);
  visibleCalls = 0;

  getVisible(): Observable<LandingSectionResponse[]> {
    this.visibleCalls += 1;
    return this.response$;
  }
}

class ServiceApiStub {
  response$: Observable<ServiceResponse[]> = of([service]);
  activeCalls = 0;

  getActive(): Observable<ServiceResponse[]> {
    this.activeCalls += 1;
    return this.response$;
  }
}

class ProjectApiStub {
  response$: Observable<ProjectResponse[]> = of([project]);
  activeCalls = 0;

  getActive(): Observable<ProjectResponse[]> {
    this.activeCalls += 1;
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

describe('PublicHomeFacade', () => {
  let facade: PublicHomeFacade;
  let landingApi: LandingSectionApiStub;
  let serviceApi: ServiceApiStub;
  let projectApi: ProjectApiStub;
  let businessUnitApi: BusinessUnitApiStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        PublicHomeFacade,
        LandingSectionApiStub,
        ServiceApiStub,
        ProjectApiStub,
        BusinessUnitApiStub,
        { provide: LandingSectionApiService, useExisting: LandingSectionApiStub },
        { provide: ServiceApiService, useExisting: ServiceApiStub },
        { provide: ProjectApiService, useExisting: ProjectApiStub },
        { provide: BusinessUnitApiService, useExisting: BusinessUnitApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    facade = TestBed.inject(PublicHomeFacade);
    landingApi = TestBed.inject(LandingSectionApiStub);
    serviceApi = TestBed.inject(ServiceApiStub);
    projectApi = TestBed.inject(ProjectApiStub);
    businessUnitApi = TestBed.inject(BusinessUnitApiStub);
  });

  it('loads visible landing sections with the public operation', () => {
    facade.load();
    expect(landingApi.visibleCalls).toBe(1);
    expect(facade.sections()).toHaveLength(4);
  });

  it('loads active services, projects and business units', () => {
    facade.load();
    expect(serviceApi.activeCalls).toBe(1);
    expect(projectApi.activeCalls).toBe(1);
    expect(businessUnitApi.activeCalls).toBe(1);
    expect(facade.services()).toEqual([service]);
    expect(facade.projects()).toEqual([project]);
    expect(facade.businessUnits()).toEqual([businessUnit]);
  });

  it('represents an absent HERO section', () => {
    landingApi.response$ = of([section(LandingSectionType.CTA)]);
    facade.load();
    expect(facade.heroSection()).toBeNull();
  });

  it('represents an absent CTA section', () => {
    landingApi.response$ = of([section(LandingSectionType.HERO)]);
    facade.load();
    expect(facade.ctaSection()).toBeNull();
  });

  it('locates every supported visible section type without assuming it exists', () => {
    const sections = Object.values(LandingSectionType).map((type, index) =>
      section(type, `section-${index}`),
    );
    landingApi.response$ = of(sections);
    facade.load();
    expect(facade.heroSection()?.tipo).toBe(LandingSectionType.HERO);
    expect(facade.companySection()?.tipo).toBe(LandingSectionType.EMPRESA);
    expect(facade.servicesSection()?.tipo).toBe(LandingSectionType.SERVICIOS);
    expect(facade.projectsSection()?.tipo).toBe(LandingSectionType.PROYECTOS);
    expect(facade.contactSection()?.tipo).toBe(LandingSectionType.CONTACTO);
    expect(facade.ctaSection()?.tipo).toBe(LandingSectionType.CTA);
    expect(facade.customSections()).toEqual([sections[6]]);
  });

  it('derives featured collections from real flags', () => {
    serviceApi.response$ = of([service, { ...service, id: 'service-2', destacado: false }]);
    projectApi.response$ = of([project, { ...project, id: 'project-2', destacado: false }]);
    facade.load();
    expect(facade.featuredServices()).toEqual([service]);
    expect(facade.featuredProjects()).toEqual([project]);
  });

  it('keeps successful resources available when projects fail', () => {
    projectApi.response$ = throwError(() => new Error('offline'));
    facade.load();
    expect(facade.sections()).not.toHaveLength(0);
    expect(facade.services()).toEqual([service]);
    expect(facade.businessUnits()).toEqual([businessUnit]);
    expect(facade.projects()).toEqual([]);
    expect(facade.errors().projects).not.toBeNull();
    expect(facade.error()).toContain('proyectos');
  });

  it('represents a completely empty response after loading', () => {
    landingApi.response$ = of([]);
    serviceApi.response$ = of([]);
    projectApi.response$ = of([]);
    businessUnitApi.response$ = of([]);
    facade.load();
    expect(facade.loading()).toBe(false);
    expect(facade.isEmpty()).toBe(true);
  });

  it('preserves backend order and does not mutate source arrays', () => {
    const source = [
      section(LandingSectionType.CTA, 'first'),
      section(LandingSectionType.HERO, 'second'),
    ];
    const snapshot = [...source];
    landingApi.response$ = of(source);
    facade.load();
    expect(facade.sections()).toBe(source);
    expect(source).toEqual(snapshot);
    expect(facade.sections().map(({ id }) => id)).toEqual(['first', 'second']);
  });

  it('stays loading until all independent requests finish', () => {
    const projects$ = new Subject<ProjectResponse[]>();
    projectApi.response$ = projects$;
    facade.load();
    expect(facade.loading()).toBe(true);

    projects$.next([project]);
    projects$.complete();
    expect(facade.loading()).toBe(false);
    expect(facade.loaded()).toBe(true);
  });
});
