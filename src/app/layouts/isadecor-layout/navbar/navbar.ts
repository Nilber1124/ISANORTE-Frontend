import { NgClass } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { IsadecorQuoteCartService } from '../../../core/services/isadecor-quote-cart.service';
import { CategoryApiService } from '../../../data/services/category-api.service';

export interface IsadecorSubCategory {
  label: string;
  queryParams: Record<string, string>;
}

export interface IsadecorNavLink {
  label: string;
  url: string;
  exact?: boolean;
  children?: readonly IsadecorSubCategory[];
}

@Component({
  selector: 'app-isadecor-navbar',
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private readonly categoryApi = inject(CategoryApiService);
  private readonly destroyRef = inject(DestroyRef);
  readonly cart = inject(IsadecorQuoteCartService);

  readonly dynamicCategories = signal<readonly IsadecorSubCategory[]>([]);
  readonly menuOpen = signal(false);
  readonly productsDropdownOpen = signal(false);

  readonly links = computed<readonly IsadecorNavLink[]>(() => [
    { label: 'Inicio', url: '/isadecor', exact: true },
    {
      label: 'Productos',
      url: '/isadecor/catalogo',
      children: this.dynamicCategories(),
    },
    { label: 'Catálogo', url: '/isadecor/catalogo' },
    { label: 'Cotización', url: '/isadecor/cotizacion' },
  ]);

  constructor() {
    afterNextRender(() => {
      this.loadCategories();
    });
  }

  loadCategories(): void {
    this.categoryApi
      .getActive()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (categories) => {
          const isadecorCategories = categories
            .filter(
              (cat) => !cat.unidadNegocio || cat.unidadNegocio.slug.toLowerCase() === 'isadecor',
            )
            .sort(
              (a, b) =>
                (a.orden ?? 999) - (b.orden ?? 999) || a.nombre.localeCompare(b.nombre, 'es'),
            )
            .map((cat) => ({
              label: cat.nombre,
              queryParams: { categoria: cat.slug },
            }));

          this.dynamicCategories.set(isadecorCategories);
        },
        error: () => {},
      });
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
    this.productsDropdownOpen.set(false);
  }

  toggleProductsDropdown(): void {
    this.productsDropdownOpen.update((open) => !open);
  }

  openProductsDropdown(): void {
    this.productsDropdownOpen.set(true);
  }

  closeProductsDropdown(): void {
    this.productsDropdownOpen.set(false);
  }
}
