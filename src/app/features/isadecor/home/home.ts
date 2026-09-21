import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Alert } from '../../../shared/components/alert/alert';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { CatalogFacade } from '../catalog/catalog.facade';
import { ProductCard } from '../catalog/components/product-card/product-card';

export interface HomeCategoryHighlight {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

const DEFAULT_CATEGORY_HIGHLIGHTS: readonly HomeCategoryHighlight[] = [
  {
    id: 'wall-panel-wpc-interior',
    title: 'Wall Panel WPC – Interior',
    description:
      'Paneles WPC para paredes que aportan textura, calidez y un acabado moderno a los interiores.',
    imageUrl: '/images/isadecor-left-1.jpg',
  },
  {
    id: 'plancha-tipo-marmol-spc',
    title: 'Plancha Tipo Mármol SPC',
    description:
      'Planchas SPC con acabado tipo mármol para pisos y superficies de alto impacto visual.',
    imageUrl: '/images/isadecor-left-2.jpg',
  },
  {
    id: 'cielo-raso-pvc',
    title: 'Cielo Raso PVC',
    description: 'Cielos rasos en PVC ligeros, resistentes a la humedad y fáciles de limpiar.',
    imageUrl: '/images/isadecor-top.jpg',
  },
];

@Component({
  selector: 'app-isadecor-home',
  imports: [Alert, Button, EmptyState, Loading, ProductCard, RouterLink, SectionTitle],
  providers: [CatalogFacade],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  readonly facade = inject(CatalogFacade);

  readonly catalogUrl = '/isadecor/catalogo';
  readonly quoteUrl = '/isadecor/cotizacion';

  private readonly _isBrowser = signal(false);
  readonly isBrowser = this._isBrowser.asReadonly();

  readonly productSkeletons = [0, 1, 2, 3];

  readonly hero = {
    kicker: 'ISADECOR · ACABADOS & REVESTIMIENTOS',
    title: 'Acabados y revestimientos que transforman tus espacios',
    description:
      'Descubre paneles WPC, planchas SPC y cielos rasos PVC pensados para dar identidad y confort a tus interiores.',
    primaryCta: { label: 'Explorar el catálogo', url: this.catalogUrl },
    secondaryCta: { label: 'Solicitar cotización', url: this.quoteUrl },
    backgroundImageUrl: '/images/isadecor-fondo.jpg',
  };

  readonly quote = {
    title: '¿Listo para cotizar tus acabados?',
    description:
      'Cuéntanos qué productos o acabados necesitas y recibe una cotización a la medida para tu proyecto.',
    ctaLabel: 'Solicitar cotización',
    url: this.quoteUrl,
    imageUrl: '/images/asesora-consultoria.jpg',
  };

  readonly featuredCategories = computed<readonly HomeCategoryHighlight[]>(() => {
    const realCategories = this.facade
      .categories()
      .filter((category) => category.imagenUrl)
      .slice(0, 3)
      .map((category) => ({
        id: category.id,
        title: category.nombre,
        description:
          category.descripcion ?? 'Explora esta colección dentro del catálogo de ISADECOR.',
        imageUrl: category.imagenUrl as string,
      }));

    return realCategories.length > 0 ? realCategories : DEFAULT_CATEGORY_HIGHLIGHTS;
  });

  readonly featuredProducts = computed(() =>
    [...this.facade.products()]
      .sort((a, b) => Number(b.destacado ?? false) - Number(a.destacado ?? false))
      .slice(0, 4),
  );

  constructor() {
    afterNextRender(() => {
      this._isBrowser.set(true);
      this.facade.load();
    });
  }
}