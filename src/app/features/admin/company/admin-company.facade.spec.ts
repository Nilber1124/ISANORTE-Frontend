import { HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';

import { CompanyCreateRequest } from '../../../data/models/company/company-create-request.model';
import { CompanyResponse, SocialNetworkResponse } from '../../../data/models/company/company-response.model';
import { CompanyUpdateRequest } from '../../../data/models/company/company-update-request.model';
import { SocialNetworkRequest } from '../../../data/models/company/social-network-request.model';
import { CompanyApiService } from '../../../data/services/company-api.service';
import { AdminCompanyFacade } from './admin-company.facade';

const mockNetwork: SocialNetworkResponse = {
  id: 'sn-1',
  nombre: 'Facebook',
  url: 'https://fb.com',
  icono: 'facebook',
  orden: 0,
  activo: false,
};

const mockCompany: CompanyResponse = {
  id: 'cmp-1',
  razonSocial: 'ISANORTE S.A.C.',
  nombreComercial: 'ISANORTE',
  ruc: '20000000000',
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
  redesSociales: [mockNetwork],
  fechaCreacion: null,
  fechaActualizacion: null,
};

class CompanyApiStub {
  getAllResponse$: Observable<CompanyResponse[]> = of([mockCompany]);
  createResponse$: Observable<CompanyResponse> = of(mockCompany);
  updateResponse$: Observable<CompanyResponse> = of(mockCompany);
  createSnResponse$: Observable<SocialNetworkResponse> = of(mockNetwork);
  updateSnResponse$: Observable<SocialNetworkResponse> = of(mockNetwork);
  deleteSnResponse$: Observable<void> = of(undefined);

  createRequests: CompanyCreateRequest[] = [];
  updateRequests: Array<{ id: string; request: CompanyUpdateRequest }> = [];
  deleteSnRequests: Array<{ companyId: string; snId: string }> = [];

  getAll() { return this.getAllResponse$; }
  create(request: CompanyCreateRequest) {
    this.createRequests.push(request);
    return this.createResponse$;
  }
  update(id: string, request: CompanyUpdateRequest) {
    this.updateRequests.push({ id, request });
    return this.updateResponse$;
  }
  createSocialNetwork(companyId: string, request: SocialNetworkRequest) { return this.createSnResponse$; }
  updateSocialNetwork(companyId: string, snId: string, request: SocialNetworkRequest) { return this.updateSnResponse$; }
  deleteSocialNetwork(companyId: string, snId: string) {
    this.deleteSnRequests.push({ companyId, snId });
    return this.deleteSnResponse$;
  }
}

describe('AdminCompanyFacade', () => {
  let facade: AdminCompanyFacade;
  let companyApi: CompanyApiStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminCompanyFacade,
        CompanyApiStub,
        { provide: CompanyApiService, useExisting: CompanyApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    facade = TestBed.inject(AdminCompanyFacade);
    companyApi = TestBed.inject(CompanyApiStub);
  });

  describe('Carga inicial', () => {
    it('debe cargar la lista vacía de empresas', () => {
      companyApi.getAllResponse$ = of([]);
      facade.load();
      expect(facade.loading()).toBe(false);
      expect(facade.companies()).toEqual([]);
      expect(facade.company()).toBeNull();
    });

    it('debe autoseleccionar si hay exactamente una empresa', () => {
      companyApi.getAllResponse$ = of([mockCompany]);
      facade.load();
      expect(facade.companies().length).toBe(1);
      expect(facade.company()).toEqual(mockCompany);
    });

    it('no debe autoseleccionar si hay más de una empresa', () => {
      const mockCompany2 = { ...mockCompany, id: 'cmp-2' };
      companyApi.getAllResponse$ = of([mockCompany, mockCompany2]);
      facade.load();
      expect(facade.companies().length).toBe(2);
      expect(facade.company()).toBeNull(); // Requires manual selection
    });
  });

  describe('Empresa', () => {
    beforeEach(() => {
      companyApi.getAllResponse$ = of([mockCompany]);
      facade.load();
    });

    it('debe crear empresa y seleccionarla', () => {
      const newCompany = { ...mockCompany, id: 'new-id' };
      companyApi.createResponse$ = of(newCompany);
      facade.createCompany({
        razonSocial: 'New',
        nombreComercial: 'New',
        ruc: '123',
      });
      expect(companyApi.createRequests.length).toBe(1);
      expect(facade.companies().length).toBe(2);
      expect(facade.company()).toEqual(newCompany); // Se autoselecciona la recién creada
      expect(facade.submitting()).toBe(false);
    });

    it('debe actualizar empresa sin enviar redes sociales', () => {
      companyApi.updateResponse$ = of({ ...mockCompany, razonSocial: 'Updated' });
      facade.updateCompany({
        razonSocial: 'Updated',
        nombreComercial: 'ISANORTE',
        ruc: '20000000000',
      });
      expect(companyApi.updateRequests[0].request.razonSocial).toBe('Updated');
      expect(facade.company()?.razonSocial).toBe('Updated');
    });

    it('maneja error 400', () => {
      companyApi.updateResponse$ = throwError(() => new HttpErrorResponse({ status: 400 }));
      facade.updateCompany({
        razonSocial: 'Updated',
        nombreComercial: 'ISANORTE',
        ruc: '200',
      });
      expect(facade.error()).toBe('Revisa los datos ingresados e inténtalo nuevamente.');
      expect(facade.submitting()).toBe(false);
    });

    it('maneja error 404', () => {
      companyApi.updateResponse$ = throwError(() => new HttpErrorResponse({ status: 404 }));
      facade.updateCompany({
        razonSocial: 'Updated',
        nombreComercial: 'ISANORTE',
        ruc: '200',
      });
      expect(facade.error()).toBe('La empresa o red social solicitada ya no existe.');
      expect(facade.submitting()).toBe(false);
    });

    it('maneja error 409', () => {
      companyApi.updateResponse$ = throwError(() => new HttpErrorResponse({ status: 409 }));
      facade.updateCompany({
        razonSocial: 'Updated',
        nombreComercial: 'ISANORTE',
        ruc: '200',
      });
      expect(facade.error()).toBe('No se pudo guardar porque existe un conflicto (ej. RUC duplicado).');
      expect(facade.submitting()).toBe(false);
    });
  });

  describe('Red Social', () => {
    beforeEach(() => {
      companyApi.getAllResponse$ = of([mockCompany]);
      facade.load();
    });

    it('debe crear red social y actualizar el estado', () => {
      const newSn: SocialNetworkResponse = { id: 'sn-2', nombre: 'IG', url: 'https://ig.com', icono: null, orden: 1, activo: true };
      companyApi.createSnResponse$ = of(newSn);
      facade.createSocialNetwork({ nombre: 'IG', url: 'https://ig.com', orden: 1, activo: true });
      expect(facade.company()?.redesSociales?.length).toBe(2);
      expect(facade.savingSocialNetwork()).toBe(false);
    });

    it('debe actualizar red social (activo=false, orden=0)', () => {
      const updatedSn: SocialNetworkResponse = { ...mockNetwork, nombre: 'FB', orden: 0, activo: false };
      companyApi.updateSnResponse$ = of(updatedSn);
      facade.openSocialNetworkEdit(mockNetwork);
      facade.updateSocialNetwork({ nombre: 'FB', url: 'https://fb.com', orden: 0, activo: false });
      const updatedCompanySn = facade.company()?.redesSociales?.find(n => n.id === 'sn-1');
      expect(updatedCompanySn?.orden).toBe(0);
      expect(updatedCompanySn?.activo).toBe(false);
      expect(facade.savingSocialNetwork()).toBe(false);
    });

    it('debe eliminar red social', () => {
      companyApi.deleteSnResponse$ = of(undefined);
      facade.deleteSocialNetwork('sn-1');
      expect(companyApi.deleteSnRequests).toEqual([{ companyId: 'cmp-1', snId: 'sn-1' }]);
      expect(facade.company()?.redesSociales?.length).toBe(0);
    });
  });
});
