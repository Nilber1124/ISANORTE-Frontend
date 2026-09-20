import { HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { ContactRequestStatus } from '../../../data/models/contact/contact-request.model';
import { ContactRequestApiService } from '../../../data/services/contact-request-api.service';
import { AdminContactFacade } from './admin-contact.facade';

const request = {
  id: 'request-1',
  nombre: 'Ana',
  email: 'ana@example.com',
  telefono: '999',
  empresa: null,
  mensaje: 'Consulta',
  estado: ContactRequestStatus.NUEVA,
  fechaCreacion: '',
  fechaActualizacion: '',
};
class ContactApiStub {
  getAll = () => of([request]);
  getById = () => of(request);
  changeStatus = () => of({ ...request, estado: ContactRequestStatus.RESPONDIDA });
}
describe('AdminContactFacade', () => {
  it('loads, filters, opens detail and updates status', () => {
    TestBed.configureTestingModule({
      providers: [
        AdminContactFacade,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: ContactRequestApiService, useClass: ContactApiStub },
      ],
    });
    const facade = TestBed.inject(AdminContactFacade);
    facade.load(ContactRequestStatus.NUEVA);
    expect(facade.filter()).toBe(ContactRequestStatus.NUEVA);
    expect(facade.requests()).toHaveLength(1);
    facade.openDetail(request.id);
    facade.changeStatus(ContactRequestStatus.RESPONDIDA);
    expect(facade.selected()?.estado).toBe(ContactRequestStatus.RESPONDIDA);
    expect(facade.requests()).toHaveLength(0);
  });
  it('maps a missing detail to a safe error', () => {
    class MissingApi extends ContactApiStub {
      override getById = () => throwError(() => new HttpErrorResponse({ status: 404 }));
    }
    TestBed.configureTestingModule({
      providers: [
        AdminContactFacade,
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: ContactRequestApiService, useClass: MissingApi },
      ],
    });
    const facade = TestBed.inject(AdminContactFacade);
    facade.openDetail('missing');
    expect(facade.error()).toContain('ya no existe');
  });
});
