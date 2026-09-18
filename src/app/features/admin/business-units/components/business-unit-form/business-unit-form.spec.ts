import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BusinessUnitResponse } from '../../../../../data/models/business-unit/business-unit-response.model';
import { CompanyResponse } from '../../../../../data/models/company/company-response.model';
import { BusinessUnitForm, BusinessUnitFormSubmission } from './business-unit-form';

const company: CompanyResponse = {
  id: 'company-1',
  razonSocial: 'ISANORTE',
  nombreComercial: 'ISANORTE',
  ruc: '123',
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
  redesSociales: null,
  fechaCreacion: null,
  fechaActualizacion: null,
};
const unit: BusinessUnitResponse = {
  id: 'unit-1',
  nombre: 'Unidad',
  slug: 'unidad',
  descripcion: null,
  icono: null,
  imagenUrl: 'https://example.com/image.jpg',
  activo: false,
  orden: 0,
  empresa: { id: company.id, nombreComercial: company.nombreComercial },
  fechaCreacion: null,
  fechaActualizacion: null,
};
describe('BusinessUnitForm', () => {
  async function fixture(
    mode: 'create' | 'edit',
    businessUnit: BusinessUnitResponse | null,
    companies: CompanyResponse[],
  ) {
    await TestBed.configureTestingModule({ imports: [BusinessUnitForm] }).compileComponents();
    const value = TestBed.createComponent(BusinessUnitForm);
    value.componentRef.setInput('mode', mode);
    value.componentRef.setInput('businessUnit', businessUnit);
    value.componentRef.setInput('companies', companies);
    value.detectChanges();
    return value;
  }
  it('selects the only company when creating', async () => {
    const value = await fixture('create', null, [company]);
    expect(
      (value.nativeElement as HTMLElement).querySelector('#business-unit-company'),
    ).toBeTruthy();
    expect(value.componentInstance.empresaId()).toBe(company.id);
  });
  it('shows the company as read-only in edit mode', async () => {
    const value = await fixture('edit', unit, [company]);
    const element = value.nativeElement as HTMLElement;
    expect(element.querySelector('#business-unit-company')).toBeNull();
    expect(element.textContent).toContain('La empresa asociada no se puede cambiar');
  });
  it('does not emit create when there is no company', async () => {
    const value = await fixture('create', null, []);
    let submission: BusinessUnitFormSubmission | undefined;
    value.componentInstance.saved.subscribe((item) => (submission = item));
    value.componentInstance.nombre.set('Unidad');
    value.componentInstance.slug.set('unidad');
    Array.from((value.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((item) => item.textContent?.includes('Crear unidad'))
      ?.click();
    expect(submission).toBeUndefined();
    expect((value.nativeElement as HTMLElement).textContent).toContain(
      'No hay una empresa registrada',
    );
  });
  it('preserves the current company, false and zero on update', async () => {
    const value = await fixture('edit', unit, [company]);
    let submission: BusinessUnitFormSubmission | undefined;
    value.componentInstance.saved.subscribe((item) => (submission = item));
    Array.from((value.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((item) => item.textContent?.includes('Guardar cambios'))
      ?.click();
    if (submission?.mode === 'edit') {
      expect(submission.request.empresaId).toBe(company.id);
      expect(submission.request.activo).toBe(false);
      expect(submission.request.orden).toBe(0);
    } else {
      expect(submission?.mode).toBe('edit');
    }
  });
  it('renders preview fallback without preventing a valid update', async () => {
    const value = await fixture('edit', unit, [company]);
    (value.nativeElement as HTMLElement).querySelector('img')?.dispatchEvent(new Event('error'));
    value.detectChanges();
    expect((value.nativeElement as HTMLElement).textContent).toContain(
      'La URL todavía puede guardarse',
    );
  });
});
