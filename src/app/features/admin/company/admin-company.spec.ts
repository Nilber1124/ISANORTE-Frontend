import { PLATFORM_ID } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CompanyApiService } from '../../../data/services/company-api.service';
import { AdminCompany } from './admin-company';
import { AdminCompanyFacade } from './admin-company.facade';

describe('AdminCompany', () => {
  let component: AdminCompany;
  let fixture: ComponentFixture<AdminCompany>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCompany],
      providers: [
        {
          provide: CompanyApiService,
          useValue: { getAll: () => of([]) },
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
    expect(component.onlyAbout()).toBe(false);
  });

  it('debe mostrar la estructura completa de Empresa según la API cuando onlyAbout es false', () => {
    expect(component.onlyAbout()).toBe(false);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Empresa');
  });

  it('debe mostrar sólo contenido de Nosotros y ocultar datos corporativos cuando onlyAbout es true', () => {
    fixture.componentRef.setInput('onlyAbout', true);
    fixture.detectChanges();
    expect(component.onlyAbout()).toBe(true);

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h2')?.textContent).toContain('Nosotros');
    expect(compiled.textContent).not.toContain('Ubicación & Canales de Contacto');
    expect(compiled.textContent).not.toContain('Redes Sociales');
    expect(compiled.textContent).not.toContain('Datos Fiscales');
  });
});
