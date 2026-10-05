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

import { finalize } from 'rxjs';

import { ISADECOR_UNIT_SLUG, PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import { IsadecorQuoteCartService } from '../../../core/services/isadecor-quote-cart.service';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';

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
  private readonly publicContentApi = inject(PublicContentApiService);
  private readonly destroyRef = inject(DestroyRef);
  readonly cart = inject(IsadecorQuoteCartService);

  readonly dynamicCategories = signal<readonly IsadecorSubCategory[]>([]);
  readonly loadingCategories = signal(true);
  readonly menuOpen = signal(false);
  readonly productsDropdownOpen = signal(false);

  private requestInFlight = false;

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
    if (this.requestInFlight) {
      return;
    }
    this.requestInFlight = true;
    this.loadingCategories.set(true);
    this.publicContentApi
      .getProductCatalog(PUBLIC_SITE_KEY, ISADECOR_UNIT_SLUG)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.requestInFlight = false;
          this.loadingCategories.set(false);
        }),
      )
      .subscribe({
        next: (catalog) => {
          const isadecorCategories = (catalog.categorias ?? []).map((cat) => ({
            label: cat.nombre,
            queryParams: { categoria: cat.slug },
          }));

          this.dynamicCategories.set(isadecorCategories);
        },
        error: () => {
          this.dynamicCategories.set([]);
        },
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
