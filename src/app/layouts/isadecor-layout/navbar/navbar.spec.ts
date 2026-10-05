import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { PublicProductCatalogResponse } from '../../../data/models/public-content/public-product-catalog.model';
import { PublicProductDetailResponse } from '../../../data/models/public-content/public-product-detail.model';
import { IsadecorQuoteCartService } from '../../../core/services/isadecor-quote-cart.service';
import { Navbar } from './navbar';

const mockCatalog: PublicProductCatalogResponse = {
  unidad: { nombre: 'ISADECOR', slug: 'isadecor' },
  categorias: [
    { nombre: 'Wall Panels', slug: 'wall-panels' },
    { nombre: 'Pisos', slug: 'pisos' },
  ],
  productos: [],
};

describe('Isadecor Navbar', () => {
  afterEach(() => localStorage.clear());

  it('loads and maps active categories for ISADECOR automatically from public catalog', () => {
    TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });

    const fixture = TestBed.createComponent(Navbar);
    const component = fixture.componentInstance;
    const http = TestBed.inject(HttpTestingController);

    component.loadCategories();

    const req = http.expectOne('/api/publico/sitios/isanorte/unidades/isadecor/catalogo');
    expect(req.request.method).toBe('GET');
    req.flush(mockCatalog);

    expect(component.dynamicCategories().length).toBe(2);
    expect(component.dynamicCategories()[0].label).toBe('Wall Panels');
    expect(component.dynamicCategories()[0].queryParams).toEqual({ categoria: 'wall-panels' });
    expect(component.dynamicCategories()[1].label).toBe('Pisos');
    expect(component.dynamicCategories()[1].queryParams).toEqual({ categoria: 'pisos' });
    expect(component.loadingCategories()).toBe(false);

    const productsLink = component.links().find((link) => link.label === 'Productos');
    expect(productsLink?.children?.length).toBe(2);
  });

  it('handles load failure cleanly without remaining in infinite loading state', () => {
    TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });

    const fixture = TestBed.createComponent(Navbar);
    const component = fixture.componentInstance;
    const http = TestBed.inject(HttpTestingController);

    fixture.detectChanges();

    const req = http.expectOne('/api/publico/sitios/isanorte/unidades/isadecor/catalogo');
    req.flush('Server Error', { status: 500, statusText: 'Server Error' });
    fixture.detectChanges();

    expect(component.dynamicCategories().length).toBe(0);
    expect(component.loadingCategories()).toBe(false);

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).not.toContain('Cargando categorías...');
    expect(element.textContent).toContain('No hay categorías disponibles');
  });

  it('manages products dropdown open and close states', () => {
    TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });

    const fixture = TestBed.createComponent(Navbar);
    const component = fixture.componentInstance;

    expect(component.productsDropdownOpen()).toBe(false);

    component.toggleProductsDropdown();
    expect(component.productsDropdownOpen()).toBe(true);

    component.closeProductsDropdown();
    expect(component.productsDropdownOpen()).toBe(false);
  });

  it('links to the cart and displays its total quantity', () => {
    TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });
    const fixture = TestBed.createComponent(Navbar);
    const cart = TestBed.inject(IsadecorQuoteCartService);
    const product: PublicProductDetailResponse = {
      nombre: 'Panel',
      sku: 'P-1',
      slug: 'panel',
      resumen: null,
      descripcion: 'Panel',
      tituloSeo: null,
      descripcionSeo: null,
      precioBase: null,
      precioAnterior: null,
      descuentoPorcentaje: null,
      disponibilidad: ProductAvailability.DISPONIBLE,
      retiroEnTienda: true,
      categorias: [],
      imagenes: [],
      variantes: [],
      especificaciones: [],
      documentos: [],
      configuracionCalculo: null,
    };

    cart.addProduct(product, null, 3);
    fixture.detectChanges();

    const link = fixture.nativeElement.querySelector(
      'a[href="/isadecor/carrito"]',
    ) as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.textContent).toContain('3');
    expect(link.getAttribute('aria-label')).toContain('3 productos');
  });
});
