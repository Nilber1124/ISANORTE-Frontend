import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';

import { CategoryResponse } from '../../../data/models/category/category-response.model';
import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { ProductPublicationStatus } from '../../../data/models/product/product-publication-status.enum';
import { ProductResponse } from '../../../data/models/product/product-response.model';
import { CategoryApiService } from '../../../data/services/category-api.service';
import { ProductApiService } from '../../../data/services/product-api.service';
import { CatalogFacade } from './catalog.facade';

const categories: CategoryResponse[] = [
  {
    id: 'category-furniture',
    nombre: 'Mobiliario',
    slug: 'mobiliario',
    descripcion: null,
    imagenUrl: null,
    activo: true,
    orden: 1,
    unidadNegocio: null,
    fechaCreacion: null,
    fechaActualizacion: null,
  },
  {
    id: 'category-lighting',
    nombre: 'Iluminación',
    slug: 'iluminacion',
    descripcion: null,
    imagenUrl: null,
    activo: true,
    orden: 2,
    unidadNegocio: null,
    fechaCreacion: null,
    fechaActualizacion: null,
  },
];

function createProduct(
  id: string,
  name: string,
  sku: string,
  category: CategoryResponse,
): ProductResponse {
  return {
    id,
    sku,
    nombre: name,
    slug: name.toLocaleLowerCase('es').replace(/\s+/g, '-'),
    resumen: `${name} para interiores`,
    descripcion: `Descripción de ${name}`,
    precioBase: null,
    precioAnterior: null,
    descuentoPorcentaje: null,
    disponibilidad: ProductAvailability.DISPONIBLE,
    destacado: false,
    estado: ProductPublicationStatus.PUBLICADO,
    tituloSeo: null,
    descripcionSeo: null,
    unidadNegocio: { id: 'business-isadecor', nombre: 'ISADECOR', slug: 'isadecor' },
    categorias: [{ id: category.id, nombre: category.nombre, slug: category.slug }],
    variantes: null,
    imagenes: null,
    especificaciones: null,
    documentos: null,
    configuracionCalculo: null,
    fechaCreacion: null,
    fechaActualizacion: null,
  };
}

class ProductApiStub {
  response$: Observable<ProductResponse[]> = of([]);

  getPublished(): Observable<ProductResponse[]> {
    return this.response$;
  }
}

class CategoryApiStub {
  response$: Observable<CategoryResponse[]> = of([]);

  getActive(): Observable<CategoryResponse[]> {
    return this.response$;
  }
}

describe('CatalogFacade', () => {
  let facade: CatalogFacade;
  let productApi: ProductApiStub;
  let categoryApi: CategoryApiStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CatalogFacade,
        ProductApiStub,
        CategoryApiStub,
        { provide: ProductApiService, useExisting: ProductApiStub },
        { provide: CategoryApiService, useExisting: CategoryApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    facade = TestBed.inject(CatalogFacade);
    productApi = TestBed.inject(ProductApiStub);
    categoryApi = TestBed.inject(CategoryApiStub);
  });

  it('loads published products and active categories successfully', () => {
    const products = [createProduct('product-1', 'Mesa de nogal', 'MES-001', categories[0])];
    productApi.response$ = of(products);
    categoryApi.response$ = of(categories);

    facade.load();

    expect(facade.products()).toEqual(products);
    expect(facade.categories()).toEqual(categories);
    expect(facade.loading()).toBe(false);
    expect(facade.error()).toBeNull();
  });

  it('treats empty API responses as a successful empty catalog', () => {
    facade.load();

    expect(facade.products()).toEqual([]);
    expect(facade.categories()).toEqual([]);
    expect(facade.loading()).toBe(false);
    expect(facade.error()).toBeNull();
  });

  it('filters products by their real category relation', () => {
    const furniture = createProduct('product-1', 'Mesa de nogal', 'MES-001', categories[0]);
    const lamp = createProduct('product-2', 'Lámpara de pie', 'LAM-001', categories[1]);
    productApi.response$ = of([furniture, lamp]);
    categoryApi.response$ = of(categories);
    facade.load();

    facade.setSelectedCategory(categories[1].id);

    expect(facade.filteredProducts()).toEqual([lamp]);
  });

  it('searches textual product fields ignoring case and repeated spaces', () => {
    const furniture = createProduct('product-1', 'Mesa de nogal', 'MES-001', categories[0]);
    const lamp = createProduct('product-2', 'Lámpara de pie', 'LAM-001', categories[1]);
    productApi.response$ = of([furniture, lamp]);
    categoryApi.response$ = of(categories);
    facade.load();

    facade.setSearchTerm('  MESA   DE nogal  ');

    expect(facade.filteredProducts()).toEqual([furniture]);
  });

  it('exposes an understandable error when either request fails', () => {
    productApi.response$ = throwError(() => new Error('Network error'));
    categoryApi.response$ = of(categories);

    facade.load();

    expect(facade.products()).toEqual([]);
    expect(facade.loading()).toBe(false);
    expect(facade.error()).toContain('No pudimos cargar el catálogo');
  });
});
