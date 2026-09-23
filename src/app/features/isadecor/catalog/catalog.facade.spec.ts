import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Observable, of, throwError } from 'rxjs';

import { ISADECOR_UNIT_SLUG, PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import {
  PublicProductCardResponse,
  PublicProductCatalogResponse,
  PublicProductCategoryResponse,
} from '../../../data/models/public-content/public-product-catalog.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { CatalogFacade } from './catalog.facade';

const categories: PublicProductCategoryResponse[] = [
  {
    nombre: 'Mobiliario',
    slug: 'mobiliario',
  },
  {
    nombre: 'Iluminación',
    slug: 'iluminacion',
  },
];

function createProduct(
  name: string,
  sku: string,
  category: PublicProductCategoryResponse,
): PublicProductCardResponse {
  return {
    nombre: name,
    sku,
    slug: name
      .toLocaleLowerCase('es')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '-'),
    resumen: `${name} para interiores`,
    descripcion: `Descripción de ${name}`,
    precioBase: null,
    precioAnterior: null,
    descuentoPorcentaje: null,
    disponibilidad: ProductAvailability.DISPONIBLE,
    retiroEnTienda: true,
    imagen: {
      url: `/images/${sku.toLowerCase()}.webp`,
      alt: name,
      esPrincipal: true,
      orden: 0,
    },
    categorias: [category],
  };
}

class PublicContentApiStub {
  response$: Observable<PublicProductCatalogResponse> = of({
    unidad: { nombre: 'ISADECOR', slug: ISADECOR_UNIT_SLUG },
    categorias: [],
    productos: [],
  });
  readonly calls: { siteKey: string; unitSlug: string }[] = [];

  getProductCatalog(siteKey: string, unitSlug: string): Observable<PublicProductCatalogResponse> {
    this.calls.push({ siteKey, unitSlug });
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

  it('loads products and categories from canonical unit catalog successfully', () => {
    const products = [createProduct('Mesa de nogal', 'MES-001', categories[0])];
    publicApi.response$ = of({
      unidad: { nombre: 'ISADECOR', slug: ISADECOR_UNIT_SLUG },
      categorias: categories,
      productos: products,
    });

    facade.load();

    expect(facade.siteKey).toBe(PUBLIC_SITE_KEY);
    expect(facade.unitSlug).toBe(ISADECOR_UNIT_SLUG);
    expect(publicApi.calls).toEqual([{ siteKey: PUBLIC_SITE_KEY, unitSlug: ISADECOR_UNIT_SLUG }]);
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

  it('filters products by category slug', () => {
    const furniture = createProduct('Mesa de nogal', 'MES-001', categories[0]);
    const lamp = createProduct('Lámpara de pie', 'LAM-001', categories[1]);
    publicApi.response$ = of({
      unidad: { nombre: 'ISADECOR', slug: 'isadecor' },
      categorias: categories,
      productos: [furniture, lamp],
    });
    facade.load();

    facade.setSelectedCategory(categories[1].slug);

    expect(facade.filteredProducts()).toEqual([lamp]);
  });

  it('filters products by category name case-insensitively and resolves to slug', () => {
    const furniture = createProduct('Mesa de nogal', 'MES-001', categories[0]);
    const lamp = createProduct('Lámpara de pie', 'LAM-001', categories[1]);
    publicApi.response$ = of({
      unidad: { nombre: 'ISADECOR', slug: 'isadecor' },
      categorias: categories,
      productos: [furniture, lamp],
    });
    facade.load();

    facade.setSelectedCategory('ILUMINACIÓN');

    expect(facade.selectedCategory()).toBe(categories[1].slug);
    expect(facade.filteredProducts()).toEqual([lamp]);
  });

  it('searches textual product fields ignoring case and repeated spaces', () => {
    const furniture = createProduct('Mesa de nogal', 'MES-001', categories[0]);
    const lamp = createProduct('Lámpara de pie', 'LAM-001', categories[1]);
    publicApi.response$ = of({
      unidad: { nombre: 'ISADECOR', slug: 'isadecor' },
      categorias: categories,
      productos: [furniture, lamp],
    });
    facade.load();

    facade.setSearchTerm('  MESA   DE nogal  ');

    expect(facade.filteredProducts()).toEqual([furniture]);
  });

  it('exposes an understandable error when request fails', () => {
    publicApi.response$ = throwError(() => new Error('Network error'));

    facade.load();

    expect(facade.products()).toEqual([]);
    expect(facade.loading()).toBe(false);
    expect(facade.error()).toContain('No pudimos cargar el catálogo');
  });

  it('preserves canonical backend order when sort option is featured', () => {
    const first = createProduct('Zócalo de aluminio', 'ZOC-01', categories[0]);
    const second = createProduct('Alféizar moderno', 'ALF-01', categories[0]);
    publicApi.response$ = of({
      unidad: { nombre: 'ISADECOR', slug: 'isadecor' },
      categorias: categories,
      productos: [first, second],
    });
    facade.load();

    facade.setSortOption('featured');
    expect(facade.filteredProducts()[0].slug).toBe('zocalo-de-aluminio');
    expect(facade.filteredProducts()[1].slug).toBe('alfeizar-moderno');
  });

  it('sorts products by price ascending and descending', () => {
    const cheap = {
      ...createProduct('Panel Económico', 'PAN-01', categories[0]),
      precioBase: 50,
    };
    const expensive = {
      ...createProduct('Mármol Importado', 'MAR-01', categories[0]),
      precioBase: 250,
    };
    publicApi.response$ = of({
      unidad: { nombre: 'ISADECOR', slug: 'isadecor' },
      categorias: categories,
      productos: [expensive, cheap],
    });
    facade.load();

    facade.setSortOption('price-asc');
    expect(facade.filteredProducts()[0].slug).toBe('panel-economico');
    expect(facade.filteredProducts()[1].slug).toBe('marmol-importado');

    facade.setSortOption('price-desc');
    expect(facade.filteredProducts()[0].slug).toBe('marmol-importado');
    expect(facade.filteredProducts()[1].slug).toBe('panel-economico');
  });

  it('filters products by discount and stock toggles', () => {
    const discounted = {
      ...createProduct('Panel Oferta', 'PAN-01', categories[0]),
      descuentoPorcentaje: 20,
      disponibilidad: ProductAvailability.DISPONIBLE,
    };
    const outOfStock = {
      ...createProduct('Panel Agotado', 'PAN-02', categories[0]),
      descuentoPorcentaje: null,
      disponibilidad: ProductAvailability.AGOTADO,
    };
    publicApi.response$ = of({
      unidad: { nombre: 'ISADECOR', slug: 'isadecor' },
      categorias: categories,
      productos: [discounted, outOfStock],
    });
    facade.load();

    facade.toggleOnlyDiscount();
    expect(facade.filteredProducts()).toEqual([discounted]);

    facade.toggleOnlyDiscount();
    facade.toggleOnlyInStock();
    expect(facade.filteredProducts()).toEqual([discounted]);
  });

  it('computes category product counts correctly by category slug', () => {
    const p1 = createProduct('Panel A', 'PAN-01', categories[0]);
    const p2 = createProduct('Lámpara B', 'LAM-01', categories[1]);
    publicApi.response$ = of({
      unidad: { nombre: 'ISADECOR', slug: 'isadecor' },
      categorias: categories,
      productos: [p1, p2],
    });
    facade.load();

    expect(facade.getCategoryCount(categories[0].slug)).toBe(1);
    expect(facade.getCategoryCount(categories[1].slug)).toBe(1);
    expect(facade.getCategoryCount('non-existent')).toBe(0);
  });

  it('resets all filters, toggles and sort option on clearFilters()', () => {
    facade.setSelectedCategory('mobiliario');
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
