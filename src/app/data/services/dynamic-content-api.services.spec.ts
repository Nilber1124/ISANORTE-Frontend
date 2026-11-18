import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BusinessUnitResourceType } from '../models/business-unit/business-unit-resource.model';
import { ContactRequestStatus } from '../models/contact/contact-request.model';
import { PublicPageType } from '../models/content/page-content.model';
import { SeoPageType, SeoRobots } from '../models/content/page-seo.model';
import { BusinessUnitApiService } from './business-unit-api.service';
import { CompanyApiService } from './company-api.service';
import { ContactRequestApiService } from './contact-request-api.service';
import { LandingSectionApiService } from './landing-section-api.service';
import { PageContentApiService } from './page-content-api.service';
import { PageSeoApiService } from './page-seo-api.service';
import { ServiceApiService } from './service-api.service';

describe('dynamic content ApiServices', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('uses exact Landing scene and action child paths and payloads', () => {
    const api = TestBed.inject(LandingSectionApiService);
    const scene = {
      imagenUrl: 'https://example.com/hero.jpg',
      alt: 'Obra',
      orden: 0,
      activo: false,
    };
    api.createScene('section 1', scene).subscribe();
    const sceneCall = http.expectOne('/api/secciones-landing/section%201/escenas');
    expect(sceneCall.request.method).toBe('POST');
    expect(sceneCall.request.body).toEqual(scene);
    sceneCall.flush({ id: 'scene-1', ...scene });
    const action = { texto: 'Cotiza', enlace: '/contacto', orden: 0, activo: true };
    api.updateAction('section 1', 'action 1', action).subscribe();
    const actionCall = http.expectOne('/api/secciones-landing/section%201/acciones/action%201');
    expect(actionCall.request.method).toBe('PUT');
    expect(actionCall.request.body).toEqual(action);
    actionCall.flush({ id: 'action-1', ...action });
  });

  it('uses exact benefit CRUD paths', () => {
    const api = TestBed.inject(ServiceApiService);
    const request = { texto: 'Garantía', orden: 0, activo: true };
    api.createBenefit('service-1', request).subscribe();
    const create = http.expectOne('/api/servicios/service-1/beneficios');
    expect(create.request.body).toEqual(request);
    create.flush({ id: 'benefit-1', ...request });
    api.deleteBenefit('service-1', 'benefit-1').subscribe();
    const remove = http.expectOne('/api/servicios/service-1/beneficios/benefit-1');
    expect(remove.request.method).toBe('DELETE');
    remove.flush(null);
  });

  it('uses exact business-unit resource path and payload', () => {
    const api = TestBed.inject(BusinessUnitApiService);
    const request = {
      tipo: BusinessUnitResourceType.CATALOGO,
      url: 'https://example.com/catalog.pdf',
      alt: null,
      etiqueta: 'Catálogo',
      orden: 0,
      activo: false,
    };
    api.updateResource('unit-1', 'resource-1', request).subscribe();
    const call = http.expectOne('/api/unidades-negocio/unit-1/recursos/resource-1');
    expect(call.request.method).toBe('PUT');
    expect(call.request.body).toEqual(request);
    call.flush({ id: 'resource-1', ...request });
  });

  it('uses exact company statistic path and preserves zero and false', () => {
    const api = TestBed.inject(CompanyApiService);
    const request = {
      valor: 0,
      prefijo: '+',
      sufijo: null,
      etiqueta: 'PROYECTOS',
      orden: 0,
      activo: false,
    };
    api.createStatistic('company-1', request).subscribe();
    const call = http.expectOne('/api/empresa/company-1/estadisticas');
    expect(call.request.body).toEqual(request);
    call.flush({ id: 'stat-1', ...request });
  });

  it('uses exact page content collection and item paths', () => {
    const api = TestBed.inject(PageContentApiService);
    const request = {
      configuracionSitioId: 'site-1',
      pagina: PublicPageType.NOSOTROS,
      activo: true,
      tags: ['A', 'B'],
    };
    api.create(request).subscribe();
    const create = http.expectOne('/api/contenidos-pagina');
    expect(create.request.method).toBe('POST');
    expect(create.request.body).toEqual(request);
    create.flush({ id: 'content-1', ...request, fechaCreacion: '', fechaActualizacion: '' });
    api.update('content 1', { activo: false, tags: [] }).subscribe();
    const update = http.expectOne('/api/contenidos-pagina/content%201');
    expect(update.request.method).toBe('PUT');
    expect(update.request.body).toEqual({ activo: false, tags: [] });
    update.flush({
      id: 'content-1',
      ...request,
      activo: false,
      tags: [],
      fechaCreacion: '',
      fechaActualizacion: '',
    });
  });

  it('uses exact SEO paths and enum values', () => {
    const api = TestBed.inject(PageSeoApiService);
    const request = {
      configuracionSitioId: 'site-1',
      tipoPagina: SeoPageType.UNIDAD_NEGOCIO,
      title: 'ISADECOR',
      description: 'Catálogo',
      robots: SeoRobots.INDEX_FOLLOW,
      unidadNegocioId: 'unit-1',
    };
    api.create(request).subscribe();
    const call = http.expectOne('/api/seo-paginas');
    expect(call.request.body).toEqual(request);
    call.flush({ id: 'seo-1', ...request, fechaCreacion: '', fechaActualizacion: '' });
  });

  it('filters contact requests and patches only estado', () => {
    const api = TestBed.inject(ContactRequestApiService);
    api.getAll(ContactRequestStatus.NUEVA).subscribe();
    const list = http.expectOne('/api/solicitudes-contacto?estado=NUEVA');
    expect(list.request.method).toBe('GET');
    list.flush([]);
    api.changeStatus('request 1', { estado: ContactRequestStatus.EN_GESTION }).subscribe();
    const patch = http.expectOne('/api/solicitudes-contacto/request%201/estado');
    expect(patch.request.method).toBe('PATCH');
    expect(patch.request.body).toEqual({ estado: ContactRequestStatus.EN_GESTION });
    patch.flush({});
  });
});
