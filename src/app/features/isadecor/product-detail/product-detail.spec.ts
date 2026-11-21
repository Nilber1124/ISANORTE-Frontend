import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { ProductDetail } from './product-detail';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { PublicProductDetailResponse } from '../../../data/models/public-content/public-product-detail.model';
import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { PublicSiteFacade } from '../../../layouts/public-layout/public-site.facade';

const siteStub = {
  whatsappHrefFor: (message: string) =>
    `https://wa.me/51999888777?text=${encodeURIComponent(message)}`,
};

describe('ProductDetail integration', () => {
  afterEach(() => localStorage.clear());

  it('offers buying and quotation together and hides the comparison tools', async () => {
    const product: PublicProductDetailResponse = {
      sku: 'MESA-1',
      slug: 'mesa',
      modalidad: 'AMBAS',
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
        provideHttpClient(),
        { provide: PublicSiteFacade, useValue: siteStub },
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
    await harness.navigateByUrl('/isadecor/productos/mesa', ProductDetail);
    await harness.fixture.whenStable();
    harness.detectChanges();
    const root = harness.routeNativeElement!;
    expect(root.textContent).toContain('Descripción de la mesa existente.');
    const quote = [...root.querySelectorAll('a')].find((link) =>
      link.textContent?.includes('Cotizar por WhatsApp'),
    );
    expect(quote?.getAttribute('href')).toContain('https://wa.me/51999888777?text=');
    expect(decodeURIComponent(quote?.getAttribute('href') ?? '')).toContain('Mesa ISADECOR');
    expect(
      [...root.querySelectorAll('a')].some((link) =>
        link.getAttribute('href')?.includes('/isadecor/cotizacion'),
      ),
    ).toBe(false);
    expect(root.querySelector('app-product-price-comparison')).toBeNull();
    expect(root.querySelector('app-product-competitor-comparison')).toBeNull();
    expect(root.querySelector('.purchase-action button')?.textContent?.trim()).toBe(
      'Agregar al carrito',
    );
    expect(root.textContent).not.toContain('Comprar ahora');
    expect(root.textContent).toContain('Descripción de la mesa existente.');
  });

  async function renderHarness(overrides: Partial<PublicProductDetailResponse>) {
    const product = {
      sku: 'MESA-1',
      slug: 'mesa',
      modalidad: 'AMBAS',
      nombre: 'Mesa ISADECOR',
      resumen: null,
      descripcion: 'Descripción',
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
      ...overrides,
    } as PublicProductDetailResponse;
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        { provide: PublicSiteFacade, useValue: siteStub },
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
    await harness.navigateByUrl('/isadecor/productos/mesa', ProductDetail);
    await harness.fixture.whenStable();
    harness.detectChanges();
    return harness;
  }

  async function render(overrides: Partial<PublicProductDetailResponse>) {
    return (await renderHarness(overrides)).routeNativeElement as HTMLElement;
  }

  const actions = (root: HTMLElement) =>
    [...root.querySelectorAll('.purchase-action button, .purchase-action a, a')]
      .map((el) => el.textContent?.trim())
      .filter((text) => /Agregar al carrito|Cotizar/.test(text ?? ''));

  it('lets a product with both modes be bought or quoted', async () => {
    const root = await render({ modalidad: 'AMBAS' });

    expect(actions(root)).toContain('Agregar al carrito');
    expect(actions(root)).toContain('Cotizar por WhatsApp');
    expect(root.textContent).not.toContain('Desde');
  });

  it('hides quotation for a product restricted to direct purchase', async () => {
    const root = await render({ modalidad: 'COMPRAR' });

    expect(actions(root)).toContain('Agregar al carrito');
    expect(actions(root)).not.toContain('Cotizar por WhatsApp');
  });

  it('offers only «Cotizar por WhatsApp» (with a «Desde» price) for a quote-only product', async () => {
    const root = await render({ modalidad: 'COTIZAR' });

    expect(actions(root)).toContain('Cotizar por WhatsApp');
    expect(actions(root)).not.toContain('Agregar al carrito');
    expect(root.textContent).toContain('Desde');
  });

  it('keeps quotation available when the product is sold out or has no price', async () => {
    const soldOut = await render({ disponibilidad: ProductAvailability.AGOTADO });
    expect(actions(soldOut)).toContain('Cotizar reposición por WhatsApp');
    expect(actions(soldOut)).not.toContain('Agregar al carrito');
  });

  it('shows bullets, the specification table, documents, delivery details and the collection breadcrumb', async () => {
    const root = await render({
      descripcion: 'Resumen del producto.\n\n- Primera ventaja\n- Segunda ventaja',
      categorias: [{ nombre: 'Pisos', slug: 'pisos' }],
      plazoEntrega: 'Llega en 3 a 5 días',
      retiroEnTienda: true,
      especificaciones: [
        { clave: 'Espesor', valor: '5 mm', grupo: 'Medidas', orden: 0 },
        { clave: 'Material', valor: 'SPC', grupo: 'Material y uso', orden: 1 },
      ],
      documentos: [
        {
          titulo: 'Ficha técnica',
          url: 'https://cdn/ficha.pdf',
          tipo: 'FICHA_TECNICA',
          formato: 'pdf',
          tamanoBytes: 2048,
        },
      ],
    } as Partial<PublicProductDetailResponse>);

    const details = root.querySelector('.product-details') as HTMLElement;
    expect(
      [...details.querySelectorAll('ul.list-disc li')].map((li) => li.textContent?.trim()),
    ).toEqual(['Primera ventaja', 'Segunda ventaja']);
    expect(details.querySelectorAll('dl > div')).toHaveLength(2);
    expect(details.textContent).toContain('Espesor');
    expect(details.querySelector('details')).toBeTruthy();
    expect(details.querySelector('a[href="https://cdn/ficha.pdf"]')).toBeTruthy();
    expect(root.querySelector('ul[aria-label="Entrega e instalación"]')?.textContent).toContain(
      'Llega en 3 a 5 días',
    );
    expect(root.querySelector('ul[aria-label="Entrega e instalación"]')?.textContent).toContain(
      'Retiro en tienda',
    );
    expect(root.querySelector('nav[aria-label="Migas de pan"]')?.textContent).toContain('Pisos');
  });

  it('collapses a long description until «Mostrar más» is pressed', async () => {
    const harness = await renderHarness({ descripcion: 'Texto largo. '.repeat(80) });
    const root = harness.routeNativeElement as HTMLElement;
    const block = root.querySelector('.product-description') as HTMLElement;

    expect(block.classList.contains('is-collapsed')).toBe(true);
    const toggle = [...root.querySelectorAll('button')].find((b) =>
      b.textContent?.includes('Mostrar más'),
    )!;
    toggle.click();
    harness.detectChanges();
    expect(block.classList.contains('is-collapsed')).toBe(false);
  });

  it('changes the quantity with the − and + buttons and never goes below one', async () => {
    const harness = await renderHarness({});
    const root = harness.routeNativeElement as HTMLElement;
    const input = root.querySelector('#product-quantity') as HTMLInputElement;
    const plus = root.querySelector('button[aria-label="Aumentar cantidad"]') as HTMLButtonElement;
    const minus = root.querySelector(
      'button[aria-label="Disminuir cantidad"]',
    ) as HTMLButtonElement;

    expect(minus.disabled).toBe(true);
    plus.click();
    plus.click();
    harness.detectChanges();
    expect(input.value).toBe('3');
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
        provideHttpClient(),
        { provide: PublicSiteFacade, useValue: siteStub },
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

  it('preselects the first in-stock finish and quotes the selected variant by WhatsApp at the calculated quantity', async () => {
    const product: PublicProductDetailResponse = {
      sku: 'PANEL-1',
      slug: 'panel-acustico',
      modalidad: 'COTIZAR',
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
          sku: 'PANEL-ROBLE',
          nombre: 'Roble',
          descripcion: null,
          precio: null,
          disponible: true,
          agotado: true,
          imagenUrl: null,
          orden: 0,
        },
        {
          sku: 'PANEL-NOGAL',
          nombre: 'Nogal',
          descripcion: null,
          precio: 95,
          disponible: true,
          imagenUrl: null,
          orden: 0,
        },
        {
          sku: 'PANEL-CENIZA',
          nombre: 'Ceniza',
          descripcion: null,
          precio: 102,
          disponible: true,
          imagenUrl: '/ceniza.webp',
          orden: 2,
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
        provideHttpClient(),
        { provide: PublicSiteFacade, useValue: siteStub },
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
    expect(root.querySelector<HTMLInputElement>('input[value="PANEL-ROBLE"]')?.disabled).toBe(true);
    expect(root.querySelector<HTMLInputElement>('input[value="PANEL-NOGAL"]')?.checked).toBe(true);
    expect(root.textContent).toContain('95.00');
    root.querySelector<HTMLInputElement>('input[value="PANEL-CENIZA"]')?.click();
    harness.detectChanges();
    expect(root.querySelector('app-product-gallery img')?.getAttribute('src')).toBe('/ceniza.webp');
    expect(root.textContent).toContain('102.00');

    expect(root.textContent).not.toContain('Agregar al carrito');

    const measurement = root.querySelector('#product-calculator-measurement') as HTMLInputElement;
    measurement.value = '5';
    measurement.dispatchEvent(new Event('input'));
    harness.detectChanges();

    const quote = [...root.querySelectorAll('a')].find((link) =>
      link.textContent?.includes('Cotizar por WhatsApp'),
    );
    const message = decodeURIComponent(quote?.getAttribute('href') ?? '');
    expect(message).toContain('Panel acústico (Ceniza): 3');
  });
});
