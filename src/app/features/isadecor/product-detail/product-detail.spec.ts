import { TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { By, Meta, Title } from '@angular/platform-browser';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { ProductDetail } from './product-detail';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { PublicProductDetailResponse } from '../../../data/models/public-content/public-product-detail.model';
import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { IsadecorQuoteCartService } from '../../../core/services/isadecor-quote-cart.service';

describe('ProductDetail integration', () => {
  afterEach(() => localStorage.clear());

  it('preserves detail and quote navigation without a public price comparator', async () => {
    const product: PublicProductDetailResponse = {
      sku: 'MESA-1',
      slug: 'mesa',
      nombre: 'Mesa ISADECOR',
      resumen: null,
      descripcion: 'Descripción de la mesa existente.',
      tituloSeo: null,
      descripcionSeo: null,
      precioBase: 850,
      precioAnterior: null,
      descuentoPorcentaje: null,
      disponibilidad: ProductAvailability.DISPONIBLE,
      retiroEnTienda: true,
      categorias: [],
      variantes: [],
      imagenes: [],
      especificaciones: [],
      documentos: [],
      configuracionCalculo: null,
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'isadecor/productos/:slug', component: ProductDetail }]),
        {
          provide: PublicContentApiService,
          useValue: {
            getProductDetail: () => of(product),
            getRecommendedProducts: () => of([]),
            getProductReviews: () => of([]),
            getProductReviewSummary: () => of({ promedio: 0, total: 0, distribucion: [] }),
            compareProductPrice: () => {
              calls++;
              return of(comparison);
            },
          },
        },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/isadecor/productos/mesa', ProductDetail);
    await harness.fixture.whenStable();
    harness.detectChanges();
    const root = harness.routeNativeElement!;
    expect(root.textContent).toContain('Descripción de la mesa existente.');
    expect(
      harness.fixture.debugElement
        .queryAll(By.directive(RouterLink))
        .some(
          (link) =>
            link.injector.get(RouterLink).urlTree?.toString() ===
            '/isadecor/cotizacion?producto=mesa',
        ),
    ).toBe(true);
    expect(root.querySelector('app-product-price-comparison')).toBeNull();
    expect(root.querySelector('app-product-competitor-comparison')).toBeNull();
    expect(root.textContent).toContain('Descripción de la mesa existente.');
  });

  it('applies product SEO tags upon route activation', async () => {
    const product: PublicProductDetailResponse = {
      sku: 'MESA-1',
      slug: 'mesa',
      nombre: 'Mesa ISADECOR',
      resumen: null,
      descripcion: 'Descripción de la mesa existente.',
      tituloSeo: 'Mesa Comedor | ISADECOR',
      descripcionSeo: 'Mesa de comedor SEO.',
      precioBase: 850,
      precioAnterior: null,
      descuentoPorcentaje: null,
      disponibilidad: ProductAvailability.DISPONIBLE,
      retiroEnTienda: true,
      categorias: [],
      variantes: [],
      imagenes: [
        { url: 'https://cdn.isadecor.pe/mesa.jpg', alt: 'Mesa', esPrincipal: true, orden: 0 },
      ],
      especificaciones: [],
      documentos: [],
      configuracionCalculo: null,
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'isadecor/productos/:slug', component: ProductDetail }]),
        {
          provide: PublicContentApiService,
          useValue: {
            getProductDetail: () => of(product),
            getRecommendedProducts: () => of([]),
            getProductReviews: () => of([]),
            getProductReviewSummary: () => of({ promedio: 0, total: 0, distribucion: [] }),
          },
        },
      ],
    });
    const harness = await RouterTestingHarness.create();
    const titleService = TestBed.inject(Title);
    const metaService = TestBed.inject(Meta);

    await harness.navigateByUrl('/isadecor/productos/mesa', ProductDetail);
    await harness.fixture.whenStable();

    expect(titleService.getTitle()).toBe('Mesa Comedor | ISADECOR');
    expect(metaService.getTag('name="description"')?.content).toBe('Mesa de comedor SEO.');
    expect(metaService.getTag('name="robots"')?.content).toBe('index, follow');
    expect(metaService.getTag('property="og:title"')?.content).toBe('Mesa Comedor | ISADECOR');
    expect(metaService.getTag('property="og:description"')?.content).toBe('Mesa de comedor SEO.');
    expect(metaService.getTag('property="og:image"')?.content).toBe(
      'https://cdn.isadecor.pe/mesa.jpg',
    );
  });

  it('adds the selected variant using the quantity produced by the material calculator', async () => {
    const product: PublicProductDetailResponse = {
      sku: 'PANEL-1',
      slug: 'panel-acustico',
      nombre: 'Panel acústico',
      resumen: null,
      descripcion: 'Panel decorativo acústico.',
      tituloSeo: null,
      descripcionSeo: null,
      precioBase: 80,
      precioAnterior: null,
      descuentoPorcentaje: null,
      disponibilidad: ProductAvailability.DISPONIBLE,
      retiroEnTienda: true,
      categorias: [],
      variantes: [
        {
          sku: 'PANEL-NOGAL',
          nombre: 'Nogal',
          descripcion: null,
          precio: 95,
          disponible: true,
          imagenUrl: null,
          orden: 0,
        },
      ],
      imagenes: [],
      especificaciones: [],
      documentos: [],
      configuracionCalculo: {
        habilitada: true,
        etiquetaEntrada: 'Área',
        unidadEntrada: 'm²',
        coberturaPorUnidad: 2,
        unidadVenta: 'paneles',
        textoAyuda: null,
      },
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'isadecor/productos/:slug', component: ProductDetail }]),
        {
          provide: PublicContentApiService,
          useValue: {
            getProductDetail: () => of(product),
            getRecommendedProducts: () => of([]),
            getProductReviews: () => of([]),
            getProductReviewSummary: () => of({ promedio: 0, total: 0, distribucion: [] }),
          },
        },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/isadecor/productos/panel-acustico', ProductDetail);
    await harness.fixture.whenStable();
    harness.detectChanges();
    const root = harness.routeNativeElement!;
    const variantButton = [...root.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Nogal'),
    ) as HTMLButtonElement;
    variantButton.click();

    const measurement = root.querySelector('#product-calculator-measurement') as HTMLInputElement;
    measurement.value = '5';
    measurement.dispatchEvent(new Event('input'));
    harness.detectChanges();

    const addButton = [...root.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Agregar al carrito'),
    ) as HTMLButtonElement;
    addButton.click();

    const cart = TestBed.inject(IsadecorQuoteCartService);
    expect(cart.items()).toHaveLength(1);
    expect(cart.items()[0].variant?.sku).toBe('PANEL-NOGAL');
    expect(cart.items()[0].quantity).toBe(3);
  });
});
