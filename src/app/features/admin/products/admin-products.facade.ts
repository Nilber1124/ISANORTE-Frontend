import { isPlatformBrowser } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { DestroyRef, Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { concatMap, finalize } from 'rxjs';

import { BusinessUnitResponse } from '../../../data/models/business-unit/business-unit-response.model';
import { CategoryResponse } from '../../../data/models/category/category-response.model';
import {
  CalculationConfigCreateRequest,
  ProductCreateRequest,
  ProductDocumentCreateRequest,
  ProductImageCreateRequest,
  ProductSpecificationCreateRequest,
  ProductVariantCreateRequest,
} from '../../../data/models/product/product-create-request.model';
import { ProductPublicationStatus } from '../../../data/models/product/product-publication-status.enum';
import {
  CalculationConfigResponse,
  ProductDocumentResponse,
  ProductImageResponse,
  ProductResponse,
  ProductSpecificationResponse,
  ProductVariantResponse,
} from '../../../data/models/product/product-response.model';
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
  private readonly _imageOperating = signal(false);
  private readonly _variantOperating = signal(false);
  private readonly _specificationOperating = signal(false);
  private readonly _documentOperating = signal(false);
  private readonly _calculationConfigOperating = signal(false);
  private readonly _changingStatusId = signal<string | null>(null);
  private readonly _error = signal<string | null>(null);
  private readonly _success = signal<string | null>(null);
  private readonly _imageError = signal<string | null>(null);
  private readonly _imageSuccess = signal<string | null>(null);
  private readonly _variantError = signal<string | null>(null);
  private readonly _variantSuccess = signal<string | null>(null);
  private readonly _specificationError = signal<string | null>(null);
  private readonly _specificationSuccess = signal<string | null>(null);
  private readonly _documentError = signal<string | null>(null);
  private readonly _documentSuccess = signal<string | null>(null);
  private readonly _calculationConfigError = signal<string | null>(null);
  private readonly _calculationConfigSuccess = signal<string | null>(null);
  private readonly _selectedProduct = signal<ProductResponse | null>(null);
  private readonly _formMode = signal<ProductFormMode>('create');
  private readonly _formOpen = signal(false);

  readonly products = this._products.asReadonly();
  readonly categories = this._categories.asReadonly();
  readonly businessUnits = this._businessUnits.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly loadingFormData = this._loadingFormData.asReadonly();
  readonly submitting = this._submitting.asReadonly();
  readonly imageOperating = this._imageOperating.asReadonly();
  readonly variantOperating = this._variantOperating.asReadonly();
  readonly specificationOperating = this._specificationOperating.asReadonly();
  readonly documentOperating = this._documentOperating.asReadonly();
  readonly calculationConfigOperating = this._calculationConfigOperating.asReadonly();
  readonly changingStatusId = this._changingStatusId.asReadonly();
  readonly error = this._error.asReadonly();
  readonly success = this._success.asReadonly();
  readonly imageError = this._imageError.asReadonly();
  readonly imageSuccess = this._imageSuccess.asReadonly();
  readonly variantError = this._variantError.asReadonly();
  readonly variantSuccess = this._variantSuccess.asReadonly();
  readonly specificationError = this._specificationError.asReadonly();
  readonly specificationSuccess = this._specificationSuccess.asReadonly();
  readonly documentError = this._documentError.asReadonly();
  readonly documentSuccess = this._documentSuccess.asReadonly();
  readonly calculationConfigError = this._calculationConfigError.asReadonly();
  readonly calculationConfigSuccess = this._calculationConfigSuccess.asReadonly();
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
    this._imageError.set(null);
    this._imageSuccess.set(null);
    this._variantError.set(null);
    this._variantSuccess.set(null);
    this._specificationError.set(null);
    this._specificationSuccess.set(null);
    this._documentError.set(null);
    this._documentSuccess.set(null);
    this._calculationConfigError.set(null);
    this._calculationConfigSuccess.set(null);
    this._formOpen.set(true);
  }

  openEdit(product: ProductResponse): void {
    this._selectedProduct.set(product);
    this._formMode.set('edit');
    this._error.set(null);
    this._success.set(null);
    this._imageError.set(null);
    this._imageSuccess.set(null);
    this._variantError.set(null);
    this._variantSuccess.set(null);
    this._specificationError.set(null);
    this._specificationSuccess.set(null);
    this._documentError.set(null);
    this._documentSuccess.set(null);
    this._calculationConfigError.set(null);
    this._calculationConfigSuccess.set(null);
    this._formOpen.set(true);
  }

  closeForm(): void {
    if (
      this._submitting() ||
      this._imageOperating() ||
      this._variantOperating() ||
      this._specificationOperating() ||
      this._documentOperating() ||
      this._calculationConfigOperating()
    ) {
      return;
    }
    this._formOpen.set(false);
    this._selectedProduct.set(null);
    this._error.set(null);
    this._imageError.set(null);
    this._imageSuccess.set(null);
    this._variantError.set(null);
    this._variantSuccess.set(null);
    this._specificationError.set(null);
    this._specificationSuccess.set(null);
    this._documentError.set(null);
    this._documentSuccess.set(null);
    this._calculationConfigError.set(null);
    this._calculationConfigSuccess.set(null);
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

  clearImageFeedback(): void {
    this._imageError.set(null);
    this._imageSuccess.set(null);
  }

  addImage(productId: string, request: ProductImageCreateRequest): void {
    if (this._imageOperating() || this._submitting()) return;
    this._imageOperating.set(true);
    this._imageError.set(null);
    this._imageSuccess.set(null);

    const payload: ProductImageCreateRequest = {
      url: request.url.trim().slice(0, 500),
      altText: request.altText?.trim().slice(0, 200) || null,
      esPrincipal: Boolean(request.esPrincipal),
      orden: Number(request.orden ?? 0),
    };

    this.productApi
      .createImage(productId, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._imageOperating.set(false)),
      )
      .subscribe({
        next: (created) => {
          this.appendImageToSelectedProduct(created);
          this._imageSuccess.set('Imagen agregada correctamente.');
        },
        error: () => {
          this._imageError.set('No pudimos asociar la imagen al producto.');
          this.refreshSelectedProduct(productId);
        },
      });
  }

  deleteImage(productId: string, imageId: string): void {
    if (this._imageOperating() || this._submitting()) return;
    this._imageOperating.set(true);
    this._imageError.set(null);
    this._imageSuccess.set(null);

    const current = this._selectedProduct();
    const deletedImage = current?.imagenes?.find((img) => img.id === imageId);
    const remaining = (current?.imagenes ?? []).filter((img) => img.id !== imageId);
    const wasPrincipal = deletedImage?.esPrincipal === true;

    this.productApi
      .deleteImage(productId, imageId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._imageOperating.set(false)),
      )
      .subscribe({
        next: () => {
          this.removeImageFromSelectedProduct(imageId);
          this._imageSuccess.set('Imagen eliminada.');

          if (wasPrincipal && remaining.length > 0) {
            const nextPrincipal = remaining[0];
            this.setPrincipalImage(productId, nextPrincipal.id);
          }
        },
        error: () => {
          this._imageError.set('No se pudo eliminar la imagen.');
          this.refreshSelectedProduct(productId);
        },
      });
  }

  setPrincipalImage(productId: string, targetImageId: string): void {
    if (this._imageOperating() || this._submitting()) return;

    const currentImages = this._selectedProduct()?.imagenes ?? [];
    const target = currentImages.find((img) => img.id === targetImageId);
    if (!target || target.esPrincipal) return;

    this._imageOperating.set(true);
    this._imageError.set(null);
    this._imageSuccess.set(null);

    const oldPrincipal = currentImages.find(
      (img) => img.esPrincipal === true && img.id !== targetImageId,
    );

    const targetPayload: ProductImageCreateRequest = {
      url: target.url,
      altText: target.altText,
      esPrincipal: true,
      orden: target.orden ?? 0,
    };

    const updateTarget$ = this.productApi.updateImage(productId, target.id, targetPayload);

    const pipeline$ = oldPrincipal
      ? updateTarget$.pipe(
          concatMap(() => {
            const oldPayload: ProductImageCreateRequest = {
              url: oldPrincipal.url,
              altText: oldPrincipal.altText,
              esPrincipal: false,
              orden: oldPrincipal.orden ?? 0,
            };
            return this.productApi.updateImage(productId, oldPrincipal.id, oldPayload);
          }),
        )
      : updateTarget$;

    pipeline$
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._imageOperating.set(false)),
      )
      .subscribe({
        next: () => {
          this.updateImagePrincipalInSelectedProduct(targetImageId);
          this._imageSuccess.set('Imagen principal actualizada.');
        },
        error: () => {
          this._imageError.set('No se pudo actualizar la imagen principal.');
          this.refreshSelectedProduct(productId);
        },
      });
  }

  reorderImages(productId: string, sourceIndex: number, targetIndex: number): void {
    if (this._imageOperating() || this._submitting()) return;

    const current = [...(this._selectedProduct()?.imagenes ?? [])].sort(
      (a, b) => (a.orden ?? 0) - (b.orden ?? 0),
    );
    const itemA = current[sourceIndex];
    const itemB = current[targetIndex];

    if (!itemA || !itemB) return;

    this._imageOperating.set(true);
    this._imageError.set(null);
    this._imageSuccess.set(null);

    const payloadA: ProductImageCreateRequest = {
      url: itemA.url,
      altText: itemA.altText,
      esPrincipal: itemA.esPrincipal ?? false,
      orden: targetIndex,
    };

    const payloadB: ProductImageCreateRequest = {
      url: itemB.url,
      altText: itemB.altText,
      esPrincipal: itemB.esPrincipal ?? false,
      orden: sourceIndex,
    };

    this.productApi
      .updateImage(productId, itemA.id, payloadA)
      .pipe(
        concatMap(() => this.productApi.updateImage(productId, itemB.id, payloadB)),
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._imageOperating.set(false)),
      )
      .subscribe({
        next: () => {
          this.swapImagesInSelectedProduct(sourceIndex, targetIndex);
          this._imageSuccess.set('Orden actualizado.');
        },
        error: () => {
          this._imageError.set('No pudimos actualizar el orden de las imágenes.');
          this.refreshSelectedProduct(productId);
        },
      });
  }

  updateImageAlt(productId: string, imageId: string, altText: string): void {
    if (this._imageOperating() || this._submitting()) return;

    const current = this._selectedProduct()?.imagenes ?? [];
    const target = current.find((img) => img.id === imageId);
    if (!target) return;

    const trimmedAlt = altText.trim().slice(0, 200) || null;
    if (target.altText === trimmedAlt) return;

    this._imageOperating.set(true);
    this._imageError.set(null);
    this._imageSuccess.set(null);

    const payload: ProductImageCreateRequest = {
      url: target.url,
      altText: trimmedAlt,
      esPrincipal: target.esPrincipal ?? false,
      orden: target.orden ?? 0,
    };

    this.productApi
      .updateImage(productId, imageId, payload)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._imageOperating.set(false)),
      )
      .subscribe({
        next: (updated) => {
          this.updateImageInSelectedProduct(updated);
          this._imageSuccess.set('Texto alternativo guardado.');
        },
        error: () => {
          this._imageError.set('No pudimos guardar el texto alternativo.');
          this.refreshSelectedProduct(productId);
        },
      });
  }

  clearVariantFeedback(): void {
    this._variantError.set(null);
    this._variantSuccess.set(null);
  }

  addVariant(productId: string, request: ProductVariantCreateRequest): void {
    if (this._variantOperating() || this._submitting()) return;
    this._variantOperating.set(true);
    this._variantError.set(null);
    this._variantSuccess.set(null);

    this.productApi
      .createVariant(productId, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._variantOperating.set(false)),
      )
      .subscribe({
        next: (created) => {
          this.appendVariantToSelectedProduct(created);
          this._variantSuccess.set('Variante agregada correctamente.');
        },
        error: (error: unknown) => {
          this._variantError.set(
            this.variantErrorMessage(error, 'No pudimos agregar la variante.'),
          );
          this.refreshSelectedProduct(productId);
        },
      });
  }

  updateVariant(
    productId: string,
    variantId: string,
    request: ProductVariantCreateRequest,
  ): void {
    if (this._variantOperating() || this._submitting()) return;
    this._variantOperating.set(true);
    this._variantError.set(null);
    this._variantSuccess.set(null);

    this.productApi
      .updateVariant(productId, variantId, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._variantOperating.set(false)),
      )
      .subscribe({
        next: (updated) => {
          this.updateVariantInSelectedProduct(updated);
          this._variantSuccess.set('Variante actualizada correctamente.');
        },
        error: (error: unknown) => {
          this._variantError.set(
            this.variantErrorMessage(error, 'No pudimos actualizar la variante.'),
          );
          this.refreshSelectedProduct(productId);
        },
      });
  }

  deleteVariant(productId: string, variantId: string): void {
    if (this._variantOperating() || this._submitting()) return;
    this._variantOperating.set(true);
    this._variantError.set(null);
    this._variantSuccess.set(null);

    this.productApi
      .deleteVariant(productId, variantId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._variantOperating.set(false)),
      )
      .subscribe({
        next: () => {
          this.removeVariantFromSelectedProduct(variantId);
          this._variantSuccess.set('Variante eliminada.');
        },
        error: () => {
          this._variantError.set('No se pudo eliminar la variante.');
          this.refreshSelectedProduct(productId);
        },
      });
  }

  clearSpecificationFeedback(): void {
    this._specificationError.set(null);
    this._specificationSuccess.set(null);
  }

  addSpecification(
    productId: string,
    request: ProductSpecificationCreateRequest,
  ): void {
    if (this._specificationOperating() || this._submitting()) return;
    this._specificationOperating.set(true);
    this._specificationError.set(null);
    this._specificationSuccess.set(null);

    this.productApi
      .createSpecification(productId, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._specificationOperating.set(false)),
      )
      .subscribe({
        next: (created) => {
          this.appendSpecificationToSelectedProduct(created);
          this._specificationSuccess.set('Especificación agregada correctamente.');
        },
        error: (error: unknown) => {
          this._specificationError.set(
            this.specificationErrorMessage(error, 'No pudimos agregar la especificación.'),
          );
          this.refreshSelectedProduct(productId);
        },
      });
  }

  updateSpecification(
    productId: string,
    specificationId: string,
    request: ProductSpecificationCreateRequest,
  ): void {
    if (this._specificationOperating() || this._submitting()) return;
    this._specificationOperating.set(true);
    this._specificationError.set(null);
    this._specificationSuccess.set(null);

    this.productApi
      .updateSpecification(productId, specificationId, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._specificationOperating.set(false)),
      )
      .subscribe({
        next: (updated) => {
          this.updateSpecificationInSelectedProduct(updated);
          this._specificationSuccess.set('Especificación actualizada correctamente.');
        },
        error: (error: unknown) => {
          this._specificationError.set(
            this.specificationErrorMessage(error, 'No pudimos actualizar la especificación.'),
          );
          this.refreshSelectedProduct(productId);
        },
      });
  }

  deleteSpecification(productId: string, specificationId: string): void {
    if (this._specificationOperating() || this._submitting()) return;
    this._specificationOperating.set(true);
    this._specificationError.set(null);
    this._specificationSuccess.set(null);

    this.productApi
      .deleteSpecification(productId, specificationId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._specificationOperating.set(false)),
      )
      .subscribe({
        next: () => {
          this.removeSpecificationFromSelectedProduct(specificationId);
          this._specificationSuccess.set('Especificación eliminada.');
        },
        error: () => {
          this._specificationError.set('No se pudo eliminar la especificación.');
          this.refreshSelectedProduct(productId);
        },
      });
  }

  clearDocumentFeedback(): void {
    this._documentError.set(null);
    this._documentSuccess.set(null);
  }

  addDocument(
    productId: string,
    request: ProductDocumentCreateRequest,
  ): void {
    if (this._documentOperating() || this._submitting()) return;
    this._documentOperating.set(true);
    this._documentError.set(null);
    this._documentSuccess.set(null);

    this.productApi
      .createDocument(productId, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._documentOperating.set(false)),
      )
      .subscribe({
        next: (created) => {
          this.appendDocumentToSelectedProduct(created);
          this._documentSuccess.set('Documento agregado correctamente.');
        },
        error: (error: unknown) => {
          this._documentError.set(
            this.documentErrorMessage(error, 'No pudimos agregar el documento.'),
          );
          this.refreshSelectedProduct(productId);
        },
      });
  }

  updateDocument(
    productId: string,
    documentId: string,
    request: ProductDocumentCreateRequest,
  ): void {
    if (this._documentOperating() || this._submitting()) return;
    this._documentOperating.set(true);
    this._documentError.set(null);
    this._documentSuccess.set(null);

    this.productApi
      .updateDocument(productId, documentId, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._documentOperating.set(false)),
      )
      .subscribe({
        next: (updated) => {
          this.updateDocumentInSelectedProduct(updated);
          this._documentSuccess.set('Documento actualizado correctamente.');
        },
        error: (error: unknown) => {
          this._documentError.set(
            this.documentErrorMessage(error, 'No pudimos actualizar el documento.'),
          );
          this.refreshSelectedProduct(productId);
        },
      });
  }

  deleteDocument(productId: string, documentId: string): void {
    if (this._documentOperating() || this._submitting()) return;
    this._documentOperating.set(true);
    this._documentError.set(null);
    this._documentSuccess.set(null);

    this.productApi
      .deleteDocument(productId, documentId)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._documentOperating.set(false)),
      )
      .subscribe({
        next: () => {
          this.removeDocumentFromSelectedProduct(documentId);
          this._documentSuccess.set('Documento eliminado.');
        },
        error: () => {
          this._documentError.set('No se pudo eliminar el documento.');
          this.refreshSelectedProduct(productId);
        },
      });
  }

  clearCalculationConfigFeedback(): void {
    this._calculationConfigError.set(null);
    this._calculationConfigSuccess.set(null);
  }

  updateCalculationConfig(
    productId: string,
    request: CalculationConfigCreateRequest,
  ): void {
    if (this._calculationConfigOperating() || this._submitting()) return;
    this._calculationConfigOperating.set(true);
    this._calculationConfigError.set(null);
    this._calculationConfigSuccess.set(null);

    this.productApi
      .updateCalculationConfig(productId, request)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => this._calculationConfigOperating.set(false)),
      )
      .subscribe({
        next: (config) => {
          this.setCalculationConfigInSelectedProduct(config);
          this._calculationConfigSuccess.set(
            'Configuración de cálculo guardada correctamente.',
          );
        },
        error: (error: unknown) => {
          this._calculationConfigError.set(
            this.calculationConfigErrorMessage(
              error,
              'No pudimos guardar la configuración de cálculo.',
            ),
          );
          this.refreshSelectedProduct(productId);
        },
      });
  }

  refreshSelectedProduct(productId: string): void {
    this.productApi
      .getById(productId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (fresh) => {
          this.upsertProduct(fresh);
          this._selectedProduct.set(fresh);
        },
        error: () => {},
      });
  }

  private appendImageToSelectedProduct(image: ProductImageResponse): void {
    const current = this._selectedProduct();
    if (!current) return;
    const imagenes = [...(current.imagenes ?? []), image];
    const updated = { ...current, imagenes };
    this._selectedProduct.set(updated);
    this.upsertProduct(updated);
  }

  private removeImageFromSelectedProduct(imageId: string): void {
    const current = this._selectedProduct();
    if (!current) return;
    const imagenes = (current.imagenes ?? []).filter((img) => img.id !== imageId);
    const updated = { ...current, imagenes };
    this._selectedProduct.set(updated);
    this.upsertProduct(updated);
  }

  private updateImagePrincipalInSelectedProduct(targetId: string): void {
    const current = this._selectedProduct();
    if (!current) return;
    const imagenes = (current.imagenes ?? []).map((img) => ({
      ...img,
      esPrincipal: img.id === targetId,
    }));
    const updated = { ...current, imagenes };
    this._selectedProduct.set(updated);
    this.upsertProduct(updated);
  }

  private swapImagesInSelectedProduct(sourceIdx: number, targetIdx: number): void {
    const current = this._selectedProduct();
    if (!current) return;
    const list = [...(current.imagenes ?? [])].sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0));
    const temp = list[sourceIdx];
    list[sourceIdx] = list[targetIdx];
    list[targetIdx] = temp;
    const imagenes = list.map((img, idx) => ({ ...img, orden: idx }));
    const updated = { ...current, imagenes };
    this._selectedProduct.set(updated);
    this.upsertProduct(updated);
  }

  private updateImageInSelectedProduct(updatedImage: ProductImageResponse): void {
    const current = this._selectedProduct();
    if (!current) return;
    const imagenes = (current.imagenes ?? []).map((img) =>
      img.id === updatedImage.id ? updatedImage : img,
    );
    const updated = { ...current, imagenes };
    this._selectedProduct.set(updated);
    this.upsertProduct(updated);
  }

  private appendVariantToSelectedProduct(variant: ProductVariantResponse): void {
    const current = this._selectedProduct();
    if (!current) return;
    const variantes = [...(current.variantes ?? []), variant];
    const updated = { ...current, variantes };
    this._selectedProduct.set(updated);
    this.upsertProduct(updated);
  }

  private updateVariantInSelectedProduct(updatedVariant: ProductVariantResponse): void {
    const current = this._selectedProduct();
    if (!current) return;
    const variantes = (current.variantes ?? []).map((v) =>
      v.id === updatedVariant.id ? updatedVariant : v,
    );
    const updated = { ...current, variantes };
    this._selectedProduct.set(updated);
    this.upsertProduct(updated);
  }

  private removeVariantFromSelectedProduct(variantId: string): void {
    const current = this._selectedProduct();
    if (!current) return;
    const variantes = (current.variantes ?? []).filter((v) => v.id !== variantId);
    const updated = { ...current, variantes };
    this._selectedProduct.set(updated);
    this.upsertProduct(updated);
  }

  private variantErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 409) return 'Ya existe una variante con ese SKU.';
      if (error.status === 400) {
        if (
          typeof error.error?.message === 'string' &&
          error.error.message.toLowerCase().includes('sku')
        ) {
          return error.error.message;
        }
        return 'Revisa los datos de la variante. El SKU podría estar duplicado o tener formato inválido.';
      }
      if (error.status === 404) return 'La variante o el producto ya no existe.';
    }
    return fallback;
  }

  private appendSpecificationToSelectedProduct(
    spec: ProductSpecificationResponse,
  ): void {
    const current = this._selectedProduct();
    if (!current) return;
    const especificaciones = [...(current.especificaciones ?? []), spec];
    const updated = { ...current, especificaciones };
    this._selectedProduct.set(updated);
    this.upsertProduct(updated);
  }

  private updateSpecificationInSelectedProduct(
    updatedSpec: ProductSpecificationResponse,
  ): void {
    const current = this._selectedProduct();
    if (!current) return;
    const especificaciones = (current.especificaciones ?? []).map((s) =>
      s.id === updatedSpec.id ? updatedSpec : s,
    );
    const updated = { ...current, especificaciones };
    this._selectedProduct.set(updated);
    this.upsertProduct(updated);
  }

  private removeSpecificationFromSelectedProduct(specId: string): void {
    const current = this._selectedProduct();
    if (!current) return;
    const especificaciones = (current.especificaciones ?? []).filter(
      (s) => s.id !== specId,
    );
    const updated = { ...current, especificaciones };
    this._selectedProduct.set(updated);
    this.upsertProduct(updated);
  }

  private specificationErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        if (typeof error.error?.message === 'string') {
          return error.error.message;
        }
        return 'Revisa los datos ingresados de la especificación.';
      }
      if (error.status === 404) return 'La especificación o el producto ya no existe.';
    }
    return fallback;
  }

  private appendDocumentToSelectedProduct(
    doc: ProductDocumentResponse,
  ): void {
    const current = this._selectedProduct();
    if (!current) return;
    const documentos = [...(current.documentos ?? []), doc];
    const updated = { ...current, documentos };
    this._selectedProduct.set(updated);
    this.upsertProduct(updated);
  }

  private updateDocumentInSelectedProduct(
    updatedDoc: ProductDocumentResponse,
  ): void {
    const current = this._selectedProduct();
    if (!current) return;
    const documentos = (current.documentos ?? []).map((d) =>
      d.id === updatedDoc.id ? updatedDoc : d,
    );
    const updated = { ...current, documentos };
    this._selectedProduct.set(updated);
    this.upsertProduct(updated);
  }

  private removeDocumentFromSelectedProduct(docId: string): void {
    const current = this._selectedProduct();
    if (!current) return;
    const documentos = (current.documentos ?? []).filter(
      (d) => d.id !== docId,
    );
    const updated = { ...current, documentos };
    this._selectedProduct.set(updated);
    this.upsertProduct(updated);
  }

  private documentErrorMessage(error: unknown, fallback: string): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        if (typeof error.error?.message === 'string') {
          return error.error.message;
        }
        return 'Revisa los datos ingresados del documento.';
      }
      if (error.status === 404) return 'El documento o el producto ya no existe.';
    }
    return fallback;
  }

  private setCalculationConfigInSelectedProduct(
    config: CalculationConfigResponse,
  ): void {
    const current = this._selectedProduct();
    if (!current) return;
    const updated = { ...current, configuracionCalculo: config };
    this._selectedProduct.set(updated);
    this.upsertProduct(updated);
  }

  private calculationConfigErrorMessage(
    error: unknown,
    fallback: string,
  ): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 400) {
        if (typeof error.error?.message === 'string') {
          return error.error.message;
        }
        return 'Revisa los datos de la configuración de cálculo.';
      }
      if (error.status === 404) return 'El producto ya no existe.';
    }
    return fallback;
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
