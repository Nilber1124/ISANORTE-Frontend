import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';

import { BusinessUnitResponse } from '../../../data/models/business-unit/business-unit-response.model';
import { LandingSectionResponse } from '../../../data/models/landing-section/landing-section-response.model';
import { LandingSectionType } from '../../../data/models/landing-section/landing-section-type.enum';
import { ProjectImageType } from '../../../data/models/project/project-image-type.enum';
import { ProjectResponse } from '../../../data/models/project/project-response.model';
import { ServiceResponse } from '../../../data/models/service/service-response.model';
import { BusinessUnitApiService } from '../../../data/services/business-unit-api.service';
import { LandingSectionApiService } from '../../../data/services/landing-section-api.service';
import { ProjectApiService } from '../../../data/services/project-api.service';
import { ServiceApiService } from '../../../data/services/service-api.service';
import { Home } from './home';

Object.defineProperty(window, 'matchMedia', {
  configurable: true,
  writable: true,
  value: (query: string): MediaQueryList =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => undefined,
      removeListener: () => undefined,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      dispatchEvent: () => false,
    }) as MediaQueryList,
});

const landingSection = (
  type: LandingSectionType,
  values: Partial<LandingSectionResponse> = {},
): LandingSectionResponse => ({
  id: `section-${type.toLocaleLowerCase()}`,
  tipo: type,
  titulo: `Título ${type}`,
  subtitulo: `Subtítulo ${type}`,
  contenido: `Contenido ${type}`,
  imagenUrl: null,
  textoBoton: `Ir a ${type}`,
  enlaceBoton: `/${type.toLocaleLowerCase()}`,
  orden: 1,
  visible: true,
  configuracionSitioId: 'config-1',
  fechaCreacion: null,
  fechaActualizacion: null,
  ...values,
});

const apiService: ServiceResponse = {
  id: 'service-api',
  nombre: 'Servicio desde API',
  slug: 'servicio-api',
  resumen: 'Resumen dinámico',
  descripcion: 'Descripción dinámica',
  icono: null,
  imagenUrl: 'https://example.com/service.jpg',
  activo: true,
  destacado: true,
  orden: 0,
  fechaCreacion: null,
  fechaActualizacion: null,
};

const apiProject: ProjectResponse = {
  id: 'project-api',
  nombre: 'Proyecto desde API',
  slug: 'proyecto-api',
  cliente: 'Cliente API',
  ubicacion: 'Lima',
  fechaProyecto: '2026',
  descripcion: 'Descripción del proyecto',
  destacado: true,
  activo: true,
  servicios: null,
  imagenes: null,
  fechaCreacion: null,
  fechaActualizacion: null,
};

class LandingSectionApiStub {
  response$: Observable<LandingSectionResponse[]> = of([
    landingSection(LandingSectionType.SERVICIOS),
    landingSection(LandingSectionType.PROYECTOS),
    landingSection(LandingSectionType.CTA),
  ]);
  getVisible(): Observable<LandingSectionResponse[]> {
    return this.response$;
  }
}

class ServiceApiStub {
  response$: Observable<ServiceResponse[]> = of([apiService]);
  getActive(): Observable<ServiceResponse[]> {
    return this.response$;
  }
}

class ProjectApiStub {
  response$: Observable<ProjectResponse[]> = of([apiProject]);
  getActive(): Observable<ProjectResponse[]> {
    return this.response$;
  }
}

class BusinessUnitApiStub {
  response$: Observable<BusinessUnitResponse[]> = of([]);
  getActive(): Observable<BusinessUnitResponse[]> {
    return this.response$;
  }
}

describe('Home dynamic sections', () => {
  let fixture: ComponentFixture<Home>;
  let landingApi: LandingSectionApiStub;
  let serviceApi: ServiceApiStub;
  let projectApi: ProjectApiStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Home],
      providers: [
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
    landingApi = TestBed.inject(LandingSectionApiStub);
    serviceApi = TestBed.inject(ServiceApiStub);
    projectApi = TestBed.inject(ProjectApiStub);
  });

  function render(): HTMLElement {
    fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('replaces demo services and renders section title and CTA from API', () => {
    const element = render();
    const services = element.querySelector('[data-testid="home-services"]');
    const link = services?.querySelector('app-button a');
    expect(services?.textContent).toContain('Servicio desde API');
    expect(services?.textContent).toContain('Título SERVICIOS');
    expect(services?.textContent).toContain('Ir a SERVICIOS');
    expect(services?.textContent).not.toContain('Construcción Obra Civil');
    expect(link?.getAttribute('href')).toBe('/servicios');
  });

  it('treats a successful empty service response as authoritative', () => {
    serviceApi.response$ = of([]);
    const services = render().querySelector('[data-testid="home-services"]');
    expect(services?.querySelectorAll('[data-service-id]')).toHaveLength(0);
    expect(services?.textContent).not.toContain('Construcción Obra Civil');
  });

  it('uses description when summary is null and a local image when imagenUrl is null', () => {
    serviceApi.response$ = of([
      { ...apiService, resumen: null, descripcion: 'Descripción elegida', imagenUrl: null },
    ]);
    const element = render();
    const card = element.querySelector('[data-service-id="service-api"]');
    expect(card?.textContent).toContain('Descripción elegida');
    expect(card?.querySelector('img')?.getAttribute('src')).toBe(
      '/images/servicios-construccion.jpg',
    );
  });

  it('does not render Services when its visible landing section is absent', () => {
    landingApi.response$ = of([
      landingSection(LandingSectionType.PROYECTOS),
      landingSection(LandingSectionType.CTA),
    ]);
    expect(render().querySelector('[data-testid="home-services"]')).toBeNull();
  });

  it('renders projects and editorial content from API without demo projects', () => {
    const projects = render().querySelector('[data-testid="home-projects"]');
    expect(projects?.textContent).toContain('Proyecto desde API');
    expect(projects?.textContent).toContain('Título PROYECTOS');
    expect(projects?.textContent).toContain('Contenido PROYECTOS');
    expect(projects?.textContent).not.toContain('Residencia Aura');
  });

  it('treats a successful empty project response as authoritative', () => {
    projectApi.response$ = of([]);
    const projects = render().querySelector('[data-testid="home-projects"]');
    expect(projects?.querySelectorAll('[data-project-id]')).toHaveLength(0);
    expect(projects?.textContent).not.toContain('Residencia Aura');
  });

  it('uses the principal project image and falls back locally without images', () => {
    projectApi.response$ = of([
      {
        ...apiProject,
        imagenes: [
          {
            id: 'first',
            url: '/images/proyectos-oficinas-nexus.jpg',
            titulo: null,
            descripcion: null,
            tipo: ProjectImageType.GENERAL,
            esPrincipal: false,
            orden: 0,
          },
          {
            id: 'principal',
            url: '/images/proyectos-villa-lomas-alta.jpg',
            titulo: null,
            descripcion: null,
            tipo: ProjectImageType.GENERAL,
            esPrincipal: true,
            orden: 2,
          },
        ],
      },
      { ...apiProject, id: 'project-without-image', nombre: 'Sin imagen', destacado: true },
    ]);
    const element = render();
    expect(element.querySelector('[data-project-id="project-api"] img')?.getAttribute('src')).toBe(
      '/images/proyectos-villa-lomas-alta.jpg',
    );
    expect(
      element.querySelector('[data-project-id="project-without-image"] img')?.getAttribute('src'),
    ).toBe('/images/residencia-aura.jpg');
  });

  it('does not render Projects when its visible landing section is absent', () => {
    landingApi.response$ = of([
      landingSection(LandingSectionType.SERVICIOS),
      landingSection(LandingSectionType.CTA),
    ]);
    expect(render().querySelector('[data-testid="home-projects"]')).toBeNull();
  });

  it('renders CTA title, image, content, and button from API', () => {
    landingApi.response$ = of([
      landingSection(LandingSectionType.SERVICIOS),
      landingSection(LandingSectionType.PROYECTOS),
      landingSection(LandingSectionType.CTA, {
        titulo: 'CTA dinámico',
        subtitulo: 'Subtítulo dinámico',
        contenido: 'Contenido dinámico',
        imagenUrl: 'https://example.com/cta.jpg',
        textoBoton: 'Hablar ahora',
        enlaceBoton: 'https://example.com/contacto',
      }),
    ]);
    const cta = render().querySelector('[data-testid="home-cta"]');
    expect(cta?.textContent).toContain('CTA dinámico');
    expect(cta?.textContent).toContain('Contenido dinámico');
    expect(cta?.querySelector('img')?.getAttribute('src')).toBe('https://example.com/cta.jpg');
    expect(cta?.querySelector('app-button a')?.getAttribute('href')).toBe(
      'https://example.com/contacto',
    );
  });

  it('does not render CTA when its visible landing section is absent', () => {
    landingApi.response$ = of([
      landingSection(LandingSectionType.SERVICIOS),
      landingSection(LandingSectionType.PROYECTOS),
    ]);
    expect(render().querySelector('[data-testid="home-cta"]')).toBeNull();
  });

  it('handles nullable CTA content without rendering a literal null', () => {
    landingApi.response$ = of([
      landingSection(LandingSectionType.CTA, {
        titulo: 'CTA sin contenido',
        subtitulo: null,
        contenido: null,
        textoBoton: null,
        enlaceBoton: null,
      }),
    ]);
    const cta = render().querySelector('[data-testid="home-cta"]');
    expect(cta?.textContent).toContain('CTA sin contenido');
    expect(cta?.textContent).not.toContain('null');
    expect(cta?.querySelector('app-button')).toBeNull();
  });

  it('keeps successful Services and CTA when Projects fails', () => {
    projectApi.response$ = throwError(() => new Error('offline'));
    const element = render();
    expect(element.textContent).toContain('Servicio desde API');
    expect(element.textContent).toContain('Título CTA');
    expect(element.textContent).toContain('Residencia Aura');
  });

  it('never mixes demo collections with successful API collections', () => {
    const element = render();
    expect(element.textContent).toContain('Servicio desde API');
    expect(element.textContent).toContain('Proyecto desde API');
    expect(element.textContent).not.toContain('Acabados & Revestimientos');
    expect(element.textContent).not.toContain('Edificio Tech-Corporate');
  });
});

describe('Home SSR-blocked fallback', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        LandingSectionApiStub,
        ServiceApiStub,
        ProjectApiStub,
        BusinessUnitApiStub,
        { provide: LandingSectionApiService, useExisting: LandingSectionApiStub },
        { provide: ServiceApiService, useExisting: ServiceApiStub },
        { provide: ProjectApiService, useExisting: ProjectApiStub },
        { provide: BusinessUnitApiService, useExisting: BusinessUnitApiStub },
        { provide: PLATFORM_ID, useValue: 'server' },
      ],
    });
  });

  it('keeps the temporary static fallback when SSR cannot use a relative API URL', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Construcción Obra Civil');
    expect(element.textContent).toContain('Residencia Aura');
    expect(element.textContent).toContain('¿Tienes un proyecto en mente?');
  });
});
