import { HttpErrorResponse } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';

import { LandingSectionCreateRequest } from '../../../data/models/landing-section/landing-section-create-request.model';
import { LandingSectionResponse } from '../../../data/models/landing-section/landing-section-response.model';
import { LandingSectionType } from '../../../data/models/landing-section/landing-section-type.enum';
import { LandingSectionUpdateRequest } from '../../../data/models/landing-section/landing-section-update-request.model';
import { VisibilityRequest } from '../../../data/models/landing-section/visibility-request.model';
import { SiteConfigResponse } from '../../../data/models/site-config/site-config-response.model';
import { LandingSectionApiService } from '../../../data/services/landing-section-api.service';
import { SiteConfigApiService } from '../../../data/services/site-config-api.service';
import { ToastService } from '../../../core/services/toast.service';
import { AdminLandingFacade } from './admin-landing.facade';

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

const mockSection: LandingSectionResponse = {
  id: 'sec-1',
  tipo: LandingSectionType.PERSONALIZADA,
  etiqueta: null,
  titulo: 'Test Section',
  subtitulo: null,
  contenido: null,
  imagenUrl: null,
  imagenAlt: null,
  textoBoton: null,
  enlaceBoton: null,
  orden: 1,
  visible: true,
  configuracionSitioId: 'site-1',
  escenas: [],
  acciones: [],
  fechaCreacion: null,
  fechaActualizacion: null,
};

class LandingApiStub {
  getAllResponse$: Observable<LandingSectionResponse[]> = of([mockSection]);
  createResponse$: Observable<LandingSectionResponse> = of(mockSection);
  updateResponse$: Observable<LandingSectionResponse> = of(mockSection);
  visibilityResponse$: Observable<LandingSectionResponse> = of({ ...mockSection, visible: false });

  createRequests: LandingSectionCreateRequest[] = [];
  updateRequests: Array<{ id: string; request: LandingSectionUpdateRequest }> = [];
  visibilityRequests: Array<{ id: string; request: VisibilityRequest }> = [];

  getAll() {
    return this.getAllResponse$;
  }
  create(request: LandingSectionCreateRequest) {
    this.createRequests.push(request);
    return this.createResponse$;
  }
  update(id: string, request: LandingSectionUpdateRequest) {
    this.updateRequests.push({ id, request });
    return this.updateResponse$;
  }
  sceneUpdates: Array<{ sectionId: string; id: string; request: { orden: number } }> = [];
  updateScene(sectionId: string, id: string, request: { orden: number; imagenUrl: string; alt?: string | null; activo: boolean }) {
    this.sceneUpdates.push({ sectionId, id, request });
    return of({ id, ...request });
  }
  changeVisibility(id: string, request: VisibilityRequest) {
    this.visibilityRequests.push({ id, request });
    return this.visibilityResponse$;
  }
}

class SiteConfigApiStub {
  getAllResponse$: Observable<SiteConfigResponse[]> = of([mockSiteConfig]);
  getAll() {
    return this.getAllResponse$;
  }
}

describe('AdminLandingFacade', () => {
  let facade: AdminLandingFacade;
  let landingApi: LandingApiStub;
  let configApi: SiteConfigApiStub;
  let toastService: ToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminLandingFacade,
        LandingApiStub,
        SiteConfigApiStub,
        { provide: LandingSectionApiService, useExisting: LandingApiStub },
        { provide: SiteConfigApiService, useExisting: SiteConfigApiStub },
      ],
    });

    facade = TestBed.inject(AdminLandingFacade);
    toastService = TestBed.inject(ToastService);
    landingApi = TestBed.inject(LandingApiStub);
    configApi = TestBed.inject(SiteConfigApiStub);
  });

  describe('Carga de datos', () => {
    it('debe cargar secciones y configuraciones', () => {
      facade.load();
      expect(facade.sections()).toEqual([mockSection]);
      expect(facade.siteConfigurations()).toEqual([mockSiteConfig]);
      expect(facade.loading()).toBe(false);
    });

    it('debe representar listas vacías', () => {
      landingApi.getAllResponse$ = of([]);
      configApi.getAllResponse$ = of([]);
      facade.load();
      expect(facade.sections()).toEqual([]);
      expect(facade.siteConfigurations()).toEqual([]);
      expect(facade.loading()).toBe(false);
    });
  });

  describe('Creación', () => {
    beforeEach(() => {
      facade.load();
    });

    it('debe bloquear la apertura de creación si no hay configuración', () => {
      configApi.getAllResponse$ = of([]);
      facade.load();
      facade.openCreate();
      expect(facade.formOpen()).toBe(false);
    });

    it('debe crear exitosamente', () => {
      facade.openCreate();
      const createReq: LandingSectionCreateRequest = {
        configuracionSitioId: mockSiteConfig.id,
        tipo: LandingSectionType.HERO,
      };
      facade.create(createReq);
      expect(landingApi.createRequests.length).toBe(1);
      expect(facade.formOpen()).toBe(false);
      expect(facade.submitting()).toBe(false);
      expect(toastService.toasts().at(-1)?.message).toBe('Sección creada exitosamente.');
    });

    it('debe prevenir duplicados y resetear submitting', () => {
      const subject = new Subject<LandingSectionResponse>();
      landingApi.createResponse$ = subject.asObservable();
      facade.openCreate();
      const createReq: LandingSectionCreateRequest = {
        configuracionSitioId: mockSiteConfig.id,
        tipo: LandingSectionType.HERO,
      };
      facade.create(createReq);
      facade.create(createReq); // should be ignored
      expect(landingApi.createRequests.length).toBe(1);
      subject.next(mockSection);
      subject.complete();
      expect(facade.submitting()).toBe(false);
    });
  });

  describe('Edición', () => {
    beforeEach(() => {
      facade.load();
    });

    it('debe actualizar manteniendo orden=0 y configuracionSitioId', () => {
      facade.openEdit(mockSection);
      const updateReq: LandingSectionUpdateRequest = {
        configuracionSitioId: mockSection.configuracionSitioId,
        tipo: mockSection.tipo,
        orden: 0,
        visible: false,
      };
      landingApi.updateResponse$ = of({ ...mockSection, orden: 0, visible: false });
      facade.update(updateReq);
      expect(landingApi.updateRequests.length).toBe(1);
      expect(landingApi.updateRequests[0].request.orden).toBe(0);
      expect(landingApi.updateRequests[0].request.visible).toBe(false);
      expect(landingApi.updateRequests[0].request.configuracionSitioId).toBe(
        mockSection.configuracionSitioId,
      );
      expect(facade.formOpen()).toBe(false);
    });
  });

  describe('Visibilidad', () => {
    beforeEach(() => {
      facade.load();
    });

    it('debe cambiar visibilidad a false (PATCH)', () => {
      facade.changeVisibility(mockSection, false);
      expect(landingApi.visibilityRequests).toEqual([
        { id: mockSection.id, request: { visible: false } },
      ]);
      expect(facade.sections().find((s) => s.id === mockSection.id)?.visible).toBe(false);
      expect(facade.changingVisibilityId()).toBeNull();
    });
  });

  describe('Manejo de Errores HTTP', () => {
    beforeEach(() => {
      facade.load();
      facade.openEdit(mockSection);
    });

    it('maneja 400', () => {
      landingApi.updateResponse$ = throwError(() => new HttpErrorResponse({ status: 400 }));
      facade.update({
        configuracionSitioId: 'site-1',
        tipo: LandingSectionType.HERO,
        orden: 1,
        visible: true,
      });
      expect(facade.error()).toBe('Revisa los datos ingresados e inténtalo nuevamente.');
    });

    it('maneja 404', () => {
      landingApi.updateResponse$ = throwError(() => new HttpErrorResponse({ status: 404 }));
      facade.update({
        configuracionSitioId: 'site-1',
        tipo: LandingSectionType.HERO,
        orden: 1,
        visible: true,
      });
      expect(facade.error()).toBe('La sección o configuración solicitada ya no existe.');
    });

    it('maneja 409', () => {
      landingApi.updateResponse$ = throwError(() => new HttpErrorResponse({ status: 409 }));
      facade.update({
        configuracionSitioId: 'site-1',
        tipo: LandingSectionType.HERO,
        orden: 1,
        visible: true,
      });
      expect(facade.error()).toBe('No se pudo guardar porque existe un conflicto de integridad.');
    });
  });

  describe('Orden de fotos y edición integrada', () => {
    const s1 = { id: 's1', imagenUrl: 'a.jpg', alt: null, orden: 0, activo: true };
    const s2 = { id: 's2', imagenUrl: 'b.jpg', alt: null, orden: 1, activo: true };
    const withScenes = { ...mockSection, escenas: [s1, s2] };

    it('intercambia el orden de dos fotos y actualiza la sección sin abrir el cajón', () => {
      facade.sections.set([withScenes]);
      facade.swapSceneOrder(s1, s2, withScenes);

      expect(landingApi.sceneUpdates.map((u) => [u.id, u.request.orden])).toEqual([
        ['s1', 1],
        ['s2', 0],
      ]);
      expect(facade.sections()[0].escenas.map((a) => [a.id, a.orden])).toEqual([
        ['s2', 0],
        ['s1', 1],
      ]);
      expect(facade.managedSection()).toBeNull();
    });

    it('separa dos fotos con el mismo orden', () => {
      const dup = { ...s2, orden: 0 };
      facade.swapSceneOrder(s1, dup, { ...withScenes, escenas: [s1, dup] });
      expect(landingApi.sceneUpdates.map((u) => u.request.orden)).toEqual([0, 1]);
    });

    it('no ofrece operaciones de escritura para los botones fijos', () => {
      const api = facade as unknown as Record<string, unknown>;
      expect(api['saveAction']).toBeUndefined();
      expect(api['deleteAction']).toBeUndefined();
    });

    it('actualiza una sección indicada sin cerrar un cajón que no estaba abierto', () => {
      facade.sections.set([withScenes]);
      facade.update(
        { configuracionSitioId: 'site-1', tipo: LandingSectionType.PERSONALIZADA, titulo: 'a\nb', orden: 1, visible: true },
        withScenes,
      );
      expect(landingApi.updateRequests[0].id).toBe('sec-1');
      expect(landingApi.updateRequests[0].request.titulo).toBe('a\nb');
    });
  });
});
