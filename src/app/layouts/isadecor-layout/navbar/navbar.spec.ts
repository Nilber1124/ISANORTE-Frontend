import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CategoryResponse } from '../../../data/models/category/category-response.model';
import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { PublicProductDetailResponse } from '../../../data/models/public-content/public-product-detail.model';
import { IsadecorQuoteCartService } from '../../../core/services/isadecor-quote-cart.service';
import { Navbar } from './navbar';

const mockCategories: CategoryResponse[] = [
  {
    id: 'cat-2',
    nombre: 'Pisos',
    slug: 'pisos',
    descripcion: null,
    imagenUrl: null,
    activo: true,
    orden: 2,
    unidadNegocio: { id: 'u-1', nombre: 'ISADECOR', slug: 'isadecor' },
    fechaCreacion: null,
    fechaActualizacion: null,
  },
  {
    id: 'cat-1',
    nombre: 'Wall Panels',
    slug: 'wall-panels',
    descripcion: null,
    imagenUrl: null,
    activo: true,
    orden: 1,
    unidadNegocio: { id: 'u-1', nombre: 'ISADECOR', slug: 'isadecor' },
    fechaCreacion: null,
    fechaActualizacion: null,
  },
  {
    id: 'cat-other',
    nombre: 'Servicios de Construcción',
    slug: 'servicios-construccion',
    descripcion: null,
    imagenUrl: null,
    activo: true,
    orden: 3,
    unidadNegocio: { id: 'u-2', nombre: 'ISANORTE', slug: 'isanorte' },
    fechaCreacion: null,
    fechaActualizacion: null,
  },
];

describe('Isadecor Navbar', () => {
  afterEach(() => localStorage.clear());

  it('loads and filters active categories for ISADECOR automatically', () => {
    TestBed.configureTestingModule({
      imports: [Navbar],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    });

    const fixture = TestBed.createComponent(Navbar);
    const component = fixture.componentInstance;
    const http = TestBed.inject(HttpTestingController);

    component.loadCategories();

    const req = http.expectOne('/api/categorias/activas');
    expect(req.request.method).toBe('GET');
    req.flush(mockCategories);

    expect(component.dynamicCategories().length).toBe(2);
    expect(component.dynamicCategories()[0].label).toBe('Wall Panels');
    expect(component.dynamicCategories()[0].queryParams).toEqual({ categoria: 'wall-panels' });
    expect(component.dynamicCategories()[1].label).toBe('Pisos');
    expect(component.dynamicCategories()[1].queryParams).toEqual({ categoria: 'pisos' });

    const productsLink = component.links().find((link) => link.label === 'Productos');
    expect(productsLink?.children?.length).toBe(2);
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
