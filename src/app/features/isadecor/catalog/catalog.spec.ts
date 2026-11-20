import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { of } from 'rxjs';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { Catalog } from './catalog';

describe('Catalog URL filters', () => {
  it('reads shareable filters and removes the selected chip from the URL', async () => {
    const getProductCatalog = vi.fn(() =>
      of({
        unidad: { nombre: 'ISADECOR', slug: 'isadecor' },
        categorias: [],
        productos: { contenido: [], pagina: 0, tamano: 12, totalElementos: 0, totalPaginas: 0 },
        precioMinimo: 20,
        precioMaximo: 150,
      }),
    );
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'isadecor/productos', component: Catalog }]),
        { provide: PublicContentApiService, useValue: { getProductCatalog } },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/isadecor/productos?modalidad=COTIZAR&acabado=Nogal', Catalog);
    await harness.fixture.whenStable();
    harness.detectChanges();

    const chip = harness.routeNativeElement?.querySelector<HTMLButtonElement>(
      '[aria-label="Quitar filtro Nogal"]',
    );
    expect(chip).toBeTruthy();
    expect(getProductCatalog).toHaveBeenCalledWith(
      'isanorte',
      'isadecor',
      expect.objectContaining({
        modalidad: 'COTIZAR',
        acabado: 'Nogal',
      }),
    );

    chip?.click();
    await harness.fixture.whenStable();
    expect(TestBed.inject(Router).url).toBe('/isadecor/productos?modalidad=COTIZAR');
  });

  async function open(url: string) {
    const getProductCatalog = vi.fn(() =>
      of({
        unidad: { nombre: 'ISADECOR', slug: 'isadecor' },
        categorias: [
          { nombre: 'Pisos', slug: 'pisos', cantidad: 2, imagenUrl: 'https://img/pisos.webp' },
          { nombre: 'Techos', slug: 'techos', cantidad: 1, imagenUrl: null },
        ],
        productos: { contenido: [], pagina: 0, tamano: 12, totalElementos: 0, totalPaginas: 0 },
        precioMinimo: 26.9,
        precioMaximo: 142,
        acabados: [
          { nombre: 'Blanco', colorHex: '#f4f4f2', cantidad: 5 },
          { nombre: 'Nogal', colorHex: '#5c3d2a', cantidad: 3 },
        ],
      }),
    );
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: 'isadecor/productos', component: Catalog }]),
        { provide: PublicContentApiService, useValue: { getProductCatalog } },
      ],
    });
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl(url, Catalog);
    await harness.fixture.whenStable();
    harness.detectChanges();
    return { harness, getProductCatalog, root: harness.routeNativeElement as HTMLElement };
  }

  it('lets the visitor pick several collections and sends them as a list', async () => {
    const { harness, getProductCatalog, root } = await open('/isadecor/productos?categoria=pisos');

    root.querySelectorAll<HTMLButtonElement>('.catalog-collection')[1].click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/isadecor/productos?categoria=pisos,techos');
    expect(getProductCatalog).toHaveBeenLastCalledWith(
      'isanorte',
      'isadecor',
      expect.objectContaining({ categoria: 'pisos,techos' }),
    );
  });

  it('removes only one collection when its chip is closed', async () => {
    const { harness, root } = await open('/isadecor/productos?categoria=pisos,techos');

    root
      .querySelector<HTMLButtonElement>('.catalog-active [aria-label="Quitar filtro Pisos"]')
      ?.click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/isadecor/productos?categoria=techos');
  });

  it('toggles finishes from the colour swatches and shows the real finish list', async () => {
    const { harness, root } = await open('/isadecor/productos');
    const finishes = root.querySelectorAll<HTMLButtonElement>('.catalog-sidebar .catalog-finish');

    expect(finishes.length).toBe(2);
    finishes[1].click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/isadecor/productos?acabado=Nogal');
  });

  it('offers quick price ranges inside the published range and applies them at once', async () => {
    const { harness, root } = await open('/isadecor/productos');
    const labels = [...root.querySelectorAll('.catalog-sidebar .catalog-prices label')].map(
      (label) => label.textContent?.trim(),
    );

    expect(labels).toEqual(['Hasta S/ 50', 'S/ 50 – S/ 100', 'S/ 100 – S/ 250']);
    root.querySelectorAll<HTMLInputElement>('.catalog-sidebar .catalog-prices input')[1].click();
    await harness.fixture.whenStable();

    expect(TestBed.inject(Router).url).toBe('/isadecor/productos?precioMin=50&precioMax=100');
  });

  it('uses the collection name as heading when only one is selected', async () => {
    const { root } = await open('/isadecor/productos?categoria=techos');

    expect(root.querySelector('h1')?.textContent?.trim()).toBe('Techos');
  });
});
