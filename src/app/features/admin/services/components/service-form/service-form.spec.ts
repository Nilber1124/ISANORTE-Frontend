import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ServiceResponse } from '../../../../../data/models/service/service-response.model';
import { ServiceForm, ServiceFormSubmission } from './service-form';

const service: ServiceResponse = {
  id: 'service-1',
  nombre: 'Arquitectura',
  slug: 'arquitectura',
  resumen: null,
  descripcion: 'Diseño y planificación',
  imagenUrl: 'https://example.com/service.jpg',
  etiqueta: null,
  imagenAlt: null,
  activo: false,
  destacado: false,
  orden: 0,
  beneficios: [],
  fechaCreacion: null,
  fechaActualizacion: null,
};

describe('ServiceForm', () => {
  async function createFixture(
    mode: 'create' | 'edit',
    value: ServiceResponse | null = null,
  ): Promise<ComponentFixture<ServiceForm>> {
    await TestBed.configureTestingModule({ imports: [ServiceForm] }).compileComponents();
    const fixture = TestBed.createComponent(ServiceForm);
    fixture.componentRef.setInput('mode', mode);
    fixture.componentRef.setInput('service', value);
    fixture.detectChanges();
    return fixture;
  }

  it('validates only the required backend text fields on creation', async () => {
    const fixture = await createFixture('create');
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Crear servicio'))
      ?.click();
    fixture.detectChanges();
    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Ingresa el nombre');
    expect(text).toContain('Ingresa el slug');
    expect(text).toContain('Ingresa la descripción');
    expect(text).not.toContain('Ingresa un número entero');
  });

  it('allows a null order on creation because the backend contract makes it optional', async () => {
    const fixture = await createFixture('create');
    fixture.componentInstance.nombre.set('Construcción');
    fixture.componentInstance.slug.set('construccion');
    fixture.componentInstance.descripcion.set('Ejecución de obras');
    let submission: ServiceFormSubmission | undefined;
    fixture.componentInstance.saved.subscribe((value) => (submission = value));
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Crear servicio'))
      ?.click();
    expect(submission?.mode).toBe('create');
    if (submission?.mode === 'create') expect(submission.request.orden).toBeNull();
  });

  it('prefills manual slug, order, featured and active independently', async () => {
    const fixture = await createFixture('edit', service);
    const element = fixture.nativeElement as HTMLElement;
    expect((element.querySelector('#service-slug') as HTMLInputElement).value).toBe('arquitectura');
    expect((element.querySelector('#service-order') as HTMLInputElement).value).toBe('0');
    const checkboxes = element.querySelectorAll<HTMLInputElement>('input[type="checkbox"]');
    expect(checkboxes[0].checked).toBe(false);
    expect(checkboxes[1].checked).toBe(false);
  });

  it('emits an exact update with false and zero and without project relationships', async () => {
    const fixture = await createFixture('edit', service);
    let submission: ServiceFormSubmission | undefined;
    fixture.componentInstance.saved.subscribe((value) => (submission = value));
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Guardar cambios'))
      ?.click();
    expect(submission?.mode).toBe('edit');
    if (submission?.mode === 'edit') {
      expect(submission.request.activo).toBe(false);
      expect(submission.request.destacado).toBe(false);
      expect(submission.request.orden).toBe(0);
      expect('projectIds' in submission.request).toBe(false);
      expect('projects' in submission.request).toBe(false);
    }
  });

  it('keeps image preview failure separate from form validity', async () => {
    const fixture = await createFixture('edit', service);
    const image = (fixture.nativeElement as HTMLElement).querySelector('img');
    image?.dispatchEvent(new Event('error'));
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'La URL todavía puede guardarse',
    );
    let submission: ServiceFormSubmission | undefined;
    fixture.componentInstance.saved.subscribe((value) => (submission = value));
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((button) => button.textContent?.includes('Guardar cambios'))
      ?.click();
    expect(submission).toBeTruthy();
  });

  it('shows a server error without closing the form', async () => {
    const fixture = await createFixture('edit', service);
    fixture.componentRef.setInput('serverError', 'Ya existe un servicio con ese slug.');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Ya existe un servicio');
    expect((fixture.nativeElement as HTMLElement).querySelector('app-modal')).toBeTruthy();
  });
});
