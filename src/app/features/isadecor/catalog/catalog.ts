import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Pagination } from '../../../shared/components/pagination/pagination';
import { toCatalogProductCard } from '../home/isadecor-home.mapper';
import { HomeProductTile } from '../home/product-tile/product-tile';
import { CatalogFacade, CatalogSortOption } from './catalog.facade';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Destacados' },
  { value: 'price-asc', label: 'Precio ↑' },
  { value: 'price-desc', label: 'Precio ↓' },
  { value: 'name-asc', label: 'Nombre' },
] as const;

function parsePrice(value: string | null): number | null {
  const number = Number(value);
  return value?.trim() && Number.isFinite(number) && number >= 0 ? number : null;
}

@Component({
  selector: 'app-isadecor-catalog',
  imports: [HomeProductTile, NgTemplateOutlet, Pagination],
  providers: [CatalogFacade],
  templateUrl: './catalog.html',
  styleUrl: './catalog.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Catalog {
  readonly facade = inject(CatalogFacade);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly sortOptions = SORT_OPTIONS;
  protected readonly skeletons = [0, 1, 2, 3, 4, 5, 6, 7];
  protected readonly cards = computed(() => this.facade.products().map(toCatalogProductCard));
  protected readonly chips = computed(() => {
    const facade = this.facade;
    const extra = facade.extra();
    const category = facade.selectedCategory();
    const label = facade.categories().find((item) => item.slug === category)?.nombre ?? category;
    const price = [
      extra.precioMin != null ? `desde S/ ${extra.precioMin}` : '',
      extra.precioMax != null ? `hasta S/ ${extra.precioMax}` : '',
    ]
      .filter(Boolean)
      .join(' · ');
    return [
      { label, params: { categoria: null } },
      { label: facade.searchTerm(), params: { q: null } },
      { label: extra.acabado, params: { acabado: null } },
      {
        label:
          extra.modalidad === 'COMPRAR'
            ? 'Comprar'
            : extra.modalidad === 'COTIZAR'
              ? 'Cotizar'
              : null,
        params: { modalidad: null },
      },
      { label: price, params: { precioMin: null, precioMax: null } },
      {
        label:
          extra.facilInstalacion == null
            ? null
            : extra.facilInstalacion
              ? 'Fácil de instalar'
              : 'Otros tipos de instalación',
        params: { facilInstalacion: null },
      },
      { label: facade.onlyDiscount() ? 'En oferta' : null, params: { soloDescuento: null } },
      { label: facade.onlyInStock() ? 'Disponibles' : null, params: { soloDisponible: null } },
      { label: facade.onlyFeatured() ? 'Solo destacados' : null, params: { soloDestacados: null } },
      {
        label:
          facade.sortOption() === 'featured'
            ? null
            : SORT_OPTIONS.find((option) => option.value === facade.sortOption())?.label,
        params: { orden: null },
      },
    ].filter((chip) => chip.label);
  });

  constructor() {
    afterNextRender(() => {
      this.route.queryParamMap.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((params) => {
        const sort = params.get('orden');
        const mode = params.get('modalidad');
        const easy = params.get('facilInstalacion');
        const min = parsePrice(params.get('precioMin'));
        const max = parsePrice(params.get('precioMax'));
        this.facade.setSearchTerm(params.get('q')?.trim() ?? '', true);
        this.facade.setSelectedCategory(params.get('categoria'));
        this.facade.setSortOption(
          SORT_OPTIONS.some((option) => option.value === sort)
            ? (sort as CatalogSortOption)
            : 'featured',
        );
        this.facade.setAvailabilityFilters(
          params.get('soloDescuento') === 'true',
          params.get('soloDisponible') === 'true',
        );
        this.facade.setOnlyFeatured(params.get('soloDestacados') === 'true');
        this.facade.setExtraFilters({
          modalidad: mode === 'COMPRAR' || mode === 'COTIZAR' ? mode : null,
          facilInstalacion: easy === 'true' || easy === 'false' ? easy === 'true' : null,
          precioMin: min,
          precioMax: min != null && max != null && max < min ? null : max,
          acabado: params.get('acabado')?.trim() || null,
        });
      });
      this.facade.load();
    });
  }

  protected updateFilters(params: Params): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams: params,
    });
  }

  protected clearFilters(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParamsHandling: 'merge',
      queryParams: {
        q: null,
        categoria: null,
        orden: null,
        modalidad: null,
        acabado: null,
        precioMin: null,
        precioMax: null,
        facilInstalacion: null,
        soloDescuento: null,
        soloDisponible: null,
        soloDestacados: null,
      },
    });
  }

  protected trapFilterFocus(event: KeyboardEvent, dialog: HTMLDialogElement): void {
    if (event.key !== 'Tab') return;

    const controls = dialog.querySelectorAll<HTMLElement>(
      'button:not(:disabled), input:not(:disabled), select:not(:disabled)',
    );
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && event.target === first) {
      event.preventDefault();
      last?.focus();
    } else if (!event.shiftKey && event.target === last) {
      event.preventDefault();
      first?.focus();
    }
  }

  protected applyPrice(
    event: SubmitEvent,
    minField: HTMLInputElement,
    maxField: HTMLInputElement,
  ): void {
    event.preventDefault();
    const min = parsePrice(minField.value);
    const max = parsePrice(maxField.value);
    if (min != null && max != null && min > max) {
      maxField.setCustomValidity('El máximo debe ser mayor o igual al mínimo.');
      maxField.reportValidity();
      return;
    }
    this.updateFilters({ precioMin: min, precioMax: max });
  }
}
