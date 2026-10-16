import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';

import { ISADECOR_UNIT_SLUG, PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import {
  CatalogBackendOrder,
  PublicProductCardResponse,
  PublicProductCatalogCategoryResponse,
  PublicProductCatalogPageResponse,
  PublicProductCatalogResponse,
} from '../../../data/models/public-content/public-product-catalog.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { CatalogFacade } from './catalog.facade';

interface CatalogQuery {
  page: number;
  size: number;
  categoria?: string | null;
  q?: string | null;
  soloDescuento?: boolean;
  soloDisponible?: boolean;
  soloDestacados?: boolean;
  orden?: CatalogBackendOrder;
}

/** El facade debounce la búsqueda con RxJS (temporizadores reales), así que se espera tiempo real. */
function flush(ms = 0): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const categories: PublicProductCatalogCategoryResponse[] = [
  { nombre: 'Mobiliario', slug: 'mobiliario', cantidad: 3 },
  { nombre: 'Iluminación', slug: 'iluminacion', cantidad: 2 },
];

function createProduct(name: string, sku: string): PublicProductCardResponse {
  return {
    nombre: name,
    sku,
    slug: name
      .toLocaleLowerCase('es')
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-'),
    resumen: `${name} para interiores`,
    descripcion: `Descripción de ${name}`,
    precioBase: null,
    precioAnterior: null,
    descuentoPorcentaje: null,
    disponibilidad: ProductAvailability.DISPONIBLE,
    destacado: false,
    ordenDestacado: 0,
    retiroEnTienda: true,
    imagen: null,
    categorias: [],
  };
}

function toPage(
  products: PublicProductCardResponse[],
  overrides: Partial<PublicProductCatalogPageResponse> = {},
): PublicProductCatalogPageResponse {
  return {
    contenido: products,
    pagina: 0,
    tamano: 12,
    totalElementos: products.length,
    totalPaginas: products.length > 0 ? 1 : 0,
    ...overrides,
  };
}

class PublicContentApiStub {
  response$: Observable<PublicProductCatalogResponse> = of({
    unidad: { nombre: 'ISADECOR', slug: ISADECOR_UNIT_SLUG },
    categorias: [],
    productos: toPage([]),
  });
  readonly calls: { siteKey: string; unitSlug: string; query: CatalogQuery }[] = [];

  getProductCatalog(
    siteKey: string,
    unitSlug: string,
    query: CatalogQuery,
  ): Observable<PublicProductCatalogResponse> {
    this.calls.push({ siteKey, unitSlug, query });
    return this.response$;
  }
}

describe('CatalogFacade', () => {
  let facade: CatalogFacade;
  let publicApi: PublicContentApiStub;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        CatalogFacade,
        PublicContentApiStub,
        { provide: PublicContentApiService, useExisting: PublicContentApiStub },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    });

    facade = TestBed.inject(CatalogFacade);
    publicApi = TestBed.inject(PublicContentApiStub);
  });

  it('loads the first page from the backend with the default query', async () => {
    const products = [createProduct('Mesa de nogal', 'MES-001')];
    publicApi.response$ = of({
      unidad: { nombre: 'ISADECOR', slug: ISADECOR_UNIT_SLUG },
      categorias: categories,
      productos: toPage(products),
    });

    facade.load();
    await flush();

    expect(facade.siteKey).toBe(PUBLIC_SITE_KEY);
    expect(facade.unitSlug).toBe(ISADECOR_UNIT_SLUG);
    expect(publicApi.calls.length).toBe(1);
    expect(publicApi.calls[0].siteKey).toBe(PUBLIC_SITE_KEY);
    expect(publicApi.calls[0].unitSlug).toBe(ISADECOR_UNIT_SLUG);
    expect(publicApi.calls[0].query).toEqual({
      page: 0,
      size: 12,
      categoria: null,
      q: '',
      soloDescuento: false,
      soloDisponible: false,
      soloDestacados: false,
      orden: 'DESTACADOS',
    });
    expect(facade.products()).toEqual(products);
    expect(facade.categories()).toEqual(categories);
    expect(facade.totalItems()).toBe(1);
    expect(facade.totalPages()).toBe(1);
    expect(facade.loading()).toBe(false);
    expect(facade.error()).toBeNull();
  });

  it('treats an empty page as a successful empty catalog', async () => {
    facade.load();
    await flush();

    expect(facade.products()).toEqual([]);
    expect(facade.categories()).toEqual([]);
    expect(facade.totalItems()).toBe(0);
    expect(facade.loading()).toBe(false);
    expect(facade.error()).toBeNull();
  });

  it('refetches with the category slug and resets the page', async () => {
    publicApi.response$ = of({
      unidad: { nombre: 'ISADECOR', slug: ISADECOR_UNIT_SLUG },
      categorias: categories,
      productos: toPage([createProduct('Panel A', 'PAN-01')], { totalElementos: 30, totalPaginas: 3 }),
    });
    facade.load();
    await flush();
    facade.setPage(2);
    await flush();
    publicApi.calls.length = 0;

    facade.setSelectedCategory('iluminacion');
    await flush();

    expect(publicApi.calls.length).toBe(1);
    expect(publicApi.calls[0].query.categoria).toBe('iluminacion');
    expect(publicApi.calls[0].query.page).toBe(0);
  });

  it('resolves a category typed by display name to its slug', async () => {
    publicApi.response$ = of({
      unidad: { nombre: 'ISADECOR', slug: ISADECOR_UNIT_SLUG },
      categorias: categories,
      productos: toPage([]),
    });
    facade.load();
    await flush();

    facade.setSelectedCategory('ILUMINACIÓN');
    await flush();

    expect(facade.selectedCategory()).toBe('iluminacion');
  });

  it('debounces the search term and resets the page once it settles', async () => {
    publicApi.response$ = of({
      unidad: { nombre: 'ISADECOR', slug: ISADECOR_UNIT_SLUG },
      categorias: categories,
      productos: toPage([createProduct('Panel A', 'PAN-01')], { totalElementos: 30, totalPaginas: 3 }),
    });
    facade.load();
    await flush();
    facade.setPage(2);
    await flush();
    publicApi.calls.length = 0;

    facade.setSearchTerm('mesa de nogal');
    await flush(100);
    expect(publicApi.calls.length).toBe(0);

    await flush(300);
    expect(publicApi.calls.length).toBe(1);
    expect(publicApi.calls[0].query.q).toBe('mesa de nogal');
    expect(publicApi.calls[0].query.page).toBe(0);
  });

  it('resets the page when toggling discount or stock filters', async () => {
    publicApi.response$ = of({
      unidad: { nombre: 'ISADECOR', slug: ISADECOR_UNIT_SLUG },
      categorias: categories,
      productos: toPage([createProduct('Panel A', 'PAN-01')], { totalElementos: 30, totalPaginas: 3 }),
    });
    facade.load();
    await flush();
    facade.setPage(2);
    await flush();
    publicApi.calls.length = 0;

    facade.toggleOnlyDiscount();
    await flush();

    expect(publicApi.calls.length).toBe(1);
    expect(publicApi.calls[0].query.soloDescuento).toBe(true);
    expect(publicApi.calls[0].query.page).toBe(0);
  });

  it('includes soloDestacados when a consumer like the home page opts in', async () => {
    facade.load();
    await flush();
    publicApi.calls.length = 0;

    facade.setOnlyFeatured(true);
    await flush();

    expect(publicApi.calls.length).toBe(1);
    expect(publicApi.calls[0].query.soloDestacados).toBe(true);
    expect(publicApi.calls[0].query.page).toBe(0);
  });

  it('maps every sort option to its backend order', async () => {
    facade.load();
    await flush();
    publicApi.calls.length = 0;

    facade.setSortOption('price-asc');
    await flush();
    facade.setSortOption('price-desc');
    await flush();
    facade.setSortOption('name-asc');
    await flush();
    facade.setSortOption('featured');
    await flush();

    expect(publicApi.calls.map((call) => call.query.orden)).toEqual([
      'PRECIO_ASC',
      'PRECIO_DESC',
      'NOMBRE_ASC',
      'DESTACADOS',
    ]);
  });

  it('exposes an understandable error when the request fails', async () => {
    publicApi.response$ = throwError(() => new Error('Network error'));

    facade.load();
    await flush();

    expect(facade.products()).toEqual([]);
    expect(facade.loading()).toBe(false);
    expect(facade.error()).toContain('No pudimos cargar el catálogo');
  });

  it('retries the last request when load() is called again after an error', async () => {
    publicApi.response$ = throwError(() => new Error('Network error'));
    facade.load();
    await flush();
    expect(facade.error()).not.toBeNull();

    const products = [createProduct('Mesa de nogal', 'MES-001')];
    publicApi.response$ = of({
      unidad: { nombre: 'ISADECOR', slug: ISADECOR_UNIT_SLUG },
      categorias: categories,
      productos: toPage(products),
    });

    facade.load();
    await flush();

    expect(publicApi.calls.length).toBe(2);
    expect(facade.error()).toBeNull();
    expect(facade.products()).toEqual(products);
  });

  it('reads category counts directly from the backend facet', async () => {
    publicApi.response$ = of({
      unidad: { nombre: 'ISADECOR', slug: ISADECOR_UNIT_SLUG },
      categorias: categories,
      productos: toPage([]),
    });
    facade.load();
    await flush();

    expect(facade.getCategoryCount(categories[0].slug)).toBe(3);
    expect(facade.getCategoryCount(categories[1].slug)).toBe(2);
    expect(facade.getCategoryCount('non-existent')).toBe(0);
  });

  it('clamps setPage within the known page range', async () => {
    publicApi.response$ = of({
      unidad: { nombre: 'ISADECOR', slug: ISADECOR_UNIT_SLUG },
      categorias: categories,
      productos: toPage([createProduct('Panel A', 'PAN-01')], { totalElementos: 30, totalPaginas: 3 }),
    });
    facade.load();
    await flush();

    facade.setPage(99);
    expect(facade.currentPage()).toBe(2);
    await flush();

    facade.setPage(-5);
    expect(facade.currentPage()).toBe(0);
    await flush();
  });

  it('resets all filters, toggles, sort option and page on clearFilters()', async () => {
    publicApi.response$ = of({
      unidad: { nombre: 'ISADECOR', slug: ISADECOR_UNIT_SLUG },
      categorias: categories,
      productos: toPage([createProduct('Panel A', 'PAN-01')], { totalElementos: 30, totalPaginas: 3 }),
    });
    facade.load();
    await flush();

    facade.setSelectedCategory('mobiliario');
    facade.setSearchTerm('mármol');
    await flush(300);
    facade.setSortOption('price-desc');
    facade.toggleOnlyDiscount();
    facade.toggleOnlyInStock();
    facade.setPage(2);
    await flush();

    expect(facade.hasActiveFilters()).toBe(true);

    facade.clearFilters();
    await flush();

    expect(facade.selectedCategory()).toBeNull();
    expect(facade.searchTerm()).toBe('');
    expect(facade.sortOption()).toBe('featured');
    expect(facade.onlyDiscount()).toBe(false);
    expect(facade.onlyInStock()).toBe(false);
    expect(facade.currentPage()).toBe(0);
    expect(facade.hasActiveFilters()).toBe(false);
  });
});
