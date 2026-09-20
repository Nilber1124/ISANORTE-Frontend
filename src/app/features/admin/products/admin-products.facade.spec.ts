import { HttpErrorResponse } from '@angular/common/http';
import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, Subject, of, throwError } from 'rxjs';

import { BusinessUnitResponse } from '../../../data/models/business-unit/business-unit-response.model';
import { CategoryResponse } from '../../../data/models/category/category-response.model';
import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { ProductCreateRequest } from '../../../data/models/product/product-create-request.model';
import { ProductPublicationStatus } from '../../../data/models/product/product-publication-status.enum';
import { ProductResponse } from '../../../data/models/product/product-response.model';
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
  createRequests: ProductCreateRequest[] = [];
  updateRequests: Array<{ id: string; request: ProductUpdateRequest }> = [];
  statusRequests: Array<{ id: string; request: ProductStatusRequest }> = [];

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
});
