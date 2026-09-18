import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { BusinessUnitResponse } from '../../../data/models/business-unit/business-unit-response.model';
import { CategoryCreateRequest } from '../../../data/models/category/category-create-request.model';
import { CategoryResponse } from '../../../data/models/category/category-response.model';
import { CategoryUpdateRequest } from '../../../data/models/category/category-update-request.model';
import { BusinessUnitApiService } from '../../../data/services/business-unit-api.service';
import { CategoryApiService } from '../../../data/services/category-api.service';

export type CategoryFormMode = 'create' | 'edit';

@Injectable()
export class AdminCategoriesFacade {
  private readonly categoryApi = inject(CategoryApiService);
  private readonly businessUnitApi = inject(BusinessUnitApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _categories = signal<readonly CategoryResponse[]>([]);
  private readonly _businessUnits = signal<readonly BusinessUnitResponse[]>([]);
  private readonly _loading = signal(true);
  private readonly _loadingFormData = signal(true);
  private readonly _submitting = signal(false);
  private readonly _changingActiveId = signal<string | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _success = signal<string | null>(null);
  private readonly _selectedCategory = signal<CategoryResponse | null>(null);
  private readonly _formMode = signal<CategoryFormMode>('create');
  private readonly _formOpen = signal(false);

  readonly categories = this._categories.asReadonly();
  readonly businessUnits = this._businessUnits.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly loadingFormData = this._loadingFormData.asReadonly();
  readonly submitting = this._submitting.asReadonly();
  readonly changingActiveId = this._changingActiveId.asReadonly();
  readonly error = this._error.asReadonly();
  readonly success = this._success.asReadonly();
  readonly selectedCategory = this._selectedCategory.asReadonly();
  readonly formMode = this._formMode.asReadonly();
  readonly formOpen = this._formOpen.asReadonly();

  load(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.loadCategories();
    this.loadBusinessUnits();
  }

  openCreate(): void {
    this._selectedCategory.set(null);
    this._formMode.set('create');
    this._error.set(null);
    this._success.set(null);
    this._formOpen.set(true);
  }

  openEdit(category: CategoryResponse): void {
    this._selectedCategory.set(category);
    this._formMode.set('edit');
    this._error.set(null);
    this._success.set(null);
    this._formOpen.set(true);
  }

  closeForm(): void {
    if (this._submitting()) return;
    this._formOpen.set(false);
    this._selectedCategory.set(null);
    this._error.set(null);
  }

  create(request: CategoryCreateRequest): void {
    if (this._submitting()) return;
    this._submitting.set(true);
    this._error.set(null);
    this._success.set(null);

    this.categoryApi
      .create(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._submitting.set(false)),
      )
      .subscribe({
        next: (category) => {
          this.upsertCategory(category);
          this._success.set('Categoría creada correctamente.');
          this._formOpen.set(false);
          this._selectedCategory.set(null);
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  update(request: CategoryUpdateRequest): void {
    const selectedCategory = this._selectedCategory();
    if (this._submitting() || selectedCategory === null) return;
    this._submitting.set(true);
    this._error.set(null);
    this._success.set(null);

    this.categoryApi
      .update(selectedCategory.id, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._submitting.set(false)),
      )
      .subscribe({
        next: (category) => {
          this.upsertCategory(category);
          this._success.set('Categoría actualizada correctamente.');
          this._formOpen.set(false);
          this._selectedCategory.set(null);
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  changeActive(category: CategoryResponse, active: boolean): void {
    if (this._changingActiveId() !== null || this._submitting()) return;
    this._changingActiveId.set(category.id);
    this._error.set(null);
    this._success.set(null);

    this.categoryApi
      .changeActive(category.id, { activo: active })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._changingActiveId.set(null)),
      )
      .subscribe({
        next: (updatedCategory) => {
          this.upsertCategory(updatedCategory);
          this._success.set(
            active ? 'Categoría activada correctamente.' : 'Categoría desactivada correctamente.',
          );
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  clearFeedback(): void {
    this._error.set(null);
    this._success.set(null);
  }

  private loadCategories(): void {
    this._loading.set(true);
    this._error.set(null);
    this.categoryApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (categories) => this._categories.set(this.sortCategories(categories)),
        error: () =>
          this._error.set(
            'No pudimos cargar las categorías. Comprueba tu conexión e inténtalo nuevamente.',
          ),
      });
  }

  private loadBusinessUnits(): void {
    this._loadingFormData.set(true);
    this.businessUnitApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loadingFormData.set(false)),
      )
      .subscribe({
        next: (businessUnits) => this._businessUnits.set(businessUnits),
        error: () =>
          this._error.set(
            'Las categorías se cargaron, pero no pudimos obtener las unidades de negocio.',
          ),
      });
  }

  private upsertCategory(category: CategoryResponse): void {
    const categories = this._categories();
    const existingIndex = categories.findIndex((item) => item.id === category.id);
    const nextCategories =
      existingIndex === -1
        ? [...categories, category]
        : categories.map((item) => (item.id === category.id ? category : item));
    this._categories.set(this.sortCategories(nextCategories));
  }

  private sortCategories(categories: readonly CategoryResponse[]): CategoryResponse[] {
    return [...categories].sort(
      (first, second) =>
        (first.orden ?? Number.MAX_SAFE_INTEGER) - (second.orden ?? Number.MAX_SAFE_INTEGER) ||
        first.nombre.localeCompare(second.nombre),
    );
  }

  private mutationErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) return 'Revisa los datos ingresados e inténtalo nuevamente.';
      if (error.status === 404) return 'La categoría o unidad de negocio ya no existe.';
      if (error.status === 409) return 'Ya existe una categoría con ese slug.';
    }

    return 'No pudimos guardar el cambio. Comprueba tu conexión e inténtalo nuevamente.';
  }
}
