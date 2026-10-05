import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AdminIsadecorLanding } from './admin-isadecor-landing';
import { AdminIsadecorLandingFacade } from './admin-isadecor-landing.facade';
import {
  CollectionHighlightConfig,
  DEFAULT_HERO_QUICK_ACCESS_ITEMS,
  HomeQuickAccessItem,
} from '../../../core/services/isadecor-hero-quick-access.service';
import { CategoryResponse } from '../../../data/models/category/category-response.model';

class FacadeStub {
  readonly items = signal<readonly HomeQuickAccessItem[]>(DEFAULT_HERO_QUICK_ACCESS_ITEMS);
  readonly visibleItems = signal<readonly HomeQuickAccessItem[]>(DEFAULT_HERO_QUICK_ACCESS_ITEMS);
  readonly categories = signal<readonly CategoryResponse[]>([
    {
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
    },
  ]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly success = signal<string | null>(null);
  readonly editingItem = signal<HomeQuickAccessItem | null>(null);
  readonly modalOpen = signal(false);

  saved: HomeQuickAccessItem[] = [];
  loadCalls = 0;
  resetCalls = 0;
  deletedItems: string[] = [];

  load(): void {
    this.loadCalls += 1;
  }

  openCreate(): void {
    this.editingItem.set(null);
    this.modalOpen.set(true);
  }

  openEdit(item: HomeQuickAccessItem): void {
    this.editingItem.set(item);
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.editingItem.set(null);
    this.modalOpen.set(false);
  }

  saveItem(item: HomeQuickAccessItem): void {
    this.saved.push(item);
    this.closeModal();
  }

  toggleItemVisibility(item: HomeQuickAccessItem): void {
    item.visible = item.visible === false ? true : false;
  }

  deleteItem(id: string): void {
    this.deletedItems.push(id);
  }

  moveItem(): void {}

  readonly collections = signal<readonly CollectionHighlightConfig[]>([
    {
      id: 'col-1',
      categorySlug: 'wall-panels',
      badge: 'PARED',
      eyebrow: 'Acabados de Pared',
      tagline: 'Textura madera · Fácil instalación click',
      imageUrl: '/images/isadecor-left-1.jpg',
      visible: true,
    },
  ]);
  readonly visibleCollections = signal<readonly CollectionHighlightConfig[]>([
    {
      id: 'col-1',
      categorySlug: 'wall-panels',
      badge: 'PARED',
      eyebrow: 'Acabados de Pared',
      tagline: 'Textura madera · Fácil instalación click',
      imageUrl: '/images/isadecor-left-1.jpg',
      visible: true,
    },
  ]);
  readonly editingCollection = signal<CollectionHighlightConfig | null>(null);
  readonly collectionModalOpen = signal(false);
  savedCollections: CollectionHighlightConfig[] = [];
  resetCollectionCalls = 0;
  deletedCollections: string[] = [];

  openCreateCollection(): void {
    this.editingCollection.set(null);
    this.collectionModalOpen.set(true);
  }

  openEditCollection(col: CollectionHighlightConfig): void {
    this.editingCollection.set(col);
    this.collectionModalOpen.set(true);
  }

  closeCollectionModal(): void {
    this.editingCollection.set(null);
    this.collectionModalOpen.set(false);
  }

  saveCollection(col: CollectionHighlightConfig): void {
    this.savedCollections.push(col);
    this.closeCollectionModal();
  }

  toggleCollectionVisibility(col: CollectionHighlightConfig): void {
    col.visible = col.visible === false ? true : false;
  }

  deleteCollection(id: string): void {
    this.deletedCollections.push(id);
  }

  resetCollectionsToDefaults(): void {
    this.resetCollectionCalls += 1;
  }

  resetToDefaults(): void {
    this.resetCalls += 1;
  }

  clearFeedback(): void {
    this.error.set(null);
    this.success.set(null);
  }
}

describe('AdminIsadecorLanding', () => {
  let fixture: ComponentFixture<AdminIsadecorLanding>;
  let component: AdminIsadecorLanding;
  let facade: FacadeStub;

  beforeEach(async () => {
    facade = new FacadeStub();

    await TestBed.configureTestingModule({
      imports: [AdminIsadecorLanding],
      providers: [provideRouter([])],
    })
      .overrideComponent(AdminIsadecorLanding, {
        set: {
          providers: [{ provide: AdminIsadecorLandingFacade, useValue: facade }],
        },
      })
      .compileComponents();

    fixture = TestBed.createComponent(AdminIsadecorLanding);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders the header and the configured quick access cards', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Landing & Portada ISADECOR');
    expect(text).toContain('Wall Panel WPC');
    expect(text).toContain('Planchas SPC Mármol');
    expect(text).toContain('Cielo Raso PVC');
    expect(text).toContain('Pisos & Molduras');
  });

  it('opens edit modal with item details', () => {
    const firstItem = DEFAULT_HERO_QUICK_ACCESS_ITEMS[0];
    const editButtons = fixture.nativeElement.querySelectorAll('button');
    const editBtn = Array.from(editButtons).find(
      (b: any) => b.textContent?.trim() === 'Editar',
    ) as HTMLButtonElement | undefined;

    expect(editBtn).toBeDefined();
    editBtn?.click();
    fixture.detectChanges();

    expect(facade.editingItem()).toBeTruthy();
    expect(facade.modalOpen()).toBe(true);
    expect(component.editTitle()).toBe(firstItem.title);
  });

  it('delegates resetToDefaults to facade', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const resetBtn = Array.from(buttons).find(
      (b: any) => b.textContent?.trim() === 'Restablecer accesos',
    ) as HTMLButtonElement | undefined;

    expect(resetBtn).toBeDefined();
    resetBtn?.click();

    expect(facade.resetCalls).toBe(1);
  });

  it('saves item with selected category', () => {
    const firstItem = DEFAULT_HERO_QUICK_ACCESS_ITEMS[0];
    component['handleOpenEdit'](firstItem);
    component.editCategorySlug.set('pisos');
    component['handleSave']();

    expect(facade.saved.length).toBe(1);
    expect(facade.saved[0].queryParams).toEqual({ categoria: 'pisos' });
  });

  it('switches to collections tab and displays collections preview', () => {
    component.activeTab.set('collections');
    fixture.detectChanges();

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Nuestras Colecciones');
    expect(text).toContain('Colecciones de la Tienda');
    expect(text).toContain('Visible');
  });

  it('opens and saves collection modal', () => {
    component.activeTab.set('collections');
    fixture.detectChanges();

    const col = facade.collections()[0];
    component['handleOpenEditCollection'](col);
    expect(facade.editingCollection()).toEqual(col);

    component.colBadge.set('TENDENCIA');
    component['handleSaveCollection']();

    expect(facade.savedCollections.length).toBe(1);
    expect(facade.savedCollections[0].badge).toBe('TENDENCIA');
  });

  it('opens create collection modal and prepares empty form', () => {
    component.activeTab.set('collections');
    fixture.detectChanges();

    component['handleOpenCreateCollection']();
    expect(facade.editingCollection()).toBeNull();
    expect(facade.collectionModalOpen()).toBe(true);
    expect(component.colVisible()).toBe(true);
  });

  it('opens create hero card modal and prepares empty form', () => {
    component['handleOpenCreate']();
    expect(facade.editingItem()).toBeNull();
    expect(facade.modalOpen()).toBe(true);
    expect(component.editVisible()).toBe(true);
  });
});
