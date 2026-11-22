import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { BusinessUnitResourceType } from '../models/business-unit/business-unit-resource.model';
import { BusinessUnitApiService } from './business-unit-api.service';
import { CompanyApiService } from './company-api.service';
import { LandingSectionApiService } from './landing-section-api.service';
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

  it('uses exact Landing scene child paths and payloads', () => {
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
  });

  it('does not expose write operations for the fixed Landing buttons', () => {
    const api = TestBed.inject(LandingSectionApiService) as unknown as Record<string, unknown>;
    expect(api['createAction']).toBeUndefined();
    expect(api['updateAction']).toBeUndefined();
    expect(api['deleteAction']).toBeUndefined();
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
});
