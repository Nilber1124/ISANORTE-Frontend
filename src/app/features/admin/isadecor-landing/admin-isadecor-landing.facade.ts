import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

import { CategoryResponse } from '../../../data/models/category/category-response.model';
import { CategoryApiService } from '../../../data/services/category-api.service';
import {
  CollectionHighlightConfig,
  HomeQuickAccessItem,
  IsadecorHeroQuickAccessService,
} from '../../../core/services/isadecor-hero-quick-access.service';

@Injectable()
export class AdminIsadecorLandingFacade {
  private readonly quickAccessService = inject(IsadecorHeroQuickAccessService);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly platformId = inject(PLATFORM_ID);

  readonly items = this.quickAccessService.items;
  readonly visibleItems = this.quickAccessService.visibleItems;
  readonly collections = this.quickAccessService.collections;

  private readonly _categories = signal<readonly CategoryResponse[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _success = signal<string | null>(null);
  private readonly _editingItem = signal<HomeQuickAccessItem | null>(null);
  private readonly _modalOpen = signal(false);

  private readonly _editingCollection = signal<CollectionHighlightConfig | null>(null);
  private readonly _collectionModalOpen = signal(false);

  readonly categories = this._categories.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly success = this._success.asReadonly();
  readonly editingItem = this._editingItem.asReadonly();
  readonly modalOpen = this._modalOpen.asReadonly();

  readonly editingCollection = this._editingCollection.asReadonly();
  readonly collectionModalOpen = this._collectionModalOpen.asReadonly();

  load(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this._loading.set(true);
    this.categoryApi.getActive().subscribe({
      next: (cats) => {
        const isadecorCats = cats.filter(
          (c) =>
            !c.unidadNegocio ||
            c.unidadNegocio.slug === 'isadecor' ||
            c.unidadNegocio.nombre?.toLowerCase().includes('isadecor'),
        );
        this._categories.set(isadecorCats.length > 0 ? isadecorCats : cats);
        this._loading.set(false);
      },
      error: () => {
        this._loading.set(false);
      },
    });
  }

  openCreate(): void {
    this._editingItem.set(null);
    this._error.set(null);
    this._modalOpen.set(true);
  }

  openEdit(item: HomeQuickAccessItem): void {
    this._editingItem.set({ ...item, queryParams: { ...item.queryParams } });
    this._error.set(null);
    this._modalOpen.set(true);
  }

  closeModal(): void {
    this._editingItem.set(null);
    this._modalOpen.set(false);
  }

  saveItem(updated: HomeQuickAccessItem): void {
    if (updated.id) {
      this.quickAccessService.updateItem(updated.id, updated);
      this._success.set(`Tarjeta "${updated.title}" actualizada correctamente.`);
    } else {
      this.quickAccessService.addItem(updated);
      this._success.set(`Nueva tarjeta "${updated.title}" agregada al Hero.`);
    }
    this._error.set(null);
    this.closeModal();
  }

  toggleItemVisibility(item: HomeQuickAccessItem): void {
    this.quickAccessService.toggleItemVisibility(item.id);
    const nowVisible = item.visible === false;
    this._success.set(
      nowVisible
        ? `Tarjeta "${item.title}" activada: ahora se muestra en el Hero.`
        : `Tarjeta "${item.title}" desactivada: ocultada del Hero.`,
    );
  }

  deleteItem(id: string): void {
    this.quickAccessService.deleteItem(id);
    this._success.set('Tarjeta eliminada del listado.');
  }

  moveItem(index: number, direction: 'up' | 'down'): void {
    const current = [...this.items()];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= current.length) return;

    const temp = current[index];
    current[index] = current[targetIndex];
    current[targetIndex] = temp;

    // Normalize indices 01, 02, ...
    const reindexed = current.map((item, idx) => ({
      ...item,
      index: String(idx + 1).padStart(2, '0'),
    }));

    this.quickAccessService.saveAll(reindexed);
    this._success.set('Orden de tarjetas actualizado.');
  }

  resetToDefaults(): void {
    this.quickAccessService.resetToDefaults();
    this._success.set('Tarjetas restablecidas a sus valores por defecto.');
    this._error.set(null);
  }

  readonly visibleCollections = this.quickAccessService.visibleCollections;

  openCreateCollection(): void {
    this._editingCollection.set(null);
    this._error.set(null);
    this._collectionModalOpen.set(true);
  }

  openEditCollection(col: CollectionHighlightConfig): void {
    this._editingCollection.set({ ...col });
    this._error.set(null);
    this._collectionModalOpen.set(true);
  }

  closeCollectionModal(): void {
    this._editingCollection.set(null);
    this._collectionModalOpen.set(false);
  }

  saveCollection(updated: CollectionHighlightConfig): void {
    if (updated.id) {
      this.quickAccessService.updateCollection(updated.id, updated);
      this._success.set('Colección destacada actualizada correctamente.');
    } else {
      this.quickAccessService.addCollection(updated);
      this._success.set('Nueva colección destacada agregada a la lista.');
    }
    this._error.set(null);
    this.closeCollectionModal();
  }

  toggleCollectionVisibility(col: CollectionHighlightConfig): void {
    this.quickAccessService.toggleCollectionVisibility(col.id);
    const nowVisible = col.visible === false;
    this._success.set(
      nowVisible
        ? 'Colección activada: ahora se muestra en la landing.'
        : 'Colección desactivada: ocultada de la landing.',
    );
  }

  deleteCollection(id: string): void {
    this.quickAccessService.deleteCollection(id);
    this._success.set('Colección eliminada de la lista.');
  }

  resetCollectionsToDefaults(): void {
    this.quickAccessService.resetCollectionsToDefaults();
    this._success.set('Colecciones destacadas restablecidas a sus valores por defecto.');
    this._error.set(null);
  }

  clearFeedback(): void {
    this._error.set(null);
    this._success.set(null);
  }
}
