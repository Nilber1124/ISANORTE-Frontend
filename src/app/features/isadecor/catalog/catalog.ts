import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  effect,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { Pagination } from '../../../shared/components/pagination/pagination';
import { toCatalogProductCard } from '../home/isadecor-home.mapper';
import { HomeProductTile } from '../home/product-tile/product-tile';
import { CatalogFacade, CatalogSortOption } from './catalog.facade';

/** Cortes de precio (S/) para los rangos rápidos del panel de filtros. */
const PRICE_STEPS = [0, 50, 100, 250, 500, 1000] as const;

export interface PriceBucket {
  min: number | null;
  max: number | null;
  label: string;
}

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
  protected readonly modeOptions = [
    { value: '', label: 'Todos' },
    { value: 'COMPRAR', label: 'Comprar' },
    { value: 'COTIZAR', label: 'Cotizar' },
  ] as const;
  protected readonly skeletons = [0, 1, 2, 3, 4, 5, 6, 7];
  protected readonly cards = computed(() => this.facade.products().map(toCatalogProductCard));
  private readonly title = inject(Title);

  /** Rangos de precio rápidos que caen dentro del rango real publicado. */
  protected readonly priceBuckets = computed<PriceBucket[]>(() => {
    const { min, max } = this.facade.priceRange();
    if (min == null || max == null) return [];
    const buckets: PriceBucket[] = [];
    PRICE_STEPS.forEach((step, index) => {
      const next = PRICE_STEPS[index + 1] ?? null;
      const from = index === 0 ? null : step;
      const to = next;
      const label =
        from == null ? `Hasta S/ ${to}` : to == null ? `Desde S/ ${from}` : `S/ ${from} – S/ ${to}`;
      const intersects = max >= (from ?? 0) && (to == null || min <= to);
      if (intersects) buckets.push({ min: from, max: to, label });
    });
    return buckets;
  });

  protected readonly heading = computed(() => {
    const selected = this.facade.selectedCategories();
    if (selected.length !== 1) return 'Catálogo de acabados';
    return (
      this.facade.categories().find((item) => item.slug === selected[0])?.nombre ??
      'Catálogo de acabados'
    );
  });

  protected readonly chips = computed(() => {
    const facade = this.facade;
    const extra = facade.extra();
    const names = new Map(facade.categories().map((item) => [item.slug, item.nombre]));
    const categoryChips = facade.selectedCategories().map((slug) => ({
      label: names.get(slug) ?? slug,
      params: { categoria: remove(facade.selectedCategories(), slug) },
    }));
    const finishChips = facade.selectedAcabados().map((name) => ({
      label: name,
      params: { acabado: remove(facade.selectedAcabados(), name) },
    }));
    const price = [
      extra.precioMin != null ? `desde S/ ${extra.precioMin}` : '',
      extra.precioMax != null ? `hasta S/ ${extra.precioMax}` : '',
    ]
      .filter(Boolean)
      .join(' · ');
    return [
      ...categoryChips,
      { label: facade.searchTerm(), params: { q: null } },
      ...finishChips,
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
    effect(() => this.title.setTitle(`${this.heading()} | ISADECOR`));
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

  /** Agrega o quita un valor de un filtro de lista (colección o acabado). */
  protected toggleValue(
    param: 'categoria' | 'acabado',
    current: readonly string[],
    value: string,
  ): void {
    const next = current.includes(value)
      ? current.filter((item) => item !== value)
      : [...current, value];
    this.updateFilters({ [param]: next.length ? next.join(',') : null });
  }

  protected isBucketActive(bucket: PriceBucket): boolean {
    const extra = this.facade.extra();
    return (extra.precioMin ?? null) === bucket.min && (extra.precioMax ?? null) === bucket.max;
  }

  protected toggleBucket(bucket: PriceBucket): void {
    this.updateFilters(
      this.isBucketActive(bucket)
        ? { precioMin: null, precioMax: null }
        : { precioMin: bucket.min, precioMax: bucket.max },
    );
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

  /** Aplica el rango escrito a mano al salir del campo o al pulsar Enter. */
  protected applyPrice(minField: HTMLInputElement, maxField: HTMLInputElement): void {
    const min = parsePrice(minField.value);
    const max = parsePrice(maxField.value);
    if (min != null && max != null && min > max) {
      maxField.setCustomValidity('El máximo debe ser mayor o igual al mínimo.');
      maxField.reportValidity();
      return;
    }
    maxField.setCustomValidity('');
    this.updateFilters({ precioMin: min, precioMax: max });
  }
}

/** Quita un valor de la lista y devuelve «a,b» o null si queda vacía. */
function remove(list: readonly string[], value: string): string | null {
  const next = list.filter((item) => item !== value);
  return next.length ? next.join(',') : null;
}
