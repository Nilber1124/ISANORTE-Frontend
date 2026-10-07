import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { ToastService } from '../../../core/services/toast.service';

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
  private readonly toastService = inject(ToastService);

  readonly items = this.quickAccessService.items;
  readonly visibleItems = this.quickAccessService.visibleItems;
  readonly collections = this.quickAccessService.collections;

  private readonly _categories = signal<readonly CategoryResponse[]>([]);
  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _editingItem = signal<HomeQuickAccessItem | null>(null);
  private readonly _modalOpen = signal(false);

  private readonly _editingCollection = signal<CollectionHighlightConfig | null>(null);
  private readonly _collectionModalOpen = signal(false);

  readonly categories = this._categories.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
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
      this.toastService.show(`Tarjeta "${updated.title}" actualizada correctamente.`, 'success');
    } else {
      this.quickAccessService.addItem(updated);
      this.toastService.show(`Nueva tarjeta "${updated.title}" agregada al Hero.`, 'success');
    }
    this._error.set(null);
    this.closeModal();
  }

  toggleItemVisibility(item: HomeQuickAccessItem): void {
    this.quickAccessService.toggleItemVisibility(item.id);
    const nowVisible = item.visible === false;
    this.toastService.show(
      nowVisible
        ? `Tarjeta "${item.title}" activada: ahora se muestra en el Hero.`
        : `Tarjeta "${item.title}" desactivada: ocultada del Hero.`,
      'success',
    );
  }

  deleteItem(id: string): void {
    this.quickAccessService.deleteItem(id);
    this.toastService.show('Tarjeta eliminada del listado.', 'success');
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
    this.toastService.show('Orden de tarjetas actualizado.', 'success');
  }

  resetToDefaults(): void {
    this.quickAccessService.resetToDefaults();
    this.toastService.show('Tarjetas restablecidas a sus valores por defecto.', 'success');
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
      this.toastService.show('Colección destacada actualizada correctamente.', 'success');
    } else {
      this.quickAccessService.addCollection(updated);
      this.toastService.show('Nueva colección destacada agregada a la lista.', 'success');
    }
    this._error.set(null);
    this.closeCollectionModal();
  }

  toggleCollectionVisibility(col: CollectionHighlightConfig): void {
    this.quickAccessService.toggleCollectionVisibility(col.id);
    const nowVisible = col.visible === false;
    this.toastService.show(
      nowVisible
        ? 'Colección activada: ahora se muestra en la landing.'
        : 'Colección desactivada: ocultada de la landing.',
      'success',
    );
  }

  deleteCollection(id: string): void {
    this.quickAccessService.deleteCollection(id);
    this.toastService.show('Colección eliminada de la lista.', 'success');
  }

  resetCollectionsToDefaults(): void {
    this.quickAccessService.resetCollectionsToDefaults();
    this.toastService.show(
      'Colecciones destacadas restablecidas a sus valores por defecto.',
      'success',
    );
    this._error.set(null);
  }

  clearFeedback(): void {
    this._error.set(null);
  }
}
