import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { CompanyApiService } from '../../../data/services/company-api.service';
import { AdminCompany } from './admin-company';
import { AdminCompanyFacade } from './admin-company.facade';

const COMPANY = {
  id: 'c1', razonSocial: 'ISANORTE SAC', nombreComercial: 'ISANORTE', ruc: '20123456789', direccion: 'Av. 1', ciudad: 'Cajamarca',
  telefono: '999', telefonoSecundario: null, whatsapp: '999', email: 'a@b.co', emailVentas: null, horarioAtencion: null,
  anioFundacion: 2012, zonaCobertura: null, tiempoRespuesta: null, latitud: null, longitud: null,
  resumenNosotros: 'Resumen de prueba', mision: 'Misión', vision: 'Visión', valores: 'Valores',
  redesSociales: [], estadisticas: [],
} as never;

describe('AdminCompany', () => {
  let component: AdminCompany;
  let fixture: ComponentFixture<AdminCompany>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCompany],
      providers: [
        provideRouter([]),
        {
          provide: CompanyApiService,
          useValue: { getAll: () => of([COMPANY]) },
        },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminCompany);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente', () => {
    expect(component).toBeTruthy();
    expect(component.showLegalData()).toBe(true);
  });

  it('debe mostrar la estructura completa de Empresa según la API', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Empresa');
    expect(compiled.textContent).toContain('Datos Fiscales');
  });

  it('el resumen institucional se edita aquí y la misión, visión y valores llevan a la vista previa de Nosotros', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('[data-company-summary]')?.textContent).toContain('Resumen de prueba');
    const link = compiled.querySelector('[data-company-philosophy-link] a') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toContain('/admin/landing');
    expect(link.getAttribute('href')).toContain('tab=nosotros');
    // La filosofía ya no se muestra duplicada en esta pantalla.
    expect(compiled.textContent).not.toContain('Filosofía Corporativa');
  });
});
