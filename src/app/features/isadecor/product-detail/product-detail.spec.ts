import { TestBed } from '@angular/core/testing';
import { provideRouter, RouterLink } from '@angular/router';
import { By } from '@angular/platform-browser';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { ProductDetail } from './product-detail';
import { ProductApiService } from '../../../data/services/product-api.service';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { ProductResponse } from '../../../data/models/product/product-response.model';
import { ProductPriceComparisonResponse } from '../../../data/models/product/product-price-comparison-response.model';
import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { ProductPublicationStatus } from '../../../data/models/product/product-publication-status.enum';

const comparison: ProductPriceComparisonResponse = {
  producto: 'Mesa',
  urlExterna: 'https://tienda.example/mesa',
  dominioExterno: 'tienda.example',
  nombreProductoExterno: 'Mesa externa',
  precioInterno: 850,
  precioExterno: 920,
  monedaInterna: 'PEN',
  monedaExterna: 'PEN',
  diferencia: 70,
  porcentajeDiferencia: 8.24,
  comparable: true,
  estado: 'SUCCESS',
  mensaje: 'ISADECOR tiene un precio S/ 70.00 menor.',
  fechaConsulta: '2026-09-22T12:00:00Z',
};

describe('ProductDetail price comparison integration', () => {
  it('preserves detail and quote navigation, and compares only after the form is submitted', async () => {
    const product: ProductResponse = {
      id: 'mesa-id',
      sku: 'MESA-1',
      slug: 'mesa',
      nombre: 'Mesa ISADECOR',
      resumen: null,
      descripcion: 'Descripción de la mesa existente.',
      precioBase: 850,
      precioAnterior: null,
      descuentoPorcentaje: null,
      disponibilidad: ProductAvailability.DISPONIBLE,
      destacado: false,
      estado: ProductPublicationStatus.PUBLICADO,
      tituloSeo: null,
      descripcionSeo: null,
      unidadNegocio: { id: 'unidad', nombre: 'ISADECOR', slug: 'isadecor' },
      categorias: [],
      variantes: [],
      imagenes: [],
      especificaciones: [],
      documentos: [],
      configuracionCalculo: null,
      fechaCreacion: null,
      fechaActualizacion: null,
    };
    let calls = 0;
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'isadecor/productos/:slug', component: ProductDetail }]),
        { provide: ProductApiService, useValue: { getPublishedBySlug: () => of(product) } },
        {
          provide: PublicContentApiService,
          useValue: {
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
    expect(harness.fixture.debugElement.queryAll(By.directive(RouterLink)).some((link) =>
      link.injector.get(RouterLink).urlTree?.toString() === '/isadecor/cotizacion?producto=mesa',
    )).toBe(true);
    expect(calls).toBe(0);
    const section = root.querySelector('app-product-price-comparison')!;
    const input = section.querySelector('input')!;
    input.value = 'https://tienda.example/mesa';
    input.dispatchEvent(new Event('input'));
    section.querySelector('form')!.dispatchEvent(new Event('submit', { cancelable: true }));
    harness.detectChanges();
    expect(calls).toBe(1);
    expect(section.textContent).toContain('ISADECOR tiene un precio S/ 70.00 menor.');
    expect(root.textContent).toContain('Descripción de la mesa existente.');
  });
});
