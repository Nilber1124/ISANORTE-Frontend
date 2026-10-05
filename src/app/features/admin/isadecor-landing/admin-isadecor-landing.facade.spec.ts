import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { CategoryApiService } from '../../../data/services/category-api.service';
import { IsadecorHeroQuickAccessService } from '../../../core/services/isadecor-hero-quick-access.service';
import { AdminIsadecorLandingFacade } from './admin-isadecor-landing.facade';
import { CategoryResponse } from '../../../data/models/category/category-response.model';

const mockCategory: CategoryResponse = {
  id: 'cat-1',
  nombre: 'Wall Panels',
  slug: 'wall-panels',
  descripcion: 'Paneles decorativos',
  imagenUrl: null,
  activo: true,
  orden: 1,
  unidadNegocio: { id: 'un-1', nombre: 'ISADECOR', slug: 'isadecor' },
  fechaCreacion: null,
  fechaActualizacion: null,
};

class CategoryApiStub {
  getActive() {
    return of([mockCategory]);
  }
}

describe('AdminIsadecorLandingFacade', () => {
  let facade: AdminIsadecorLandingFacade;
  let quickAccessService: IsadecorHeroQuickAccessService;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        AdminIsadecorLandingFacade,
        IsadecorHeroQuickAccessService,
        { provide: CategoryApiService, useClass: CategoryApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    facade = TestBed.inject(AdminIsadecorLandingFacade);
    quickAccessService = TestBed.inject(IsadecorHeroQuickAccessService);
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('loads active categories on load()', () => {
    facade.load();
    expect(facade.categories().length).toBe(1);
    expect(facade.categories()[0].nombre).toBe('Wall Panels');
  });

  it('opens and closes the edit modal', () => {
    const item = facade.items()[0];
    facade.openEdit(item);
    expect(facade.modalOpen()).toBe(true);
    expect(facade.editingItem()?.id).toBe(item.id);

    facade.closeModal();
    expect(facade.modalOpen()).toBe(false);
    expect(facade.editingItem()).toBeNull();
  });

  it('saves an updated item and sets success message', () => {
    const item = facade.items()[0];
    facade.saveItem({ ...item, title: 'Nuevo Título' });

    expect(facade.items()[0].title).toBe('Nuevo Título');
    expect(facade.success()).toContain('Nuevo Título');
    expect(facade.modalOpen()).toBe(false);
  });

  it('moves items up and down properly', () => {
    const firstTitle = facade.items()[0].title;
    const secondTitle = facade.items()[1].title;

    facade.moveItem(0, 'down');

    expect(facade.items()[0].title).toBe(secondTitle);
    expect(facade.items()[1].title).toBe(firstTitle);
    expect(facade.items()[0].index).toBe('01');
    expect(facade.items()[1].index).toBe('02');
  });

  it('resets to defaults', () => {
    const item = facade.items()[0];
    facade.saveItem({ ...item, title: 'Cambiado' });
    expect(facade.items()[0].title).toBe('Cambiado');

    facade.resetToDefaults();
    expect(facade.items()[0].title).toBe('Wall Panel WPC');
    expect(facade.success()).toContain('valores por defecto');
  });

  it('manages collections edit and saving', () => {
    const col = facade.collections()[0];
    facade.openEditCollection(col);
    expect(facade.collectionModalOpen()).toBe(true);
    expect(facade.editingCollection()?.id).toBe(col.id);

    facade.saveCollection({ ...col, badge: 'NUEVO' });
    expect(facade.collections()[0].badge).toBe('NUEVO');
    expect(facade.collectionModalOpen()).toBe(false);

    facade.resetCollectionsToDefaults();
    expect(facade.collections()[0].badge).toBe('PARED');
  });

  it('handles item visibility toggle, creation and deletion', () => {
    const item = facade.items()[0];
    facade.toggleItemVisibility(item);
    expect(facade.visibleItems().length).toBe(3);
    expect(facade.success()).toContain('desactivada');

    facade.toggleItemVisibility(facade.items()[0]);
    expect(facade.visibleItems().length).toBe(4);
    expect(facade.success()).toContain('activada');

    facade.openCreate();
    expect(facade.modalOpen()).toBe(true);
    expect(facade.editingItem()).toBeNull();

    facade.saveItem({
      id: '',
      index: '05',
      tag: 'Novedades',
      title: 'Perfiles Black',
      subtitle: 'Aluminio anodizado',
      queryParams: { categoria: 'pisos' },
    });

    expect(facade.items().length).toBe(5);
    const created = facade.items().find((i) => i.title === 'Perfiles Black');
    expect(created).toBeDefined();

    facade.deleteItem(created!.id);
    expect(facade.items().length).toBe(4);
    expect(facade.success()).toContain('Tarjeta eliminada');
  });
});
