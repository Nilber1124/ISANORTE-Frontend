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

  it('debe tener la pestaña de secciones activa por defecto y mostrar las 6 pestañas', () => {
    fixture.detectChanges();
    expect(component.activeTab()).toBe('secciones');
    const tabs = fixture.nativeElement.querySelectorAll('button[role="tab"]');
    expect(tabs.length).toBe(6);
  });

  it('debe mostrar mensaje de falta de configuración', () => {
    facadeMock.siteConfigurations.set([]);
    facadeMock.sections.set([]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Falta configuración inicial');
  });

  it('debe mostrar mensaje de sin secciones cuando hay config pero 0 secciones', () => {
    facadeMock.siteConfigurations.set([mockSiteConfig]);
    facadeMock.sections.set([]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Sin secciones');
    expect(text).toContain('No hay secciones de Landing registradas');
  });

  it('debe mostrar la tabla con datos', () => {
    facadeMock.siteConfigurations.set([mockSiteConfig]);
    facadeMock.sections.set([mockSection]);
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Hero Principal');
    expect(text).toContain('PERSONALIZADA');
    expect(text).toContain('Oculta');
  });

  it('debe permitir cambiar de pestaña', () => {
    fixture.detectChanges();
    const tabs = fixture.nativeElement.querySelectorAll('button[role="tab"]');
    tabs[1].click();
    fixture.detectChanges();

    expect(component.activeTab()).toBe('nosotros');
    expect(fixture.nativeElement.querySelector('#panel-nosotros')).toBeTruthy();
  });
});

