import { PublicSiteFacade } from '../../public-layout/public-site.facade';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { finalize } from 'rxjs';

import { ISADECOR_UNIT_SLUG, PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import { ClienteAuthService } from '../../../core/auth/cliente-auth.service';
import { IsadecorQuoteCartService } from '../../../core/services/isadecor-quote-cart.service';
import { PublicProductCatalogCategoryResponse } from '../../../data/models/public-content/public-product-catalog.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';

export interface IsadecorSubCategory {
  label: string;
  queryParams: Record<string, string>;
  /** Subcategorías (un solo nivel). */
  children?: readonly IsadecorSubCategory[];
}

export interface IsadecorNavLink {
  label: string;
  url: string;
  exact?: boolean;
  children?: readonly IsadecorSubCategory[];
}

/** Convierte la lista plana del catálogo (con `padreSlug`) en categorías con sus subcategorías. */
export function buildCategoryTree(
  categories: readonly PublicProductCatalogCategoryResponse[],
): IsadecorSubCategory[] {
  const slugs = new Set(categories.map((category) => category.slug));
  const toNode = (category: PublicProductCatalogCategoryResponse): IsadecorSubCategory => ({
    label: category.nombre,
    queryParams: { categoria: category.slug },
  });
  return categories
    .filter((category) => !category.padreSlug || !slugs.has(category.padreSlug))
    .map((root) => {
      const children = categories
        .filter((category) => category.padreSlug === root.slug)
        .map(toNode);
      return children.length > 0 ? { ...toNode(root), children } : toNode(root);
    });
}

@Component({
  selector: 'app-isadecor-navbar',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  private readonly publicContentApi = inject(PublicContentApiService);
  private readonly destroyRef = inject(DestroyRef);
  readonly cart = inject(IsadecorQuoteCartService);
  readonly cliente = inject(ClienteAuthService);
  private readonly router = inject(Router);
  private readonly site = inject(PublicSiteFacade, { optional: true });

  /** Enlace de WhatsApp para cotizar un proyecto; null si no hay número comercial. */
  readonly quoteHref = computed(
    () => this.site?.whatsappHrefFor('Hola ISADECOR, quisiera cotizar un proyecto.') ?? null,
  );
  private readonly cuentaContenedor = viewChild<ElementRef<HTMLElement>>('cuentaContenedor');

  /** false durante SSR y la primera hidratación: el estado de sesión solo existe en el navegador. */
  readonly hidratado = signal(false);
  readonly cuentaMenuOpen = signal(false);
  readonly nombreCompleto = computed(() => {
    const cliente = this.cliente.cliente();
    return cliente ? [cliente.nombre, cliente.apellido].filter(Boolean).join(' ') : '';
  });
  readonly primerNombre = computed(() => this.cliente.cliente()?.nombre.split(' ')[0] ?? '');
  readonly iniciales = computed(() => {
    const cliente = this.cliente.cliente();
    if (!cliente) return '';
    return [cliente.nombre, cliente.apellido]
      .filter(Boolean)
      .map((parte) => parte!.trim().charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  });

  readonly dynamicCategories = signal<readonly IsadecorSubCategory[]>([]);
  readonly loadingCategories = signal(true);
  readonly menuOpen = signal(false);
  readonly productsDropdownOpen = signal(false);

  private requestInFlight = false;

  readonly links = computed<readonly IsadecorNavLink[]>(() => [
    { label: 'Inicio', url: '/isadecor', exact: true },
    {
      label: 'Productos',
      url: '/isadecor/productos',
      children: this.dynamicCategories(),
    },
    { label: 'Catálogos PDF', url: '/isadecor/catalogos' },
  ]);

  constructor() {
    afterNextRender(() => {
      this.hidratado.set(true);
      this.loadCategories();
    });
  }

  @HostListener('document:click', ['$event.target'])
  onDocumentClick(target: EventTarget | null): void {
    const contenedor = this.cuentaContenedor()?.nativeElement;
    if (this.cuentaMenuOpen() && contenedor && !contenedor.contains(target as Node)) {
      this.cerrarCuentaMenu();
    }
  }

  toggleCuentaMenu(): void {
    this.cuentaMenuOpen.update((open) => !open);
  }

  cerrarCuentaMenu(): void {
    this.cuentaMenuOpen.set(false);
  }

  cerrarSesion(): void {
    this.cliente.logout();
    this.cerrarCuentaMenu();
    this.closeMenu();
    void this.router.navigateByUrl('/isadecor');
  }

  loadCategories(): void {
    if (this.requestInFlight) {
      return;
    }
    this.requestInFlight = true;
    this.loadingCategories.set(true);
    this.publicContentApi
      // El navbar solo necesita el facet de categorías: size=1 minimiza el payload de productos.
      .getProductCatalog(PUBLIC_SITE_KEY, ISADECOR_UNIT_SLUG, { page: 0, size: 1 })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.requestInFlight = false;
          this.loadingCategories.set(false);
        }),
      )
      .subscribe({
        next: (catalog) => {
          this.dynamicCategories.set(buildCategoryTree(catalog.categorias ?? []));
        },
        error: () => {
          this.dynamicCategories.set([]);
        },
      });
  }

  /** Entrega de la tienda (muestra: confirmar zonas con el cliente). */
  readonly deliveryLabel = 'Entrega en Cajamarca y todo el Perú';

  buscar(event: Event, query: string): void {
    event.preventDefault();
    const q = query.trim();
    this.closeMenu();
    void this.router.navigate(['/isadecor/productos'], { queryParams: q ? { q } : {} });
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
