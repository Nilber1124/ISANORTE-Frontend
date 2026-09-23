import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { IsadecorQuoteCartService } from '../../../core/services/isadecor-quote-cart.service';
import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { PublicProductDetailResponse } from '../../../data/models/public-content/public-product-detail.model';
import { PublicSiteCompany } from '../../../data/models/public-content/public-site.model';
import { PublicSiteFacade } from '../../../layouts/public-layout/public-site.facade';
import { Cart } from './cart';

const company = signal<PublicSiteCompany>({
  nombreComercial: 'ISANORTE',
  direccion: null,
  ciudad: null,
  telefono: null,
  telefonoSecundario: null,
  email: null,
  emailVentas: null,
  whatsapp: '+51 999 888 777',
  horarioAtencion: null,
  resumenNosotros: null,
});

const product: PublicProductDetailResponse = {
  nombre: 'Panel WPC',
  sku: 'P-01',
  slug: 'panel-wpc',
  resumen: null,
  descripcion: 'Panel',
  tituloSeo: null,
  descripcionSeo: null,
  precioBase: 25,
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

describe('Isadecor Cart', () => {
  beforeEach(async () => {
    localStorage.clear();
    company.update((value) => ({ ...value, whatsapp: '+51 999 888 777' }));
    await TestBed.configureTestingModule({
      imports: [Cart],
      providers: [
        provideRouter([]),
        {
          provide: PublicSiteFacade,
          useValue: { company: company.asReadonly(), loading: signal(false).asReadonly() },
        },
      ],
    }).compileComponents();
  });

  afterEach(() => localStorage.clear());

  it('renders empty state and then allows quantity editing and removal', () => {
    const fixture = TestBed.createComponent(Cart);
    const cart = TestBed.inject(IsadecorQuoteCartService);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Tu carrito está vacío');

    cart.addProduct(product, null, 2);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input[type="number"]') as HTMLInputElement;
    expect(fixture.nativeElement.textContent).toContain('Panel WPC');
    expect(input.value).toBe('2');

    input.value = '4';
    input.dispatchEvent(new Event('change'));
    fixture.detectChanges();
    expect(cart.items()[0].quantity).toBe(4);

    const remove = [...fixture.nativeElement.querySelectorAll('button')].find((button: Element) =>
      button.textContent?.includes('Eliminar'),
    ) as HTMLButtonElement;
    remove.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Tu carrito está vacío');
  });

  it('uses the configured commercial number to open the generated WhatsApp request', () => {
    const fixture = TestBed.createComponent(Cart);
    const cart = TestBed.inject(IsadecorQuoteCartService);
    cart.addProduct(product, null, 2);
    const open = vi.spyOn(window, 'open').mockReturnValue({ opener: null } as Window);
    fixture.detectChanges();

    const button = [...fixture.nativeElement.querySelectorAll('button')].find((element: Element) =>
      element.textContent?.includes('Solicitar cotización por WhatsApp'),
    ) as HTMLButtonElement;
    button.click();

    expect(open).toHaveBeenCalledOnce();
    expect(open.mock.calls[0][0]).toContain('https://wa.me/51999888777?text=');
    expect(decodeURIComponent(String(open.mock.calls[0][0]))).toContain('Panel WPC');
    open.mockRestore();
  });

  it('disables WhatsApp and explains the missing commercial number', () => {
    company.update((value) => ({ ...value, whatsapp: null }));
    const fixture = TestBed.createComponent(Cart);
    TestBed.inject(IsadecorQuoteCartService).addProduct(product, null, 1);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('WhatsApp no disponible');
    const action = [...fixture.nativeElement.querySelectorAll('button')].find((element: Element) =>
      element.textContent?.includes('Solicitar cotización por WhatsApp'),
    ) as HTMLButtonElement;
    expect(action.disabled).toBe(true);
  });
});
