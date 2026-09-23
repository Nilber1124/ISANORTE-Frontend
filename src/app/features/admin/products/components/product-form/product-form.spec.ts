import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessUnitResponse } from '../../../../../data/models/business-unit/business-unit-response.model';
import { CategoryResponse } from '../../../../../data/models/category/category-response.model';
import { ProductAvailability } from '../../../../../data/models/product/product-availability.enum';
import { ProductPublicationStatus } from '../../../../../data/models/product/product-publication-status.enum';
import { ProductResponse } from '../../../../../data/models/product/product-response.model';
import { ProductForm, ProductFormSubmission } from './product-form';

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
  fechaCreacion: null,
  fechaActualizacion: null,
};
const otherUnit: BusinessUnitResponse = {
  ...unit,
  id: 'unit-2',
  nombre: 'Academia',
  slug: 'academia',
};
const category: CategoryResponse = {
  id: 'category-1',
  nombre: 'Wall Panels',
  slug: 'wall-panels',
  descripcion: null,
  imagenUrl: null,
  activo: true,
  orden: 1,
  unidadNegocio: { id: unit.id, nombre: unit.nombre, slug: unit.slug },
  fechaCreacion: null,
  fechaActualizacion: null,
};
const globalCategory: CategoryResponse = {
  ...category,
  id: 'category-global',
  nombre: 'Global',
  slug: 'global',
  unidadNegocio: null,
};
const foreignCategory: CategoryResponse = {
  ...category,
  id: 'category-foreign',
  nombre: 'Academia',
  slug: 'academia',
  unidadNegocio: { id: otherUnit.id, nombre: otherUnit.nombre, slug: otherUnit.slug },
};
const product: ProductResponse = {
  id: 'product-1',
  sku: 'WP-001',
  nombre: 'Wall Panel Roble',
  slug: 'wall-panel-roble',
  resumen: 'Resumen',
  descripcion: 'Panel decorativo',
  precioBase: null,
  precioAnterior: 60,
  descuentoPorcentaje: 10,
  disponibilidad: ProductAvailability.BAJO_PEDIDO,
  destacado: true,
  estado: ProductPublicationStatus.OCULTO,
  tituloSeo: 'Wall Panel',
  descripcionSeo: null,
  unidadNegocio: { id: unit.id, nombre: unit.nombre, slug: unit.slug },
  categorias: [{ id: category.id, nombre: category.nombre, slug: category.slug }],
  variantes: [
    {
      id: 'variant-1',
      sku: 'V-1',
      nombre: 'Roble',
      descripcion: null,
      precio: null,
      disponible: true,
      imagenUrl: null,
      orden: 1,
    },
  ],
  imagenes: [],
  especificaciones: [],
  documentos: [],
  configuracionCalculo: null,
  fechaCreacion: null,
  fechaActualizacion: null,
};

describe('ProductForm', () => {
  let fixture: ComponentFixture<ProductForm>;

  async function render(
    mode: 'create' | 'edit' = 'create',
    value: ProductResponse | null = null,
  ): Promise<HTMLElement> {
    await TestBed.configureTestingModule({ imports: [ProductForm] }).compileComponents();
    fixture = TestBed.createComponent(ProductForm);
    fixture.componentRef.setInput('mode', mode);
    fixture.componentRef.setInput('product', value);
    fixture.componentRef.setInput('businessUnits', [unit]);
    fixture.componentRef.setInput('categories', [category]);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  function saveButton(element: HTMLElement): HTMLButtonElement {
    return Array.from(element.querySelectorAll('button')).find((button) =>
      button.textContent?.includes('Guardar producto'),
    )!;
  }

  it('requires SKU, name, slug, description and business unit', async () => {
    const element = await render();
    const submissions: ProductFormSubmission[] = [];
    fixture.componentInstance.saved.subscribe((submission) => submissions.push(submission));
    saveButton(element).click();
    fixture.detectChanges();
    expect(element.textContent).toContain('Ingresa el SKU');
    expect(element.textContent).toContain('Ingresa el nombre');
    expect(element.textContent).toContain('Ingresa el slug');
    expect(element.textContent).toContain('Ingresa la descripción');
    expect(element.textContent).toContain('Selecciona una unidad');
    expect(submissions).toEqual([]);
  });

  it('validates non-negative prices and discount between 0 and 100', async () => {
    const element = await render();
    fixture.componentInstance.precioBase.set('-1');
    fixture.componentInstance.precioAnterior.set('invalid');
    fixture.componentInstance.descuentoPorcentaje.set('101');
    saveButton(element).click();
    fixture.detectChanges();
    expect(element.textContent).toContain('mayor o igual a 0');
    expect(element.textContent).toContain('porcentaje entre 0 y 100');
  });

  it('automatically calculates final base price when discount is updated', async () => {
    await render();
    const instance = fixture.componentInstance as unknown as {
      updatePrecioAnterior(val: string): void;
      updateDescuento(val: string): void;
    };
    instance.updatePrecioAnterior('100');
    instance.updateDescuento('20');
    expect(fixture.componentInstance.precioBase()).toBe('80');

    instance.updateDescuento('15.5');
    expect(fixture.componentInstance.precioBase()).toBe('84.5');
  });

  it('emits UUID relations and preserves empty prices as null on create', async () => {
    const element = await render();
    const submissions: ProductFormSubmission[] = [];
    fixture.componentInstance.saved.subscribe((submission) => submissions.push(submission));
    fixture.componentInstance.sku.set('TEST-001');
    fixture.componentInstance.nombre.set('Producto prueba');
    fixture.componentInstance.slug.set('producto-prueba');
    fixture.componentInstance.descripcion.set('Descripción');
    fixture.componentInstance.unidadNegocioId.set(unit.id);
    fixture.componentInstance.categoriaIds.set([category.id]);
    saveButton(element).click();
    expect(submissions).toHaveLength(1);
    expect(submissions[0].request.unidadNegocioId).toBe(unit.id);
    expect(submissions[0].request.categoriaIds).toEqual([category.id]);
    expect(submissions[0].request.precioBase).toBeNull();
    expect('variantes' in submissions[0].request).toBe(false);
  });

  it('populates editing and emits an update without child collections', async () => {
    const element = await render('edit', product);
    const submissions: ProductFormSubmission[] = [];
    fixture.componentInstance.saved.subscribe((submission) => submissions.push(submission));
    expect(fixture.componentInstance.disponibilidad()).toBe(ProductAvailability.BAJO_PEDIDO);
    expect(fixture.componentInstance.estado()).toBe(ProductPublicationStatus.OCULTO);
    expect(fixture.componentInstance.categoriaIds()).toEqual([category.id]);
    saveButton(element).click();
    expect(submissions).toHaveLength(1);
    expect(submissions[0].mode).toBe('edit');
    expect('variantes' in submissions[0].request).toBe(false);
    expect(element.textContent).toContain('Contenido avanzado preservado');
  });

  it('disables submit while a request is in progress', async () => {
    const element = await render();
    fixture.componentRef.setInput('submitting', true);
    fixture.detectChanges();
    expect(saveButton(element).disabled).toBe(true);
  });

  it('only exposes compatible and global categories, clearing invalid selections on unit change', async () => {
    await render();
    fixture.componentRef.setInput('businessUnits', [unit, otherUnit]);
    fixture.componentRef.setInput('categories', [category, globalCategory, foreignCategory]);
    fixture.componentInstance.categoriaIds.set([category.id, globalCategory.id, foreignCategory.id]);

    const updateBusinessUnit = fixture.componentInstance as unknown as {
      updateBusinessUnit(value: string): void;
    };
    updateBusinessUnit.updateBusinessUnit(unit.id);
    expect(fixture.componentInstance.availableCategories().map((item) => item.id)).toEqual([
      category.id,
      globalCategory.id,
    ]);
    expect(fixture.componentInstance.categoriaIds()).toEqual([category.id, globalCategory.id]);

    updateBusinessUnit.updateBusinessUnit(otherUnit.id);
    expect(fixture.componentInstance.availableCategories().map((item) => item.id)).toEqual([
      globalCategory.id,
      foreignCategory.id,
    ]);
    expect(fixture.componentInstance.categoriaIds()).toEqual([globalCategory.id]);
  });
});
