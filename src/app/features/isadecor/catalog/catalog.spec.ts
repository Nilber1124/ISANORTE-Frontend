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
});
