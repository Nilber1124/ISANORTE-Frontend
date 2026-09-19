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
  });
});
