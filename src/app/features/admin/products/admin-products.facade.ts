import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { BusinessUnitResponse } from '../../../data/models/business-unit/business-unit-response.model';
import { CategoryResponse } from '../../../data/models/category/category-response.model';
import { ProductCreateRequest } from '../../../data/models/product/product-create-request.model';
import { ProductPublicationStatus } from '../../../data/models/product/product-publication-status.enum';
import { ProductResponse } from '../../../data/models/product/product-response.model';
import { ProductUpdateRequest } from '../../../data/models/product/product-update-request.model';
import { BusinessUnitApiService } from '../../../data/services/business-unit-api.service';
import { CategoryApiService } from '../../../data/services/category-api.service';
import { ProductApiService } from '../../../data/services/product-api.service';

export type ProductFormMode = 'create' | 'edit';

@Injectable()
export class AdminProductsFacade {
  private readonly productApi = inject(ProductApiService);
  private readonly categoryApi = inject(CategoryApiService);
  private readonly businessUnitApi = inject(BusinessUnitApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly _products = signal<readonly ProductResponse[]>([]);
  private readonly _categories = signal<readonly CategoryResponse[]>([]);
  private readonly _businessUnits = signal<readonly BusinessUnitResponse[]>([]);
  private readonly _loading = signal(true);
  private readonly _loadingFormData = signal(true);
  private readonly _submitting = signal(false);
  private readonly _changingStatusId = signal<string | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _success = signal<string | null>(null);
  private readonly _selectedProduct = signal<ProductResponse | null>(null);
  private readonly _formMode = signal<ProductFormMode>('create');
  private readonly _formOpen = signal(false);

  readonly products = this._products.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly businessUnits = this._businessUnits.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly loadingFormData = this._loadingFormData.asReadonly();
  readonly submitting = this._submitting.asReadonly();
  readonly changingStatusId = this._changingStatusId.asReadonly();
  readonly error = this._error.asReadonly();
  readonly success = this._success.asReadonly();
  readonly selectedProduct = this._selectedProduct.asReadonly();
  readonly formMode = this._formMode.asReadonly();
  readonly formOpen = this._formOpen.asReadonly();

  load(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.loadProducts();
    this.loadFormData();
  }

  openCreate(): void {
    this._selectedProduct.set(null);
    this._formMode.set('create');
    this._error.set(null);
    this._success.set(null);
    this._formOpen.set(true);
  }

  openEdit(product: ProductResponse): void {
    this._selectedProduct.set(product);
    this._formMode.set('edit');
    this._error.set(null);
    this._success.set(null);
    this._formOpen.set(true);
  }

  closeForm(): void {
    if (this._submitting()) return;
    this._formOpen.set(false);
    this._selectedProduct.set(null);
    this._error.set(null);
  }

  create(request: ProductCreateRequest): void {
    if (this._submitting()) return;
    this._submitting.set(true);
    this._error.set(null);
    this._success.set(null);

    this.productApi
      .create(request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._submitting.set(false)),
      )
      .subscribe({
        next: (product) => {
          this.upsertProduct(product);
          this._success.set('Producto creado correctamente.');
          this._formOpen.set(false);
          this._selectedProduct.set(null);
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  update(request: ProductUpdateRequest): void {
    const selectedProduct = this._selectedProduct();
    if (this._submitting() || selectedProduct === null) return;
    this._submitting.set(true);
    this._error.set(null);
    this._success.set(null);

    this.productApi
      .update(selectedProduct.id, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._submitting.set(false)),
      )
      .subscribe({
        next: (product) => {
          this.upsertProduct(product);
          this._success.set('Producto actualizado correctamente.');
          this._formOpen.set(false);
          this._selectedProduct.set(null);
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  changeStatus(product: ProductResponse, status: ProductPublicationStatus): void {
    if (this._changingStatusId() !== null || this._submitting()) return;
    this._changingStatusId.set(product.id);
    this._error.set(null);
    this._success.set(null);

    this.productApi
      .changeStatus(product.id, { estado: status })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._changingStatusId.set(null)),
      )
      .subscribe({
        next: (updatedProduct) => {
          this.upsertProduct(updatedProduct);
          this._success.set('Estado de publicación actualizado correctamente.');
        },
        error: (error: unknown) => this._error.set(this.mutationErrorMessage(error)),
      });
  }

  clearFeedback(): void {
    this._error.set(null);
    this._success.set(null);
  }

  private loadProducts(): void {
    this._loading.set(true);
    this._error.set(null);
    this.productApi
      .getAll()
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._loading.set(false)),
      )
      .subscribe({
        next: (products) => this._products.set(this.sortProducts(products)),
        error: () =>
          this._error.set(
            'No pudimos cargar los productos. Comprueba tu conexión e inténtalo nuevamente.',
          ),
      });
  }

  private loadFormData(): void {
    this._loadingFormData.set(true);
    let pendingRequests = 2;
    const finishRequest = (): void => {
      pendingRequests -= 1;
      if (pendingRequests === 0) this._loadingFormData.set(false);
    };

    this.categoryApi
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(finishRequest))
      .subscribe({
        next: (categories) => this._categories.set(categories),
        error: () =>
          this._error.set('Los productos se cargaron, pero no pudimos obtener las categorías.'),
      });

    this.businessUnitApi
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef), finalize(finishRequest))
      .subscribe({
        next: (businessUnits) => this._businessUnits.set(businessUnits),
        error: () =>
          this._error.set(
            'Los productos se cargaron, pero no pudimos obtener las unidades de negocio.',
          ),
      });
  }

  private upsertProduct(product: ProductResponse): void {
    const products = this._products();
    const exists = products.some((item) => item.id === product.id);
    const nextProducts = exists
      ? products.map((item) => (item.id === product.id ? product : item))
      : [...products, product];
    this._products.set(this.sortProducts(nextProducts));
  }

  private sortProducts(products: readonly ProductResponse[]): ProductResponse[] {
    return [...products].sort((first, second) => first.nombre.localeCompare(second.nombre));
  }

  private mutationErrorMessage(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) return 'Revisa los datos ingresados e inténtalo nuevamente.';
      if (error.status === 404) return 'El producto, la unidad o alguna categoría ya no existe.';
      if (error.status === 409) return 'Ya existe un producto con ese SKU o slug.';
    }

    return 'No pudimos guardar el cambio. Comprueba tu conexión e inténtalo nuevamente.';
  }
}
