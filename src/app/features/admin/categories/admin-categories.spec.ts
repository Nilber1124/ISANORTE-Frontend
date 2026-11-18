import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessUnitResponse } from '../../../data/models/business-unit/business-unit-response.model';
import { CategoryResponse } from '../../../data/models/category/category-response.model';
import { AdminCategories } from './admin-categories';
import { AdminCategoriesFacade, CategoryFormMode } from './admin-categories.facade';

const category: CategoryResponse = {
  id: 'category-1',
  nombre: 'Wall Panels',
  slug: 'wall-panels',
  descripcion: null,
  imagenUrl: null,
  activo: true,
  orden: 1,
  unidadNegocio: { id: 'unit-1', nombre: 'ISADECOR', slug: 'isadecor' },
  fechaCreacion: null,
  fechaActualizacion: null,
};
const inactiveCategory: CategoryResponse = {
  ...category,
  id: 'category-2',
  nombre: 'Pisos',
  slug: 'pisos',
  activo: false,
  orden: 2,
};

class FacadeStub {
  readonly categories = signal<readonly CategoryResponse[]>([category, inactiveCategory]);
  readonly businessUnits = signal<readonly BusinessUnitResponse[]>([]);
  readonly loading = signal(false);
  readonly loadingFormData = signal(false);
  readonly submitting = signal(false);
  readonly changingActiveId = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly selectedCategory = signal<CategoryResponse | null>(null);
  readonly formMode = signal<CategoryFormMode>('create');
  readonly formOpen = signal(false);
  createOpenCalls = 0;
  edited: CategoryResponse[] = [];
  load(): void {}
  openCreate(): void {
    this.createOpenCalls += 1;
  }
  openEdit(value: CategoryResponse): void {
    this.edited.push(value);
  }
  closeForm(): void {}
  create(): void {}
  update(): void {}
  changeActive(): void {}
  clearFeedback(): void {}
}

describe('AdminCategories', () => {
  let fixture: ComponentFixture<AdminCategories>;
  let facade: FacadeStub;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [AdminCategories] })
      .overrideComponent(AdminCategories, {
        set: { providers: [{ provide: AdminCategoriesFacade, useClass: FacadeStub }] },
      })
      .compileComponents();
    fixture = TestBed.createComponent(AdminCategories);
    facade = fixture.debugElement.injector.get(AdminCategoriesFacade) as unknown as FacadeStub;
    fixture.detectChanges();
  });

  it('renders categories with their active and inactive states', () => {
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('Wall Panels');
    expect(element.textContent).toContain('wall-panels');
    expect(element.textContent).toContain('ISADECOR');
    expect(element.textContent).toContain('Activa');
    expect(element.textContent).toContain('Inactiva');
  });

  it('shows an empty state instead of an empty table', () => {
    facade.categories.set([]);
    fixture.detectChanges();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('No hay categorías registradas');
    expect(element.querySelector('table')).toBeNull();
  });

  it('opens creation from the primary action', () => {
    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    buttons.find((button) => button.textContent?.includes('Nueva categoría'))?.click();
    expect(facade.createOpenCalls).toBe(1);
  });

  it('opens editing with the selected category', () => {
    const buttons = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('button'));
    buttons.find((button) => button.textContent?.includes('Editar'))?.click();
    expect(facade.edited).toEqual([category]);
  });
});
