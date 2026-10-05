import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessUnitResponse } from '../../../data/models/business-unit/business-unit-response.model';
import { CategoryResponse } from '../../../data/models/category/category-response.model';
import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { ProductPublicationStatus } from '../../../data/models/product/product-publication-status.enum';
import { ProductResponse } from '../../../data/models/product/product-response.model';
import { AdminProducts } from './admin-products';
import { AdminProductsFacade, ProductFormMode } from './admin-products.facade';

const product: ProductResponse = {
  id: 'product-1',
  sku: 'WP-001',
  nombre: 'Wall Panel Roble',
  slug: 'wall-panel-roble',
  resumen: null,
  descripcion: 'Panel decorativo',
  precioBase: null,
  precioAnterior: null,
  descuentoPorcentaje: null,
  disponibilidad: ProductAvailability.DISPONIBLE,
  destacado: true,
  estado: ProductPublicationStatus.PUBLICADO,
  tituloSeo: null,
  descripcionSeo: null,
  unidadNegocio: { id: 'unit-1', nombre: 'ISADECOR', slug: 'isadecor' },
  categorias: [{ id: 'category-1', nombre: 'Wall Panels', slug: 'wall-panels' }],
  variantes: [],
  imagenes: [],
  especificaciones: [],
  documentos: [],
  configuracionCalculo: null,
  fechaCreacion: null,
  fechaActualizacion: null,
};

class FacadeStub {
  readonly products = signal<readonly ProductResponse[]>([product]);
  readonly categories = signal<readonly CategoryResponse[]>([]);
  readonly businessUnits = signal<readonly BusinessUnitResponse[]>([]);
  readonly loading = signal(false);
  readonly loadingFormData = signal(false);
  readonly submitting = signal(false);
  readonly changingStatusId = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly selectedProduct = signal<ProductResponse | null>(null);
  readonly formMode = signal<ProductFormMode>('create');
  readonly formOpen = signal(false);
  createOpenCalls = 0;
  edited: ProductResponse[] = [];
  load(): void {}
  openCreate(): void {
    this.createOpenCalls += 1;
  }
  openEdit(value: ProductResponse): void {
    this.edited.push(value);
  }
  closeForm(): void {}
  create(): void {}
  update(): void {}
  changeStatus(): void {}
  clearFeedback(): void {}
}

describe('AdminProducts', () => {
  let fixture: ComponentFixture<AdminProducts>;
  let facade: FacadeStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AdminProducts] })
      .overrideComponent(AdminProducts, {
        set: { providers: [{ provide: AdminProductsFacade, useClass: FacadeStub }] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(AdminProducts);
    facade = fixture.debugElement.injector.get(AdminProductsFacade) as unknown as FacadeStub;
    fixture.detectChanges();
  });

  it('renders products and keeps state separate from availability', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent;
    expect(text).toContain('Wall Panel Roble');
    expect(text).toContain('WP-001');
    expect(text).toContain('Wall Panels');
    expect(text).toContain('Sin precio');
    expect(text).toContain('Disponible');
    expect(text).toContain('Publicado');
  });

  it('shows an empty state instead of an empty table', () => {
    facade.products.set([]);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('No hay productos registrados');
    expect(element.querySelector('table')).toBeNull();
  });

  it('opens creation from the primary action', () => {
    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    buttons.find((button) => button.textContent?.includes('Nuevo producto'))?.click();
    expect(facade.createOpenCalls).toBe(1);
  });

  it('opens editing with the selected product', () => {
    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    buttons.find((button) => button.textContent?.includes('Editar'))?.click();
    expect(facade.edited).toEqual([product]);
  });

  it('opens the publication-state control with the current state selected', () => {
    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    buttons.find((button) => button.textContent?.includes('Cambiar estado'))?.click();
    fixture.detectChanges();
    expect(fixture.componentInstance.statusProduct()).toEqual(product);
    expect(fixture.componentInstance.nextStatus()).toBe(ProductPublicationStatus.PUBLICADO);
    expect((fixture.nativeElement as HTMLElement).textContent).toContain(
      'no modifica la disponibilidad',
    );
  });
});
