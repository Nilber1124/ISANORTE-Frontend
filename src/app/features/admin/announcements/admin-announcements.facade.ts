import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import {
  AnnouncementRequest,
  AnnouncementResponse,
} from '../../../data/models/announcement/announcement.model';
import { AnnouncementApiService } from '../../../data/services/announcement-api.service';
import { ProductResponse } from '../../../data/models/product/product-response.model';
import { ProductApiService } from '../../../data/services/product-api.service';
import { CategoryResponse } from '../../../data/models/category/category-response.model';
import { CategoryApiService } from '../../../data/services/category-api.service';
import { ToastService } from '../../../core/services/toast.service';

export type AnnouncementFormMode = 'create' | 'edit';

@Injectable()
export class AdminAnnouncementsFacade {
  private readonly api = inject(AnnouncementApiService);
  private readonly productApi = inject(ProductApiService);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _announcements = signal<readonly AnnouncementResponse[]>([]);
  private readonly _loading = signal(true);
  private readonly _submitting = signal(false);
  private readonly _changingActiveId = signal<string | null>(null);
  private readonly _deletingId = signal<string | null>(null);
  private readonly _selected = signal<AnnouncementResponse | null>(null);
  private readonly _formMode = signal<AnnouncementFormMode>('create');
  private readonly _formOpen = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _products = signal<readonly ProductResponse[]>([]);
  private readonly _productsLoading = signal(true);
  private readonly _changingFeaturedId = signal<string | null>(null);
  private readonly _categories = signal<readonly CategoryResponse[]>([]);

  readonly announcements = this._announcements.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly submitting = this._submitting.asReadonly();
  readonly changingActiveId = this._changingActiveId.asReadonly();
  readonly deletingId = this._deletingId.asReadonly();
  readonly selected = this._selected.asReadonly();
  readonly formMode = this._formMode.asReadonly();
  readonly formOpen = this._formOpen.asReadonly();
  readonly error = this._error.asReadonly();
  readonly products = this._products.asReadonly();
  readonly productsLoading = this._productsLoading.asReadonly();
  readonly changingFeaturedId = this._changingFeaturedId.asReadonly();
  readonly categories = this._categories.asReadonly();

  load(): void {
    this._loading.set(true);
    this._error.set(null);
    this.api
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (items) => this._announcements.set(this.sort(items)),
        error: () => this._error.set('No pudimos cargar los anuncios.'),
      });
    this.loadProducts();
    this.categoryApi.getAll().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (categories) => this._categories.set(categories),
      error: () => this._error.set('No pudimos cargar las categorías del catálogo.'),
    });
  }

  updateFeatured(product: ProductResponse, destacado: boolean, ordenDestacado: number): void {
    if (this._changingFeaturedId() !== null) return;
    this._changingFeaturedId.set(product.id);
    this.productApi
      .changeFeatured(product.id, { destacado, ordenDestacado: Math.max(0, ordenDestacado) })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._changingFeaturedId.set(null)),
      )
      .subscribe({
        next: (updated) => {
          this._products.update((items) =>
            items.map((item) => (item.id === updated.id ? updated : item)),
          );
          this.toast.show(
            updated.destacado ? 'Producto agregado a destacados.' : 'Producto retirado de destacados.',
            'success',
          );
        },
        error: () => this._error.set('No pudimos actualizar el producto destacado.'),
      });
  }

  openCreate(): void {
    this._selected.set(null);
    this._formMode.set('create');
    this._formOpen.set(true);
    this._error.set(null);
  }

  openEdit(announcement: AnnouncementResponse): void {
    this._selected.set(announcement);
    this._formMode.set('edit');
    this._formOpen.set(true);
    this._error.set(null);
  }

  closeForm(): void {
    if (this._submitting()) return;
    this._formOpen.set(false);
    this._selected.set(null);
    this._error.set(null);
  }

  save(request: AnnouncementRequest): void {
    if (this._submitting()) return;
    const selected = this._selected();
    const operation = selected ? this.api.update(selected.id, request) : this.api.create(request);
    this._submitting.set(true);
    this._error.set(null);
    operation
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._submitting.set(false)),
      )
      .subscribe({
        next: (announcement) => {
          this.upsert(announcement);
          this._formOpen.set(false);
          this._selected.set(null);
          this.toast.show(
            selected ? 'Anuncio actualizado correctamente.' : 'Anuncio creado correctamente.',
            'success',
          );
        },
        error: (error: unknown) => this._error.set(this.errorMessage(error)),
      });
  }

  changeActive(announcement: AnnouncementResponse): void {
    if (this._changingActiveId() !== null) return;
    this._changingActiveId.set(announcement.id);
    this.api
      .changeActive(announcement.id, { activo: !announcement.activo })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._changingActiveId.set(null)),
      )
      .subscribe({
        next: (updated) => {
          this.upsert(updated);
          this.toast.show(updated.activo ? 'Anuncio activado.' : 'Anuncio desactivado.', 'success');
        },
        error: () => this._error.set('No pudimos cambiar el estado del anuncio.'),
      });
  }

  delete(announcement: AnnouncementResponse): void {
    if (this._deletingId() !== null) return;
    this._deletingId.set(announcement.id);
    this.api
      .delete(announcement.id)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._deletingId.set(null)),
      )
      .subscribe({
        next: () => {
          this._announcements.update((items) =>
            items.filter((item) => item.id !== announcement.id),
          );
          this.toast.show('Anuncio eliminado correctamente.', 'success');
        },
        error: () => this._error.set('No pudimos eliminar el anuncio.'),
      });
  }

  clearError(): void {
    this._error.set(null);
  }

  private upsert(announcement: AnnouncementResponse): void {
    const exists = this._announcements().some((item) => item.id === announcement.id);
    const items = exists
      ? this._announcements().map((item) => (item.id === announcement.id ? announcement : item))
      : [...this._announcements(), announcement];
    this._announcements.set(this.sort(items));
  }

  private sort(items: readonly AnnouncementResponse[]): AnnouncementResponse[] {
    return [...items].sort((a, b) => a.orden - b.orden || a.titulo.localeCompare(b.titulo));
  }

  private errorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400)
        return error.error?.message ?? 'Revisa los datos y la vigencia ingresada.';
      if (error.status === 404) return 'El anuncio ya no existe.';
    }
    return 'No pudimos guardar el anuncio. Comprueba tu conexión.';
  }

  private loadProducts(): void {
    this._productsLoading.set(true);
    this.productApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._productsLoading.set(false)),
      )
      .subscribe({
        next: (products) => this._products.set(products),
        error: () => this._error.set('No pudimos cargar el catálogo para seleccionar destacados.'),
      });
  }
}
