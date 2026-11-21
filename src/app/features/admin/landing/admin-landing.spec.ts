import { signal } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { LandingSectionResponse } from '../../../data/models/landing-section/landing-section-response.model';
import { LandingSectionType } from '../../../data/models/landing-section/landing-section-type.enum';
import { SiteConfigResponse } from '../../../data/models/site-config/site-config-response.model';
import { AdminLanding } from './admin-landing';
import { AdminLandingFacade } from './admin-landing.facade';

const mockSection: LandingSectionResponse = {
  id: 'sec-1',
  tipo: LandingSectionType.PERSONALIZADA,
  etiqueta: null,
  titulo: 'Hero Principal',
  subtitulo: null,
  contenido: null,
  imagenUrl: null,
  imagenAlt: null,
  textoBoton: null,
  enlaceBoton: null,
  orden: 0,
  visible: false,
  configuracionSitioId: 'site-1',
  escenas: [],
  acciones: [],
  fechaCreacion: null,
  fechaActualizacion: null,
};

const mockSiteConfig: SiteConfigResponse = {
  id: 'site-1',
  clave: 'isanorte',
  tituloSitio: 'ISANORTE',
  descripcionSitio: null,
  logoUrl: null,
  logoBlancoUrl: null,
  faviconUrl: null,
  colorPrimario: null,
  colorSecundario: null,
  textoPiePagina: null,
  empresa: { id: 'emp-1' } as any,
  secciones: null,
  fechaActualizacion: null,
};

describe('AdminLanding', () => {
  let component: AdminLanding;
  let fixture: ComponentFixture<AdminLanding>;
  let facadeMock: any;

  beforeEach(async () => {
    facadeMock = {
      sections: signal<LandingSectionResponse[]>([]),
      siteConfigurations: signal<SiteConfigResponse[]>([]),
      loading: signal<boolean>(false),
      submitting: signal<boolean>(false),
      changingVisibilityId: signal<string | null>(null),
      error: signal<string | null>(null),
      success: signal<string | null>(null),
      selectedSection: signal<LandingSectionResponse | null>(null),
      formMode: signal<'create' | 'edit'>('create'),
      formOpen: signal<boolean>(false),
      managedSection: signal<LandingSectionResponse | null>(null),
      childKind: signal<'scene' | 'action'>('action'),
      childSaving: signal(false),
      load: vi.fn(),
      openCreate: vi.fn(),
      openEdit: vi.fn(),
      closeForm: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      changeVisibility: vi.fn(),
      openChildren: vi.fn(),
      closeChildren: vi.fn(),
      saveScene: vi.fn(),
      deleteScene: vi.fn(),
      saveAction: vi.fn(),
      deleteAction: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [AdminLanding],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => null,
              },
            },
            queryParams: of({}),
          },
        },
      ],
    })
      .overrideComponent(AdminLanding, {
        set: {
          providers: [{ provide: AdminLandingFacade, useValue: facadeMock }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AdminLanding);
    component = fixture.componentInstance;
  });

  it('debe crearse correctamente', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('debe tener la pestaña de vista previa activa por defecto y mostrar solo las pestañas propias', () => {
    fixture.detectChanges();
    expect(component.activeTab()).toBe('vista');
    const tabs = fixture.nativeElement.querySelectorAll('button[role="tab"]');
    expect(tabs.length).toBe(3);
  });

  it('debe mostrar mensaje de falta de configuración', () => {
    component.activeTab.set('secciones');
    facadeMock.siteConfigurations.set([]);
    facadeMock.sections.set([]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Falta configuración inicial');
  });

  it('debe mostrar mensaje de sin secciones cuando hay config pero 0 secciones', () => {
    component.activeTab.set('secciones');
    facadeMock.siteConfigurations.set([mockSiteConfig]);
    facadeMock.sections.set([]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Sin secciones');
    expect(text).toContain('Agrega la primera sección');
  });

  it('debe mostrar la tabla con datos', () => {
    component.activeTab.set('secciones');
    facadeMock.siteConfigurations.set([mockSiteConfig]);
    facadeMock.sections.set([mockSection]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Hero Principal');
    expect(text).toContain('Personalizada');
    expect(text).toContain('Oculta');
  });

  it('debe permitir cambiar de pestaña', () => {
    fixture.detectChanges();
    const tabs = fixture.nativeElement.querySelectorAll('button[role="tab"]');
    tabs[2].click();
    fixture.detectChanges();

    expect(component.activeTab()).toBe('nosotros');
    expect(fixture.nativeElement.querySelector('#panel-nosotros')).toBeTruthy();
  });

  it('ya no incrusta las pantallas que tienen su propia ruta y las enlaza', () => {
    component.activeTab.set('secciones');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('app-admin-services')).toBeNull();
    expect(element.querySelector('app-admin-projects')).toBeNull();
    const links = Array.from(
      element.querySelectorAll('nav[aria-label="Otras pantallas de la web"] a'),
    ).map((a) => a.getAttribute('href'));
    expect(links).toEqual(['/admin/servicios', '/admin/proyectos', '/admin/contacto', '/admin/contenido']);
  });

  it('muestra la visibilidad como botón y los conteos de diapositivas y botones', () => {
    component.activeTab.set('secciones');
    facadeMock.siteConfigurations.set([mockSiteConfig]);
    facadeMock.sections.set([mockSection]);
    fixture.detectChanges();
    const toggle = (fixture.nativeElement as HTMLElement).querySelector(
      'td button[aria-label^="Mostrar la sección"]',
    );
    expect(toggle).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Botones (0)');
  });

  it('al elegir un bloque de la vista previa ofrece editar su sección o ir a su pantalla', () => {
    facadeMock.siteConfigurations.set([mockSiteConfig]);
    facadeMock.sections.set([{ ...mockSection, tipo: 'PROYECTOS' } as never]);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('app-landing-preview')).toBeTruthy();
    expect(element.textContent).toContain('Toca un bloque');

    component['selectBlock']('proyectos');
    fixture.detectChanges();
    expect(element.textContent).toContain('Editar textos, imagen y botón');
    expect(element.querySelector('a[href="/admin/proyectos"]')).toBeTruthy();

    component['selectBlock']('proceso');
    fixture.detectChanges();
    expect(element.textContent).not.toContain('Editar textos, imagen y botón');
    expect(element.querySelector('a[href="/admin/sitio/pasos-proceso"]')).toBeTruthy();
  });
});
