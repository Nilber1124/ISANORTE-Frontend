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
      childKind: signal<'scene'>('scene'),
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

  it('muestra la visibilidad como botón y no permite administrar los botones', () => {
    component.activeTab.set('secciones');
    facadeMock.siteConfigurations.set([mockSiteConfig]);
    facadeMock.sections.set([mockSection]);
    fixture.detectChanges();
    const toggle = (fixture.nativeElement as HTMLElement).querySelector(
      'td button[aria-label^="Mostrar la sección"]',
    );
    expect(toggle).toBeTruthy();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain('Botones (');
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
    expect(element.textContent).toContain('Editar textos e imagen');
    expect(element.querySelector('a[href="/admin/proyectos"]')).toBeTruthy();

    component['selectBlock']('proceso');
    fixture.detectChanges();
    expect(element.textContent).not.toContain('Editar textos e imagen');
    expect(element.querySelector('a[href="/admin/sitio/pasos-proceso"]')).toBeTruthy();
  });

  it('al tocar un texto del Hero en la página abre el editor con ese campo y borra el borrador al cambiar de bloque', () => {
    facadeMock.siteConfigurations.set([mockSiteConfig]);
    facadeMock.sections.set([{ ...mockSection, tipo: 'HERO' } as never]);
    fixture.detectChanges();

    component['selectBlock']('inicio');
    component['selectField']({ block: 'inicio', field: 'titulo' });
    fixture.detectChanges();
    expect(component.editingInPanel()).toBe(true);
    expect(component.focusRequest()?.field).toBe('titulo');
    expect((fixture.nativeElement as HTMLElement).querySelector('app-hero-editor')).toBeTruthy();

    component['setHeroDraft']({ etiqueta: 'a', titulo: 'b', subtitulo: 'c' });
    expect(component.previewDraft()).toEqual({ block: 'inicio', values: { etiqueta: 'a', titulo: 'b', subtitulo: 'c' } });
    component['selectBlock']('servicios');
    expect(component.previewDraft()).toBeNull();
    expect(component.editingInPanel()).toBe(false);
  });

  it('al tocar el título de Servicios o una tarjeta abre solo ese campo', () => {
    facadeMock.siteConfigurations.set([mockSiteConfig]);
    facadeMock.sections.set([{ ...mockSection, tipo: 'SERVICIOS', titulo: 'Todo en un lugar' } as never]);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;

    component['selectBlock']('servicios');
    component['selectField']({ block: 'servicios', field: 'titulo' });
    fixture.detectChanges();
    expect(component.panelEdit()).toEqual({ kind: 'section', field: 'titulo' });
    expect(element.querySelector('app-field-editor')).toBeTruthy();
    expect((element.querySelector('textarea') as HTMLTextAreaElement).value).toBe('Todo en un lugar');

    component['setSectionDraft']('titulo', 'Borrador');
    expect(component.previewDraft()).toEqual({ block: 'servicios', values: { titulo: 'Borrador' } });

    component['selectField']({ block: 'servicios', field: 'resumen', item: 'servicio:abc' });
    expect(component.panelEdit()).toEqual({ kind: 'service', slug: 'abc', field: 'resumen' });
    component['setServiceDraft']('abc', { resumen: 'Nuevo' });
    expect(component.previewDraft()).toEqual({ block: 'servicios', item: 'servicio:abc', values: { resumen: 'Nuevo' } });

    // Tocar la tarjeta (sin un texto concreto) muestra nombre y descripción a la vez.
    component['selectField']({ block: 'servicios', field: 'tarjeta', item: 'servicio:abc' });
    expect(component.panelEdit()).toEqual({ kind: 'service', slug: 'abc', field: 'ambos' });

    component['selectBlock']('proyectos');
    expect(component.panelEdit()).toBeNull();
    expect(component.previewDraft()).toBeNull();
  });

  it('guarda el texto de una sección conservando el resto de sus campos', () => {
    const update = vi.fn();
    (facadeMock as unknown as { update: unknown }).update = update;
    const section = { ...mockSection, tipo: 'SERVICIOS', titulo: 'Viejo', subtitulo: 'Sub', textoBoton: 'X', enlaceBoton: '/x' } as never;
    facadeMock.sections.set([section]);
    component['selectBlock']('servicios');
    component['saveSectionField']('titulo', 'Nuevo\ntítulo');
    const request = update.mock.calls[0][0];
    expect(request).toMatchObject({ titulo: 'Nuevo\ntítulo', subtitulo: 'Sub', textoBoton: 'X', enlaceBoton: '/x', tipo: 'SERVICIOS' });
  });

  it('al tocar una garantía o un testimonio abre sus campos, por separado o juntos', () => {
    component['selectBlock']('garantias');
    component['selectField']({ block: 'garantias', field: 'texto', item: 'garantia:g1' });
    expect(component.panelEdit()).toEqual({ kind: 'content', item: 'garantia', id: 'g1', field: 'texto' });
    component['selectField']({ block: 'garantias', field: 'tarjeta', item: 'garantia:g1' });
    expect(component.panelEdit()).toEqual({ kind: 'content', item: 'garantia', id: 'g1', field: 'ambos' });

    component['selectField']({ block: 'testimonios', field: 'autor', item: 'testimonio:t1' });
    expect(component.panelEdit()).toEqual({ kind: 'content', item: 'testimonio', id: 't1', field: 'autor' });
    component['setContentDraft']('testimonio', 't1', { texto: 'x', autor: 'y', cargo: 'z' });
    expect(component.previewDraft()).toEqual({
      block: 'garantias', item: 'testimonio:t1', values: { texto: 'x', autor: 'y', cargo: 'z' },
    });
    component['selectField']({ block: 'preguntas', field: 'tarjeta', item: 'faq:f1' });
    expect(component.panelEdit()).toEqual({ kind: 'content', item: 'faq', id: 'f1', field: 'ambos' });
    component['selectField']({ block: 'proceso', field: 'tarjeta', item: 'paso:p1' });
    expect(component.panelEdit()).toEqual({ kind: 'content', item: 'paso', id: 'p1', field: 'ambos' });
    // Un campo que ese elemento no tiene no abre nada.
    component['selectBlock']('testimonios');
    component['selectField']({ block: 'testimonios', field: 'titulo', item: 'testimonio:t1' });
    expect(component.panelEdit()).toBeNull();
  });

  it('al tocar la descripción o los puntos de ISADECOR abre la unidad de negocio', () => {
    component['selectBlock']('isadecor');
    component['selectField']({ block: 'isadecor', field: 'ofertas', item: 'unidad:isadecor' });
    expect(component.panelEdit()).toEqual({ kind: 'unit', slug: 'isadecor', field: 'ofertas' });
    component['selectField']({ block: 'isadecor', field: 'tarjeta', item: 'unidad:isadecor' });
    expect(component.panelEdit()).toEqual({ kind: 'unit', slug: 'isadecor', field: 'ambos' });
    component['setUnitDraft']('isadecor', { descripcion: 'x' });
    expect(component.previewDraft()).toEqual({ block: 'isadecor', item: 'unidad:isadecor', values: { descripcion: 'x' } });
  });

  it('al tocar la cabecera de un bloque abre solo ese texto; los campos que el bloque no tiene no abren nada', () => {
    component['selectBlock']('garantias');
    component['selectField']({ block: 'garantias', field: 'titulo' });
    expect(component.panelEdit()).toEqual({ kind: 'blocktext', clave: 'garantias', field: 'titulo' });
    component['setBlockTextDraft']('garantias', { titulo: 'Nuevo' });
    expect(component.previewDraft()).toEqual({ block: 'garantias', values: { titulo: 'Nuevo' } });

    component['selectBlock']('proceso');
    component['selectField']({ block: 'proceso', field: 'subtitulo' });
    expect(component.panelEdit()).toBeNull();
    component['selectField']({ block: 'proceso', field: 'titulo' });
    expect(component.panelEdit()).toEqual({ kind: 'blocktext', clave: 'proceso', field: 'titulo' });
  });

  it('al tocar una tarjeta de proyecto abre el orden de proyectos; el título abre el campo de la sección', () => {
    facadeMock.siteConfigurations.set([mockSiteConfig]);
    facadeMock.sections.set([{ ...mockSection, tipo: 'PROYECTOS', titulo: 'Obras' } as never]);
    component['selectBlock']('proyectos');
    component['selectField']({ block: 'proyectos', field: 'tarjeta', item: 'proyectos:casa-campestre' });
    expect(component.panelEdit()).toEqual({ kind: 'projects' });

    component['selectBlock']('proyectos');
    component['selectField']({ block: 'proyectos', field: 'titulo' });
    expect(component.panelEdit()).toEqual({ kind: 'section', field: 'titulo' });
  });
});
