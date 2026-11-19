import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { PublicSiteFacade } from '../../../layouts/public-layout/public-site.facade';
import { IsadecorHomeFacade } from './isadecor-home.facade';
import { ArmaAmbiente } from './arma-ambiente/arma-ambiente';
import { HomePromoBanner } from './promo-banner/promo-banner';
import { HomeRibbon } from './ribbon/ribbon';
import { HomeProductTile } from './product-tile/product-tile';

/** La tienda del Home es una selección corta; el catálogo completo vive en /isadecor/productos. */
const HOME_STORE_LIMIT = 8;

@Component({
  selector: 'app-isadecor-home',
  imports: [ArmaAmbiente, HomeProductTile, HomePromoBanner, HomeRibbon, RouterLink],
  providers: [IsadecorHomeFacade],
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  readonly facade = inject(IsadecorHomeFacade);
  private readonly router = inject(Router);

  private readonly publicSite = inject(PublicSiteFacade);

  readonly content = this.facade.content;
  readonly chip = signal<string>('todos');
  /** Productos visibles según el chip activo, limitados a la selección del Home. */
  readonly filtered = computed(() => {
    const store = this.content()?.tienda;
    if (!store) return [];
    const chip = this.chip();
    let list = store.productos;
    if (chip === 'ofertas') list = list.filter((p) => (p.descuentoPorcentaje ?? 0) > 0);
    else if (chip !== 'todos') list = list.filter((p) => p.categorias.some((c) => c.slug === chip));
    return list.slice(0, HOME_STORE_LIMIT);
  });
  /** Chips con al menos un producto en la selección. */
  readonly chips = computed(() => {
    const store = this.content()?.tienda;
    return (store?.categorias ?? []).filter((c) => store!.productos.some((p) => p.categorias.some((x) => x.slug === c.slug)));
  });
  /** Categoría activa (si el chip es una categoría) para enlazar a su catálogo. */
  readonly activeCategory = computed(() => this.chips().find((c) => c.slug === this.chip()) ?? null);
  /** Promociones vigentes (las vencidas se ocultan solas); máximo 3: 1 grande y 2 pequeñas. */
  readonly promotions = computed(() => {
    const today = new Date().toISOString().slice(0, 10);
    return (this.content()?.promociones ?? []).filter((p) => !p.fechaFin || p.fechaFin >= today).slice(0, 3);
  });
  readonly whatsappUrl = computed(() => {
    const phone = this.publicSite.company()?.whatsapp?.replace(/\D/g, '') ?? '';
    return phone.length >= 8
      ? `https://wa.me/${phone}?text=${encodeURIComponent('Hola ISADECOR, quisiera cotizar acabados.')}`
      : null;
  });
  readonly catalogUrl = '/isadecor/productos';
  readonly skeletons = [0, 1, 2, 3];

  constructor() {
    afterNextRender(() => this.facade.load());
  }

  search(query: string): void {
    const q = query.trim();
    void this.router.navigate([this.catalogUrl], { queryParams: q ? { q } : {} });
  }

  /** Filtra la tienda por ofertas y baja hasta ella. */
  showOffers(): void {
    this.chip.set('ofertas');
    document.getElementById('tienda')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  /** Un enlace de campaña puede traer parámetros (`ruta?categoria=x`). */
  campaignPath(link: string): string {
    return link.split('?')[0];
  }

  campaignParams(link: string): Record<string, string> | null {
    const query = link.split('?')[1];
    return query ? Object.fromEntries(new URLSearchParams(query)) : null;
  }

  selectChip(slug: string): void {
    this.chip.set(slug);
  }

  stars(rating: number): readonly boolean[] {
    return [1, 2, 3, 4, 5].map((n) => n <= rating);
  }
}
