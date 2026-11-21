import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessUnitResponse } from '../../../../../data/models/business-unit/business-unit-response.model';
import { CategoryResponse } from '../../../../../data/models/category/category-response.model';
import { CategoryForm, CategoryFormSubmission } from './category-form';

const unit: BusinessUnitResponse = {
  id: 'unit-1',
  nombre: 'ISADECOR',
  slug: 'isadecor',
  descripcion: null,
  icono: null,
  imagenUrl: null,
  imagenAlt: null,
  activo: true,
  destacado: false,
  orden: 1,
  empresa: { id: 'company-1', nombreComercial: 'ISANORTE' },
  recursos: [],
  catalogos: [],
  fechaCreacion: null,
  fechaActualizacion: null,
};
const category: CategoryResponse = {
  id: 'category-1',
  nombre: 'Wall Panels',
  slug: 'wall-panels',
  descripcion: 'Paneles',
  imagenUrl: null,
  activo: false,
  orden: 3,
  unidadNegocio: { id: unit.id, nombre: unit.nombre, slug: unit.slug },
  fechaCreacion: null,
  fechaActualizacion: null,
};

describe('CategoryForm', () => {
  let fixture: ComponentFixture<CategoryForm>;

  async function render(
    mode: 'create' | 'edit' = 'create',
    value: CategoryResponse | null = null,
  ): Promise<HTMLElement> {
    await TestBed.configureTestingModule({ imports: [CategoryForm] }).compileComponents();
    fixture = TestBed.createComponent(CategoryForm);
    fixture.componentRef.setInput('mode', mode);
    fixture.componentRef.setInput('category', value);
    fixture.componentRef.setInput('businessUnits', [unit]);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function saveButton(element: HTMLElement): HTMLButtonElement {
    return Array.from(element.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Guardar categoría'),
    )!;
  }

  it('shows required validation messages and does not submit invalid data', async () => {
    const element = await render();
    const submissions: CategoryFormSubmission[] = [];
    fixture.componentInstance.saved.subscribe((submission) => submissions.push(submission));
    fixture.componentInstance.nombre.set('');
    fixture.componentInstance.slug.set('');
    fixture.componentInstance.orden.set('1.5');
    saveButton(element).click();
    fixture.detectChanges();
    expect(element.textContent).toContain('Ingresa el nombre');
    expect(element.textContent).toContain('Ingresa el slug');
    expect(element.textContent).toContain('número entero');
    expect(submissions).toEqual([]);
  });

  it('populates edit values and emits an exact update request', async () => {
    const element = await render('edit', category);
    const submissions: CategoryFormSubmission[] = [];
    fixture.componentInstance.saved.subscribe((submission) => submissions.push(submission));
    expect(fixture.componentInstance.nombre()).toBe('Wall Panels');
    expect(fixture.componentInstance.unidadNegocioId()).toBe(unit.id);
    saveButton(element).click();
    expect(submissions).toEqual([
      {
        mode: 'edit',
        request: {
          nombre: 'Wall Panels',
          slug: 'wall-panels',
          descripcion: 'Paneles',
          imagenUrl: null,
          activo: false,
          orden: 3,
          unidadNegocioId: unit.id,
          categoriaPadreId: null,
        },
      },
    ]);
  });

  it('disables submit while a request is in progress', async () => {
    const element = await render();
    fixture.componentRef.setInput('submitting', true);
    fixture.detectChanges();
    expect(saveButton(element).disabled).toBe(true);
  });

  describe('subcategorías', () => {
    const root = (id: string, nombre: string): CategoryResponse => ({
      ...category,
      id,
      nombre,
      slug: nombre.toLowerCase(),
      categoriaPadre: null,
    });
    const child = (id: string, padre: CategoryResponse): CategoryResponse => ({
      ...category,
      id,
      nombre: 'Hija',
      slug: 'hija',
      categoriaPadre: { id: padre.id, nombre: padre.nombre, slug: padre.slug },
    });

    it('ofrece solo categorías raíz como padre y envía el elegido', async () => {
      const pisos = root('pisos-id', 'Pisos');
      const paredes = root('paredes-id', 'Paredes');
      const hija = child('hija-id', pisos);
      const element = await render('create');
      fixture.componentRef.setInput('allCategories', [pisos, paredes, hija]);
      fixture.detectChanges();

      expect(fixture.componentInstance.parentCategoryOptions().map((option) => option.value)).toEqual([
        '',
        'pisos-id',
        'paredes-id',
      ]);

      const submissions: CategoryFormSubmission[] = [];
      fixture.componentInstance.saved.subscribe((submission) => submissions.push(submission));
      fixture.componentInstance.nombre.set('Nueva');
      fixture.componentInstance.slug.set('nueva');
      fixture.componentInstance.categoriaPadreId.set('pisos-id');
      saveButton(element).click();

      expect(submissions[0].request.categoriaPadreId).toBe('pisos-id');
    });

    it('no deja colgar de otra una categoría que ya tiene subcategorías', async () => {
      const pisos = root('pisos-id', 'Pisos');
      const hija = child('hija-id', pisos);
      await render('edit', pisos);
      fixture.componentRef.setInput('allCategories', [pisos, hija]);
      fixture.detectChanges();

      expect(fixture.componentInstance.hasSubcategories()).toBe(true);
      expect(fixture.nativeElement.textContent).toContain('tiene subcategorías');
    });
  });
});
