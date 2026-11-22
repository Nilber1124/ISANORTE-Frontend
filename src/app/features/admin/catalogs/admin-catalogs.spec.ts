import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { BusinessUnitResponse } from '../../../data/models/business-unit/business-unit-response.model';
import { AdminBusinessUnitsFacade } from '../business-units/admin-business-units.facade';
import { AdminCatalogs } from './admin-catalogs';

const unit = (slug: string, catalogos: unknown[] = []): BusinessUnitResponse =>
  ({ id: slug, slug, nombre: slug.toUpperCase(), catalogos }) as unknown as BusinessUnitResponse;

class FacadeStub {
  readonly businessUnits = signal<readonly BusinessUnitResponse[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly managedCatalogUnit = signal<BusinessUnitResponse | null>(null);
  readonly childSaving = signal(false);
  opened: string[] = [];
  load(): void {}
  openCatalogos(u: BusinessUnitResponse): void { this.opened.push(u.slug); this.managedCatalogUnit.set(u); }
  closeCatalogos(): void { this.managedCatalogUnit.set(null); }
  saveCatalogo(): void {}
  deleteCatalogo(): void {}
}

describe('AdminCatalogs', () => {
  let facade: FacadeStub;

  function render(units: BusinessUnitResponse[]) {
    TestBed.configureTestingModule({}).overrideComponent(AdminCatalogs, {
      set: { providers: [{ provide: AdminBusinessUnitsFacade, useValue: (facade = new FacadeStub()) }] },
    });
    const fixture = TestBed.createComponent(AdminCatalogs);
    facade.businessUnits.set(units);
    fixture.detectChanges();
    return fixture.nativeElement as HTMLElement;
  }

  it('lists the ISADECOR catalogs with a link to each PDF', () => {
    const el = render([
      unit('isanorte'),
      unit('isadecor', [
        { id: 'c1', titulo: 'Pisos', imagenPortadaUrl: '/p.webp', archivoUrl: 'https://x/pisos.pdf', orden: 0, activo: true },
        { id: 'c2', titulo: 'Techos', imagenPortadaUrl: '', archivoUrl: 'https://x/techos.pdf', orden: 1, activo: false },
      ]),
    ]);
    expect(el.querySelectorAll('[data-catalog-item]')).toHaveLength(2);
    expect(el.textContent).toContain('Pisos');
    expect(el.textContent).toContain('Oculto');
  });

  it('opens the shared catalog manager for ISADECOR, not for another unit', () => {
    const el = render([unit('isanorte'), unit('isadecor')]);
    const button = Array.from(el.querySelectorAll('button')).find((b) => b.textContent?.includes('Agregar')) as HTMLButtonElement;
    button.click();
    expect(facade.opened).toEqual(['isadecor']);
  });

  it('warns when the ISADECOR unit does not exist', () => {
    const el = render([unit('isanorte')]);
    expect(el.textContent).toContain('No encontramos la unidad ISADECOR');
  });
});
