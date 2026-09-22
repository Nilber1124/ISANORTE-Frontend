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

  it('filters products by category slug and resolves it to category id', () => {
    const furniture = createProduct('product-1', 'Mesa de nogal', 'MES-001', categories[0]);
    const lamp = createProduct('product-2', 'Lámpara de pie', 'LAM-001', categories[1]);
    productApi.response$ = of([furniture, lamp]);
    categoryApi.response$ = of(categories);
    facade.load();

    facade.setSelectedCategory('iluminacion');

    expect(facade.selectedCategory()).toBe(categories[1].id);
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

  it('sorts products by price ascending and descending', () => {
    const cheap = {
      ...createProduct('product-1', 'Panel Económico', 'PAN-01', categories[0]),
      precioBase: 50,
    };
    const expensive = {
      ...createProduct('product-2', 'Mármol Importado', 'MAR-01', categories[0]),
      precioBase: 250,
    };
    productApi.response$ = of([expensive, cheap]);
    categoryApi.response$ = of(categories);
    facade.load();

    facade.setSortOption('price-asc');
    expect(facade.filteredProducts()[0].id).toBe('product-1');
    expect(facade.filteredProducts()[1].id).toBe('product-2');

    facade.setSortOption('price-desc');
    expect(facade.filteredProducts()[0].id).toBe('product-2');
    expect(facade.filteredProducts()[1].id).toBe('product-1');
  });

  it('filters products by discount and stock toggles', () => {
    const discounted = {
      ...createProduct('product-1', 'Panel Oferta', 'PAN-01', categories[0]),
      descuentoPorcentaje: 20,
      disponibilidad: ProductAvailability.DISPONIBLE,
    };
    const outOfStock = {
      ...createProduct('product-2', 'Panel Agotado', 'PAN-02', categories[0]),
      descuentoPorcentaje: null,
      disponibilidad: ProductAvailability.AGOTADO,
    };
    productApi.response$ = of([discounted, outOfStock]);
    categoryApi.response$ = of(categories);
    facade.load();

    facade.toggleOnlyDiscount();
    expect(facade.filteredProducts()).toEqual([discounted]);

    facade.toggleOnlyDiscount();
    facade.toggleOnlyInStock();
    expect(facade.filteredProducts()).toEqual([discounted]);
  });

  it('computes category product counts correctly', () => {
    const p1 = createProduct('product-1', 'Panel A', 'PAN-01', categories[0]);
    const p2 = createProduct('product-2', 'Lámpara B', 'LAM-01', categories[1]);
    productApi.response$ = of([p1, p2]);
    categoryApi.response$ = of(categories);
    facade.load();

    expect(facade.getCategoryCount(categories[0].id)).toBe(1);
    expect(facade.getCategoryCount(categories[1].id)).toBe(1);
    expect(facade.getCategoryCount('non-existent')).toBe(0);
  });

  it('resets all filters, toggles and sort option on clearFilters()', () => {
    facade.setSelectedCategory('cat-1');
    facade.setSearchTerm('mármol');
    facade.setSortOption('price-desc');
    facade.toggleOnlyDiscount();
    facade.toggleOnlyInStock();

    expect(facade.hasActiveFilters()).toBe(true);

    facade.clearFilters();

    expect(facade.selectedCategory()).toBeNull();
    expect(facade.searchTerm()).toBe('');
    expect(facade.sortOption()).toBe('featured');
    expect(facade.onlyDiscount()).toBe(false);
    expect(facade.onlyInStock()).toBe(false);
    expect(facade.hasActiveFilters()).toBe(false);
  });
});
