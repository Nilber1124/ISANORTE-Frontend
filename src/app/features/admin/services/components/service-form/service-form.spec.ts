import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { ServiceResponse } from '../../../../../data/models/service/service-response.model';
import { ServiceApiService } from '../../../../../data/services/service-api.service';
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
    await TestBed.configureTestingModule({
      imports: [ServiceForm],
      providers: [
        {
          provide: ServiceApiService,
          useValue: { checkSlugAvailable: () => of({ available: true }) },
        },
      ],
    }).compileComponents();
    const fixture = TestBed.createComponent(ServiceForm);
    fixture.componentRef.setInput('mode', mode);
    fixture.componentRef.setInput('service', value);
    fixture.detectChanges();
    return fixture;
  }

  function clickButton(fixture: ComponentFixture<ServiceForm>, label: string): void {
    Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'))
      .find((button) => button.textContent?.includes(label))
      ?.click();
    fixture.detectChanges();
  }

  /** En edición el resumen y el texto alternativo de la imagen son obligatorios y el fixture no los trae. */
  function completeRequiredEditFields(fixture: ComponentFixture<ServiceForm>): void {
    fixture.componentInstance.resumen.set('Diseño arquitectónico de proyectos.');
    fixture.componentInstance.imagenAlt.set('Plano arquitectónico');
    fixture.detectChanges();
  }

  it('validates the required text fields on creation and leaves the order optional', async () => {
    const fixture = await createFixture('create');
    clickButton(fixture, 'Crear servicio');
    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Ingresa el nombre del servicio.');
    expect(text).toContain('La ruta no puede estar vacía.');
    expect(text).toContain('Ingresa un resumen del servicio.');
    expect(text).toContain('Ingresa la descripción del servicio.');
    expect(text).not.toContain('Ingresa un número entero');
  });

  it('allows a null order on creation because the backend contract makes it optional', async () => {
    const fixture = await createFixture('create');
    fixture.componentInstance.nombre.set('Construcción');
    fixture.componentInstance.slug.set('construccion');
    fixture.componentInstance.resumen.set('Obras llave en mano.');
    fixture.componentInstance.descripcion.set('Ejecución de obras');
    fixture.detectChanges();
    let submission: ServiceFormSubmission | undefined;
    fixture.componentInstance.saved.subscribe((value) => (submission = value));
    clickButton(fixture, 'Crear servicio');
    expect(submission?.mode).toBe('create');
    if (submission?.mode === 'create') expect(submission.request.orden).toBeNull();
  });

  it('prefills a locked slug, the order and independent publish and highlight switches', async () => {
    const fixture = await createFixture('edit', service);
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector('#service-slug')).toBeNull();
    expect(element.textContent).toContain('isanorte.com/servicios/arquitectura');
    expect((element.querySelector('#service-order') as HTMLInputElement).value).toBe('0');
    const switches = element.querySelectorAll<HTMLButtonElement>('button[role="switch"]');
    expect(switches.length).toBe(2);
    expect(switches[0].getAttribute('aria-checked')).toBe('false');
    expect(switches[1].getAttribute('aria-checked')).toBe('false');
  });

  it('does not save an unchanged edit', async () => {
    const fixture = await createFixture('edit', service);
    let submission: ServiceFormSubmission | undefined;
    fixture.componentInstance.saved.subscribe((value) => (submission = value));
    clickButton(fixture, 'Guardar cambios');
    expect(submission).toBeUndefined();
  });

  it('emits an exact update with false and zero and without project relationships', async () => {
    const fixture = await createFixture('edit', service);
    completeRequiredEditFields(fixture);
    let submission: ServiceFormSubmission | undefined;
    fixture.componentInstance.saved.subscribe((value) => (submission = value));
    clickButton(fixture, 'Guardar cambios');
    expect(submission?.mode).toBe('edit');
    if (submission?.mode === 'edit') {
      expect(submission.request.activo).toBe(false);
      expect(submission.request.destacado).toBe(false);
      expect(submission.request.orden).toBe(0);
      expect('projectIds' in submission.request).toBe(false);
      expect('projects' in submission.request).toBe(false);
    }
  });

  it('submits a valid edit with the image and its alternative text', async () => {
    const fixture = await createFixture('edit', service);
    completeRequiredEditFields(fixture);
    let submission: ServiceFormSubmission | undefined;
    fixture.componentInstance.saved.subscribe((value) => (submission = value));
    clickButton(fixture, 'Guardar cambios');
    expect(submission?.request.imagenUrl).toBe('https://example.com/service.jpg');
    expect(submission?.request.imagenAlt).toBe('Plano arquitectónico');
  });

  it('shows a server error without closing the form', async () => {
    const fixture = await createFixture('edit', service);
    fixture.componentRef.setInput('serverError', 'Ya existe un servicio con ese slug.');
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Ya existe un servicio');
    expect(element.querySelector('app-drawer [role="dialog"]')).toBeTruthy();
  });
});
