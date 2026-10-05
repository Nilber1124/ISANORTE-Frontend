import { HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';

import { BusinessUnitResponse } from '../../../data/models/business-unit/business-unit-response.model';
import { CategoryResponse } from '../../../data/models/category/category-response.model';
import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import {
  CalculationConfigCreateRequest,
  ProductCreateRequest,
  ProductDocumentCreateRequest,
  ProductImageCreateRequest,
  ProductSpecificationCreateRequest,
  ProductVariantCreateRequest,
} from '../../../data/models/product/product-create-request.model';
import { ProductDocumentType } from '../../../data/models/product/product-document-type.enum';
import { ProductPublicationStatus } from '../../../data/models/product/product-publication-status.enum';
import {
  CalculationConfigResponse,
  ProductDocumentResponse,
  ProductImageResponse,
  ProductResponse,
  ProductSpecificationResponse,
  ProductVariantResponse,
} from '../../../data/models/product/product-response.model';
import { ProductStatusRequest } from '../../../data/models/product/product-status-request.model';
import { ProductUpdateRequest } from '../../../data/models/product/product-update-request.model';
import { BusinessUnitApiService } from '../../../data/services/business-unit-api.service';
import { CategoryApiService } from '../../../data/services/category-api.service';
import { ProductApiService } from '../../../data/services/product-api.service';
import { AdminProductsFacade } from './admin-products.facade';

const unit: BusinessUnitResponse = {
  id: 'unit-1',
  nombre: 'ISADECOR',
  slug: 'isadecor',
  descripcion: null,
  icono: null,
  imagenUrl: null,
  imagenAlt: null,
  activo: true,
  destacado: false,
  orden: 1,
  empresa: { id: 'company-1', nombreComercial: 'ISANORTE' },
  recursos: [],
  fechaCreacion: null,
  fechaActualizacion: null,
};
const category: CategoryResponse = {
  id: 'category-1',
  nombre: 'Wall Panels',
  slug: 'wall-panels',
  descripcion: null,
  imagenUrl: null,
  activo: true,
  orden: 1,
  unidadNegocio: { id: unit.id, nombre: unit.nombre, slug: unit.slug },
  fechaCreacion: null,
  fechaActualizacion: null,
};
const product: ProductResponse = {
  id: 'product-1',
  sku: 'WP-001',
  nombre: 'Wall Panel Roble',
  slug: 'wall-panel-roble',
  resumen: null,
  descripcion: 'Panel decorativo',
  precioBase: 49.9,
  precioAnterior: null,
  descuentoPorcentaje: null,
  disponibilidad: ProductAvailability.DISPONIBLE,
  destacado: true,
  estado: ProductPublicationStatus.PUBLICADO,
  tituloSeo: null,
  descripcionSeo: null,
  unidadNegocio: { id: unit.id, nombre: unit.nombre, slug: unit.slug },
  categorias: [{ id: category.id, nombre: category.nombre, slug: category.slug }],
  variantes: [],
  imagenes: [],
  especificaciones: [],
  documentos: [],
  configuracionCalculo: null,
  retiroEnTienda: true,
  fechaCreacion: null,
  fechaActualizacion: null,
};
const createRequest: ProductCreateRequest = {
  sku: 'TEST-001',
  nombre: 'Producto prueba',
  slug: 'producto-prueba',
  resumen: null,
  descripcion: 'Producto creado desde Admin',
  precioBase: null,
  precioAnterior: null,
  descuentoPorcentaje: null,
  disponibilidad: ProductAvailability.DISPONIBLE,
  destacado: false,
  retiroEnTienda: true,
  estado: ProductPublicationStatus.BORRADOR,
  tituloSeo: null,
  descripcionSeo: null,
  unidadNegocioId: unit.id,
  categoriaIds: [category.id],
};
const updateRequest: ProductUpdateRequest = {
  ...createRequest,
  nombre: 'Producto prueba editado',
  destacado: false,
  retiroEnTienda: true,
  categoriaIds: [category.id],
};

class ProductApiStub {
  getAllResponse$: Observable<ProductResponse[]> = of([product]);
  createResponse$: Observable<ProductResponse> = of({
    ...product,
    id: 'product-2',
    sku: createRequest.sku,
    nombre: createRequest.nombre,
    slug: createRequest.slug,
    descripcion: createRequest.descripcion,
    estado: createRequest.estado,
  });
  updateResponse$: Observable<ProductResponse> = of({ ...product, nombre: updateRequest.nombre });
  statusResponse$: Observable<ProductResponse> = of({
    ...product,
    estado: ProductPublicationStatus.OCULTO,
  });
  createImageResponse$: Observable<ProductImageResponse> = of({
    id: 'img-new',
    url: 'https://res.cloudinary.com/test/new.webp',
    altText: 'Foto nueva',
    esPrincipal: false,
    orden: 0,
  });
  updateImageResponse$: Observable<ProductImageResponse> = of({
    id: 'img-1',
    url: 'https://res.cloudinary.com/test/img1.webp',
    altText: 'Foto editada',
    esPrincipal: true,
    orden: 0,
  });
  deleteImageResponse$: Observable<void> = of(void 0);
  createVariantResponse$: Observable<ProductVariantResponse> = of({
    id: 'var-1',
    sku: 'WP-001-ROJO',
    nombre: 'Rojo 100cm',
    descripcion: 'Acabado rojo',
    precio: 55.0,
    disponible: true,
    imagenUrl: null,
    orden: 0,
  });
  updateVariantResponse$: Observable<ProductVariantResponse> = of({
    id: 'var-1',
    sku: 'WP-001-ROJO',
    nombre: 'Rojo 100cm Modificado',
    descripcion: 'Acabado rojo brillante',
    precio: 58.0,
    disponible: true,
    imagenUrl: null,
    orden: 0,
  });
  deleteVariantResponse$: Observable<void> = of(void 0);
  createSpecificationResponse$: Observable<ProductSpecificationResponse> = of({
    id: 'spec-1',
    clave: 'Material',
    valor: 'Madera Roble',
    grupo: 'Composición',
    orden: 0,
  });
  updateSpecificationResponse$: Observable<ProductSpecificationResponse> = of({
    id: 'spec-1',
    clave: 'Material',
    valor: 'Madera Roble Premium',
    grupo: 'Composición',
    orden: 0,
  });
  deleteSpecificationResponse$: Observable<void> = of(void 0);
  createDocumentResponse$: Observable<ProductDocumentResponse> = of({
    id: 'doc-1',
    titulo: 'Ficha Técnica Roble',
    url: 'https://example.com/doc.pdf',
    tipo: ProductDocumentType.FICHA_TECNICA,
    formato: 'PDF',
    tamanoBytes: 1048576,
  });
  updateDocumentResponse$: Observable<ProductDocumentResponse> = of({
    id: 'doc-1',
    titulo: 'Ficha Técnica Roble Actualizada',
    url: 'https://example.com/doc-v2.pdf',
    tipo: ProductDocumentType.FICHA_TECNICA,
    formato: 'PDF',
    tamanoBytes: 2097152,
  });
  deleteDocumentResponse$: Observable<void> = of(void 0);
  updateCalculationConfigResponse$: Observable<CalculationConfigResponse> = of({
    id: 'calc-1',
    habilitada: true,
    etiquetaEntrada: 'Área m²',
    unidadEntrada: 'm²',
    coberturaPorUnidad: 1.44,
    unidadVenta: 'caja',
    textoAyuda: 'Ingresa m²',
  });
  getByIdResponse$: Observable<ProductResponse> = of(product);

  createRequests: ProductCreateRequest[] = [];
  updateRequests: Array<{ id: string; request: ProductUpdateRequest }> = [];
  statusRequests: Array<{ id: string; request: ProductStatusRequest }> = [];
  createImageRequests: Array<{ productId: string; request: ProductImageCreateRequest }> = [];
  updateImageRequests: Array<{ productId: string; imageId: string; request: ProductImageCreateRequest }> = [];
  deleteImageRequests: Array<{ productId: string; imageId: string }> = [];
  createVariantRequests: Array<{ productId: string; request: ProductVariantCreateRequest }> = [];
  updateVariantRequests: Array<{ productId: string; variantId: string; request: ProductVariantCreateRequest }> = [];
  deleteVariantRequests: Array<{ productId: string; variantId: string }> = [];
  createSpecificationRequests: Array<{ productId: string; request: ProductSpecificationCreateRequest }> = [];
  updateSpecificationRequests: Array<{ productId: string; specId: string; request: ProductSpecificationCreateRequest }> = [];
  deleteSpecificationRequests: Array<{ productId: string; specId: string }> = [];
  createDocumentRequests: Array<{ productId: string; request: ProductDocumentCreateRequest }> = [];
  updateDocumentRequests: Array<{ productId: string; docId: string; request: ProductDocumentCreateRequest }> = [];
  deleteDocumentRequests: Array<{ productId: string; docId: string }> = [];
  updateCalculationConfigRequests: Array<{ productId: string; request: CalculationConfigCreateRequest }> = [];

  getAll(): Observable<ProductResponse[]> {
    return this.getAllResponse$;
  }
  create(request: ProductCreateRequest): Observable<ProductResponse> {
    this.createRequests.push(request);
    return this.createResponse$;
  }
  update(id: string, request: ProductUpdateRequest): Observable<ProductResponse> {
    this.updateRequests.push({ id, request });
    return this.updateResponse$;
  }
  changeStatus(id: string, request: ProductStatusRequest): Observable<ProductResponse> {
    this.statusRequests.push({ id, request });
    return this.statusResponse$;
  }
  createImage(productId: string, request: ProductImageCreateRequest): Observable<ProductImageResponse> {
    this.createImageRequests.push({ productId, request });
    return this.createImageResponse$;
  }
  updateImage(productId: string, imageId: string, request: ProductImageCreateRequest): Observable<ProductImageResponse> {
    this.updateImageRequests.push({ productId, imageId, request });
    return this.updateImageResponse$;
  }
  deleteImage(productId: string, imageId: string): Observable<void> {
    this.deleteImageRequests.push({ productId, imageId });
    return this.deleteImageResponse$;
  }
  createVariant(productId: string, request: ProductVariantCreateRequest): Observable<ProductVariantResponse> {
    this.createVariantRequests.push({ productId, request });
    return this.createVariantResponse$;
  }
  updateVariant(productId: string, variantId: string, request: ProductVariantCreateRequest): Observable<ProductVariantResponse> {
    this.updateVariantRequests.push({ productId, variantId, request });
    return this.updateVariantResponse$;
  }
  deleteVariant(productId: string, variantId: string): Observable<void> {
    this.deleteVariantRequests.push({ productId, variantId });
    return this.deleteVariantResponse$;
  }
  createSpecification(productId: string, request: ProductSpecificationCreateRequest): Observable<ProductSpecificationResponse> {
    this.createSpecificationRequests.push({ productId, request });
    return this.createSpecificationResponse$;
  }
  updateSpecification(productId: string, specId: string, request: ProductSpecificationCreateRequest): Observable<ProductSpecificationResponse> {
    this.updateSpecificationRequests.push({ productId, specId, request });
    return this.updateSpecificationResponse$;
  }
  deleteSpecification(productId: string, specId: string): Observable<void> {
    this.deleteSpecificationRequests.push({ productId, specId });
    return this.deleteSpecificationResponse$;
  }
  createDocument(productId: string, request: ProductDocumentCreateRequest): Observable<ProductDocumentResponse> {
    this.createDocumentRequests.push({ productId, request });
    return this.createDocumentResponse$;
  }
  updateDocument(productId: string, docId: string, request: ProductDocumentCreateRequest): Observable<ProductDocumentResponse> {
    this.updateDocumentRequests.push({ productId, docId, request });
    return this.updateDocumentResponse$;
  }
  deleteDocument(productId: string, docId: string): Observable<void> {
    this.deleteDocumentRequests.push({ productId, docId });
    return this.deleteDocumentResponse$;
  }
  updateCalculationConfig(
    productId: string,
    request: CalculationConfigCreateRequest,
  ): Observable<CalculationConfigResponse> {
    this.updateCalculationConfigRequests.push({ productId, request });
    return this.updateCalculationConfigResponse$;
  }
  getById(id: string): Observable<ProductResponse> {
    return this.getByIdResponse$;
  }
}

class CategoryApiStub {
  response$: Observable<CategoryResponse[]> = of([category]);
  calls = 0;
  getAll(): Observable<CategoryResponse[]> {
    this.calls += 1;
    return this.response$;
  }
}

class BusinessUnitApiStub {
  response$: Observable<BusinessUnitResponse[]> = of([unit]);
  calls = 0;
  getAll(): Observable<BusinessUnitResponse[]> {
    this.calls += 1;
    return this.response$;
  }
}

describe('AdminProductsFacade', () => {
  let facade: AdminProductsFacade;
  let productApi: ProductApiStub;
  let categoryApi: CategoryApiStub;
  let businessUnitApi: BusinessUnitApiStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AdminProductsFacade,
        ProductApiStub,
        CategoryApiStub,
        BusinessUnitApiStub,
        { provide: ProductApiService, useExisting: ProductApiStub },
        { provide: CategoryApiService, useExisting: CategoryApiStub },
        { provide: BusinessUnitApiService, useExisting: BusinessUnitApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });
    facade = TestBed.inject(AdminProductsFacade);
    productApi = TestBed.inject(ProductApiStub);
    categoryApi = TestBed.inject(CategoryApiStub);
    businessUnitApi = TestBed.inject(BusinessUnitApiStub);
  });

  it('loads all products, categories and business units', () => {
    facade.load();
    expect(facade.products()).toEqual([product]);
    expect(facade.categories()).toEqual([category]);
    expect(facade.businessUnits()).toEqual([unit]);
    expect(categoryApi.calls).toBe(1);
    expect(businessUnitApi.calls).toBe(1);
    expect(facade.loading()).toBe(false);
    expect(facade.loadingFormData()).toBe(false);
  });

  it('creates a product and sends the exact request', () => {
    facade.load();
    facade.openCreate();
    facade.create(createRequest);
    expect(productApi.createRequests).toEqual([createRequest]);
    expect(facade.products().some((item) => item.slug === createRequest.slug)).toBe(true);
    expect(facade.formOpen()).toBe(false);
  });

  it('updates only the selected product by its id', () => {
    facade.load();
    facade.openEdit(product);
    facade.update(updateRequest);
    expect(productApi.updateRequests).toEqual([{ id: product.id, request: updateRequest }]);
    expect(facade.products().find((item) => item.id === product.id)?.nombre).toBe(
      updateRequest.nombre,
    );
  });

  it('changes publication status with the status contract', () => {
    facade.load();
    facade.changeStatus(product, ProductPublicationStatus.OCULTO);
    expect(productApi.statusRequests).toEqual([
      { id: product.id, request: { estado: ProductPublicationStatus.OCULTO } },
    ]);
    expect(facade.products()[0].estado).toBe(ProductPublicationStatus.OCULTO);
  });

  it('exposes a safe error when product loading fails', () => {
    productApi.getAllResponse$ = throwError(() => new HttpErrorResponse({ status: 500 }));
    facade.load();
    expect(facade.error()).toContain('No pudimos cargar los productos');
    expect(facade.loading()).toBe(false);
  });

  it('keeps the form open and explains a duplicate conflict', () => {
    productApi.createResponse$ = throwError(() => new HttpErrorResponse({ status: 409 }));
    facade.openCreate();
    facade.create(createRequest);
    expect(facade.error()).toBe('Ya existe un producto con ese SKU o slug.');
    expect(facade.formOpen()).toBe(true);
    expect(facade.submitting()).toBe(false);
  });

  it('maps 400 and 404 mutation errors to safe messages', () => {
    productApi.createResponse$ = throwError(() => new HttpErrorResponse({ status: 400 }));
    facade.openCreate();
    facade.create(createRequest);
    expect(facade.error()).toContain('Revisa los datos');

    productApi.updateResponse$ = throwError(() => new HttpErrorResponse({ status: 404 }));
    facade.openEdit(product);
    facade.update(updateRequest);
    expect(facade.error()).toContain('ya no existe');
  });

  it('keeps submitting true until creation completes and blocks duplicate requests', () => {
    const pending = new Subject<ProductResponse>();
    productApi.createResponse$ = pending;
    facade.openCreate();
    facade.create(createRequest);
    facade.create(createRequest);
    expect(facade.submitting()).toBe(true);
    expect(productApi.createRequests).toHaveLength(1);
    pending.next({ ...product, id: 'product-2' });
    pending.complete();
    expect(facade.submitting()).toBe(false);
  });

  it('returns status-changing state to idle after an error', () => {
    productApi.statusResponse$ = throwError(() => new HttpErrorResponse({ status: 404 }));
    facade.changeStatus(product, ProductPublicationStatus.OCULTO);
    expect(facade.error()).toContain('ya no existe');
    expect(facade.changingStatusId()).toBeNull();
  });

  it('adds image to selected product and updates products list', () => {
    facade.openEdit(product);
    const newImageReq: ProductImageCreateRequest = {
      url: 'https://res.cloudinary.com/test/photo.webp',
      altText: 'Foto producto',
      esPrincipal: true,
      orden: 0,
    };
    facade.addImage(product.id, newImageReq);

    expect(productApi.createImageRequests).toHaveLength(1);
    expect(productApi.createImageRequests[0].productId).toBe(product.id);
    expect(facade.imageSuccess()).toBe('Imagen agregada correctamente.');
    expect(facade.selectedProduct()?.imagenes).toHaveLength(1);
    expect(facade.selectedProduct()?.imagenes![0].id).toBe('img-new');
  });

  it('deletes image and promotes remaining image to principal if deleted was principal', () => {
    const productWithImages: ProductResponse = {
      ...product,
      imagenes: [
        { id: 'img-1', url: 'https://res.cloudinary.com/test/img1.webp', altText: 'F1', esPrincipal: true, orden: 0 },
        { id: 'img-2', url: 'https://res.cloudinary.com/test/img2.webp', altText: 'F2', esPrincipal: false, orden: 1 },
      ],
    };
    facade.openEdit(productWithImages);

    facade.deleteImage(productWithImages.id, 'img-1');
    expect(productApi.deleteImageRequests).toHaveLength(1);
    expect(productApi.deleteImageRequests[0].imageId).toBe('img-1');
    expect(facade.imageSuccess()).toBe('Imagen eliminada.');
  });

  it('sets principal image sequentially using concatMap without concurrent calls', () => {
    const productWithImages: ProductResponse = {
      ...product,
      imagenes: [
        { id: 'img-1', url: 'https://res.cloudinary.com/test/img1.webp', altText: 'F1', esPrincipal: true, orden: 0 },
        { id: 'img-2', url: 'https://res.cloudinary.com/test/img2.webp', altText: 'F2', esPrincipal: false, orden: 1 },
      ],
    };
    facade.openEdit(productWithImages);

    facade.setPrincipalImage(productWithImages.id, 'img-2');

    expect(productApi.updateImageRequests).toHaveLength(2);
    // Primera petición: target -> esPrincipal = true
    expect(productApi.updateImageRequests[0].imageId).toBe('img-2');
    expect(productApi.updateImageRequests[0].request.esPrincipal).toBe(true);
    // Segunda petición: old principal -> esPrincipal = false
    expect(productApi.updateImageRequests[1].imageId).toBe('img-1');
    expect(productApi.updateImageRequests[1].request.esPrincipal).toBe(false);

    expect(facade.selectedProduct()?.imagenes?.find((i) => i.id === 'img-2')?.esPrincipal).toBe(true);
    expect(facade.selectedProduct()?.imagenes?.find((i) => i.id === 'img-1')?.esPrincipal).toBe(false);
  });

  it('reorders images sequentially and updates internal order', () => {
    const productWithImages: ProductResponse = {
      ...product,
      imagenes: [
        { id: 'img-1', url: 'https://res.cloudinary.com/test/img1.webp', altText: 'F1', esPrincipal: true, orden: 0 },
        { id: 'img-2', url: 'https://res.cloudinary.com/test/img2.webp', altText: 'F2', esPrincipal: false, orden: 1 },
      ],
    };
    facade.openEdit(productWithImages);

    facade.reorderImages(productWithImages.id, 0, 1);

    expect(productApi.updateImageRequests).toHaveLength(2);
    expect(facade.imageSuccess()).toBe('Orden actualizado.');
    const updatedImages = facade.selectedProduct()?.imagenes;
    expect(updatedImages?.[0].id).toBe('img-2');
    expect(updatedImages?.[1].id).toBe('img-1');
  });

  it('recovers state from backend when an image operation fails', () => {
    facade.openEdit(product);
    productApi.createImageResponse$ = throwError(() => new HttpErrorResponse({ status: 500 }));

    facade.addImage(product.id, {
      url: 'https://res.cloudinary.com/test/fail.webp',
      altText: 'Fail',
      esPrincipal: false,
      orden: 0,
    });

    expect(facade.imageError()).toBe('No pudimos asociar la imagen al producto.');
    expect(facade.imageOperating()).toBe(false);
  });

  it('adds variant and updates selected product and success message', () => {
    facade.openEdit(product);

    facade.addVariant(product.id, {
      sku: 'WP-001-ROJO',
      nombre: 'Rojo 100cm',
      descripcion: 'Acabado rojo',
      precio: 55.0,
      disponible: true,
      imagenUrl: null,
      orden: 0,
    });

    expect(productApi.createVariantRequests).toHaveLength(1);
    expect(facade.variantSuccess()).toBe('Variante agregada correctamente.');
    expect(facade.selectedProduct()?.variantes).toHaveLength(1);
    expect(facade.selectedProduct()?.variantes?.[0].sku).toBe('WP-001-ROJO');
  });

  it('updates variant and sets success feedback', () => {
    const productWithVariant: ProductResponse = {
      ...product,
      variantes: [
        {
          id: 'var-1',
          sku: 'WP-001-ROJO',
          nombre: 'Rojo 100cm',
          descripcion: null,
          precio: 50.0,
          disponible: true,
          imagenUrl: null,
          orden: 0,
        },
      ],
    };
    facade.openEdit(productWithVariant);

    facade.updateVariant(productWithVariant.id, 'var-1', {
      sku: 'WP-001-ROJO',
      nombre: 'Rojo 100cm Modificado',
      descripcion: 'Acabado rojo brillante',
      precio: 58.0,
      disponible: true,
      imagenUrl: null,
      orden: 0,
    });

    expect(productApi.updateVariantRequests).toHaveLength(1);
    expect(facade.variantSuccess()).toBe('Variante actualizada correctamente.');
    expect(facade.selectedProduct()?.variantes?.[0].nombre).toBe('Rojo 100cm Modificado');
  });

  it('deletes variant from selected product', () => {
    const productWithVariant: ProductResponse = {
      ...product,
      variantes: [
        {
          id: 'var-1',
          sku: 'WP-001-ROJO',
          nombre: 'Rojo 100cm',
          descripcion: null,
          precio: 50.0,
          disponible: true,
          imagenUrl: null,
          orden: 0,
        },
      ],
    };
    facade.openEdit(productWithVariant);

    facade.deleteVariant(productWithVariant.id, 'var-1');

    expect(productApi.deleteVariantRequests).toHaveLength(1);
    expect(facade.variantSuccess()).toBe('Variante eliminada.');
    expect(facade.selectedProduct()?.variantes).toHaveLength(0);
  });

  it('handles duplicate SKU error when adding variant', () => {
    facade.openEdit(product);
    productApi.createVariantResponse$ = throwError(
      () => new HttpErrorResponse({ status: 409, error: { message: 'SKU duplicado' } }),
    );

    facade.addVariant(product.id, {
      sku: 'WP-001-DUPLICATE',
      nombre: 'Duplicado',
      disponible: true,
      orden: 0,
    });

    expect(facade.variantError()).toBe('Ya existe una variante con ese SKU.');
    expect(facade.variantOperating()).toBe(false);
  });

  it('adds specification and appends to selected product', () => {
    facade.openEdit(product);

    facade.addSpecification(product.id, {
      clave: 'Material',
      valor: 'Madera Roble',
      grupo: 'Composición',
      orden: 0,
    });

    expect(productApi.createSpecificationRequests).toHaveLength(1);
    expect(productApi.createSpecificationRequests[0].productId).toBe(product.id);
    expect(facade.specificationSuccess()).toBe('Especificación agregada correctamente.');
    expect(facade.selectedProduct()?.especificaciones).toHaveLength(1);
    expect(facade.selectedProduct()?.especificaciones?.[0].clave).toBe('Material');
  });

  it('updates specification in selected product', () => {
    const productWithSpec: ProductResponse = {
      ...product,
      especificaciones: [
        {
          id: 'spec-1',
          clave: 'Material',
          valor: 'Madera Roble',
          grupo: 'Composición',
          orden: 0,
        },
      ],
    };
    facade.openEdit(productWithSpec);

    facade.updateSpecification(productWithSpec.id, 'spec-1', {
      clave: 'Material',
      valor: 'Madera Roble Premium',
      grupo: 'Composición',
      orden: 0,
    });

    expect(productApi.updateSpecificationRequests).toHaveLength(1);
    expect(facade.specificationSuccess()).toBe('Especificación actualizada correctamente.');
    expect(facade.selectedProduct()?.especificaciones?.[0].valor).toBe('Madera Roble Premium');
  });

  it('deletes specification from selected product', () => {
    const productWithSpec: ProductResponse = {
      ...product,
      especificaciones: [
        {
          id: 'spec-1',
          clave: 'Material',
          valor: 'Madera Roble',
          grupo: 'Composición',
          orden: 0,
        },
      ],
    };
    facade.openEdit(productWithSpec);

    facade.deleteSpecification(productWithSpec.id, 'spec-1');

    expect(productApi.deleteSpecificationRequests).toHaveLength(1);
    expect(facade.specificationSuccess()).toBe('Especificación eliminada.');
    expect(facade.selectedProduct()?.especificaciones).toHaveLength(0);
  });

  it('handles error when adding specification', () => {
    facade.openEdit(product);
    productApi.createSpecificationResponse$ = throwError(
      () => new HttpErrorResponse({ status: 400, error: { message: 'Parámetro inválido' } }),
    );

    facade.addSpecification(product.id, {
      clave: '',
      valor: 'Valor',
      orden: 0,
    });

    expect(facade.specificationError()).toBe('Parámetro inválido');
    expect(facade.specificationOperating()).toBe(false);
  });

  it('adds document and appends to selected product', () => {
    facade.openEdit(product);

    facade.addDocument(product.id, {
      titulo: 'Ficha Técnica Roble',
      url: 'https://example.com/doc.pdf',
      tipo: ProductDocumentType.FICHA_TECNICA,
      formato: 'PDF',
      tamanoBytes: 1048576,
    });

    expect(productApi.createDocumentRequests).toHaveLength(1);
    expect(productApi.createDocumentRequests[0].productId).toBe(product.id);
    expect(facade.documentSuccess()).toBe('Documento agregado correctamente.');
    expect(facade.selectedProduct()?.documentos).toHaveLength(1);
    expect(facade.selectedProduct()?.documentos?.[0].titulo).toBe('Ficha Técnica Roble');
  });

  it('updates document in selected product', () => {
    const productWithDoc: ProductResponse = {
      ...product,
      documentos: [
        {
          id: 'doc-1',
          titulo: 'Ficha Técnica Roble',
          url: 'https://example.com/doc.pdf',
          tipo: ProductDocumentType.FICHA_TECNICA,
          formato: 'PDF',
          tamanoBytes: 1048576,
        },
      ],
    };
    facade.openEdit(productWithDoc);

    facade.updateDocument(productWithDoc.id, 'doc-1', {
      titulo: 'Ficha Técnica Roble Actualizada',
      url: 'https://example.com/doc-v2.pdf',
      tipo: ProductDocumentType.FICHA_TECNICA,
      formato: 'PDF',
      tamanoBytes: 2097152,
    });

    expect(productApi.updateDocumentRequests).toHaveLength(1);
    expect(facade.documentSuccess()).toBe('Documento actualizado correctamente.');
    expect(facade.selectedProduct()?.documentos?.[0].titulo).toBe('Ficha Técnica Roble Actualizada');
  });

  it('deletes document from selected product', () => {
    const productWithDoc: ProductResponse = {
      ...product,
      documentos: [
        {
          id: 'doc-1',
          titulo: 'Ficha Técnica Roble',
          url: 'https://example.com/doc.pdf',
          tipo: ProductDocumentType.FICHA_TECNICA,
          formato: 'PDF',
          tamanoBytes: 1048576,
        },
      ],
    };
    facade.openEdit(productWithDoc);

    facade.deleteDocument(productWithDoc.id, 'doc-1');

    expect(productApi.deleteDocumentRequests).toHaveLength(1);
    expect(facade.documentSuccess()).toBe('Documento eliminado.');
    expect(facade.selectedProduct()?.documentos).toHaveLength(0);
  });

  it('handles error when adding document', () => {
    facade.openEdit(product);
    productApi.createDocumentResponse$ = throwError(
      () => new HttpErrorResponse({ status: 400, error: { message: 'URL inválida' } }),
    );

    facade.addDocument(product.id, {
      titulo: 'Documento',
      url: '',
      tipo: ProductDocumentType.OTRO,
    });

    expect(facade.documentError()).toBe('URL inválida');
    expect(facade.documentOperating()).toBe(false);
  });

  it('updates calculation config in selected product', () => {
    facade.openEdit(product);

    facade.updateCalculationConfig(product.id, {
      habilitada: true,
      etiquetaEntrada: 'Área m²',
      unidadEntrada: 'm²',
      coberturaPorUnidad: 1.44,
      unidadVenta: 'caja',
      textoAyuda: 'Ingresa m²',
    });

    expect(productApi.updateCalculationConfigRequests).toHaveLength(1);
    expect(productApi.updateCalculationConfigRequests[0].productId).toBe(product.id);
    expect(productApi.updateCalculationConfigRequests[0].request.coberturaPorUnidad).toBe(1.44);
    expect(facade.calculationConfigSuccess()).toBe('Configuración de cálculo guardada correctamente.');
    expect(facade.selectedProduct()?.configuracionCalculo?.coberturaPorUnidad).toBe(1.44);
  });

  it('handles error when updating calculation config', () => {
    facade.openEdit(product);
    productApi.updateCalculationConfigResponse$ = throwError(
      () => new HttpErrorResponse({ status: 400, error: { message: 'Cobertura inválida' } }),
    );

    facade.updateCalculationConfig(product.id, {
      habilitada: true,
      coberturaPorUnidad: 0,
    });

    expect(facade.calculationConfigError()).toBe('Cobertura inválida');
    expect(facade.calculationConfigOperating()).toBe(false);
  });
});
