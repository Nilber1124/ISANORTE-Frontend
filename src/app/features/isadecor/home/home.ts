import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Alert } from '../../../shared/components/alert/alert';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { CatalogFacade } from '../catalog/catalog.facade';
import { ProductCard } from '../catalog/components/product-card/product-card';

import {
  DEFAULT_HERO_QUICK_ACCESS_ITEMS,
  HomeQuickAccessItem,
  IsadecorHeroQuickAccessService,
} from '../../../core/services/isadecor-hero-quick-access.service';

export interface HomeCategoryHighlight {
  id: string;
  badge: string;
  eyebrow: string;
  title: string;
  description: string;
  imageUrl: string;
  tagline?: string;
  queryParams?: Record<string, string>;
}

export type { HomeQuickAccessItem };
export const HERO_QUICK_ACCESS_ITEMS = DEFAULT_HERO_QUICK_ACCESS_ITEMS;

const DEFAULT_CATEGORY_HIGHLIGHTS: readonly HomeCategoryHighlight[] = [
  {
    id: 'wall-panel-wpc-interior',
    badge: 'PARED',
    eyebrow: 'Acabados de Pared',
    title: 'Wall Panel WPC Interior',
    description:
      'Paneles y listones WPC que aportan textura, calidez acústica y un acabado vanguardista a los muros.',
    tagline: 'Textura madera · Fácil instalación click',
    imageUrl: '/images/isadecor-left-1.jpg',
    queryParams: { q: 'Wall panel' },
  },
  {
    id: 'plancha-tipo-marmol-spc',
    badge: 'SUPERFICIES',
    eyebrow: 'Acabados de Superficie',
    title: 'Planchas Tipo Mármol SPC',
    description:
      'Planchas SPC con acabado mármol de alto impacto visual para muros de acento sin obra pesada.',
    tagline: 'Efecto mármol espejo · Gran formato',
    imageUrl: '/images/isadecor-left-2.jpg',
    queryParams: { q: 'Mármol SPC' },
  },
  {
    id: 'cielo-raso-pvc',
    badge: 'TECHOS',
    eyebrow: 'Sistemas de Techo',
    title: 'Cielo Raso PVC',
    description:
      'Cielos rasos en PVC ligeros, 100% resistentes a la humedad, anti-hongos y de fácil limpieza.',
    tagline: 'Inmune a humedad · Cero pintura',
    imageUrl: '/images/isadecor-top.jpg',
    queryParams: { q: 'PVC' },
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
  private readonly quickAccessService = inject(IsadecorHeroQuickAccessService);

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
    backgroundImageUrl: '/images/isadecor-hero.jpg',
  };

  readonly heroQuickAccess = this.quickAccessService.visibleItems;

  readonly quote = {
    title: '¿Listo para cotizar tus acabados?',
    description:
      'Cuéntanos qué productos o acabados necesitas y recibe una cotización a la medida para tu proyecto.',
    ctaLabel: 'Solicitar cotización',
    url: this.quoteUrl,
    imageUrl: '/images/asesora-consultoria.jpg',
  };

  readonly featuredCategories = computed<readonly HomeCategoryHighlight[]>(() => {
    const rawCategories = this.facade.categories();
    const configs = this.quickAccessService.visibleCollections();

    if (configs.length > 0) {
      return configs.map((config, index) => {
        const category = rawCategories.find(
          (c) => c.slug === config.categorySlug,
        );

        const name = config.title?.trim() || category?.nombre || 'Colección ISADECOR';
        const nameLower = name.toLowerCase();

        let autoBadge = 'ACABADO';
        let autoEyebrow = 'Línea Decorativa';
        let autoTagline = 'Calidad arquitectónica y durabilidad';
        let fallbackImage = '/images/isadecor-left-1.jpg';

        if (nameLower.includes('wall') || nameLower.includes('panel') || nameLower.includes('pared')) {
          autoBadge = 'PARED';
          autoEyebrow = 'Acabados de Pared';
          autoTagline = 'Textura madera · Fácil instalación click';
          fallbackImage = '/images/isadecor-left-1.jpg';
        } else if (nameLower.includes('mármol') || nameLower.includes('marmol') || nameLower.includes('spc')) {
          autoBadge = 'SUPERFICIES';
          autoEyebrow = 'Acabados de Superficie';
          autoTagline = 'Efecto mármol espejo · Gran formato';
          fallbackImage = '/images/isadecor-left-2.jpg';
        } else if (nameLower.includes('cielo') || nameLower.includes('techo') || nameLower.includes('pvc')) {
          autoBadge = 'TECHOS';
          autoEyebrow = 'Sistemas de Techo';
          autoTagline = 'Inmune a humedad · Cero mantenimiento';
          fallbackImage = '/images/isadecor-top.jpg';
        } else if (nameLower.includes('piso')) {
          autoBadge = 'PISOS';
          autoEyebrow = 'Acabados de Piso';
          autoTagline = 'Alto tránsito · Resistencia al agua';
          fallbackImage = '/images/isadecor-left-1.jpg';
        } else if (nameLower.includes('revestimiento')) {
          autoBadge = 'REVESTIMIENTOS';
          autoEyebrow = 'Línea Revestimientos';
          autoTagline = 'Diseño contemporáneo y protección';
          fallbackImage = '/images/isadecor-left-2.jpg';
        } else if (index === 1) {
          fallbackImage = '/images/isadecor-left-2.jpg';
        } else if (index === 2) {
          fallbackImage = '/images/isadecor-top.jpg';
        }

        return {
          id: category?.slug || config.id,
          badge: config.badge?.trim() || autoBadge,
          eyebrow: config.eyebrow?.trim() || autoEyebrow,
          title: config.title?.trim() || category?.nombre || 'Colección ISADECOR',
          description:
            config.description?.trim() ||
            'Explora esta colección dentro del catálogo de ISADECOR.',
          tagline: config.tagline?.trim() || autoTagline,
          imageUrl: config.imageUrl?.trim() || fallbackImage,
          queryParams: { categoria: category?.slug || config.categorySlug },
        };
      });
    }

    if (rawCategories.length === 0) {
      return DEFAULT_CATEGORY_HIGHLIGHTS;
    }

    return rawCategories.slice(0, 3).map((category, index) => {
      const nameLower = category.nombre.toLowerCase();
      let badge = 'ACABADO';
      let eyebrow = 'Línea Decorativa';
      let tagline = 'Calidad arquitectónica y durabilidad';
      let fallbackImage = '/images/isadecor-left-1.jpg';

      if (nameLower.includes('wall') || nameLower.includes('panel') || nameLower.includes('pared')) {
        badge = 'PARED';
        eyebrow = 'Acabados de Pared';
        tagline = 'Textura madera · Fácil instalación click';
        fallbackImage = '/images/isadecor-left-1.jpg';
      } else if (nameLower.includes('mármol') || nameLower.includes('marmol') || nameLower.includes('spc')) {
        badge = 'SUPERFICIES';
        eyebrow = 'Acabados de Superficie';
        tagline = 'Efecto mármol espejo · Gran formato';
        fallbackImage = '/images/isadecor-left-2.jpg';
      } else if (nameLower.includes('cielo') || nameLower.includes('techo') || nameLower.includes('pvc')) {
        badge = 'TECHOS';
        eyebrow = 'Sistemas de Techo';
        tagline = 'Inmune a humedad · Cero mantenimiento';
        fallbackImage = '/images/isadecor-top.jpg';
      } else if (nameLower.includes('piso')) {
        badge = 'PISOS';
        eyebrow = 'Acabados de Piso';
        tagline = 'Alto tránsito · Resistencia al agua';
        fallbackImage = '/images/isadecor-left-1.jpg';
      } else if (nameLower.includes('revestimiento')) {
        badge = 'REVESTIMIENTOS';
        eyebrow = 'Línea Revestimientos';
        tagline = 'Diseño contemporáneo y protección';
        fallbackImage = '/images/isadecor-left-2.jpg';
      } else if (index === 1) {
        fallbackImage = '/images/isadecor-left-2.jpg';
      } else if (index === 2) {
        fallbackImage = '/images/isadecor-top.jpg';
      }

      return {
        id: category.slug,
        badge,
        eyebrow,
        title: category.nombre,
        description: 'Explora esta colección dentro del catálogo de ISADECOR.',
        tagline,
        imageUrl: fallbackImage,
        queryParams: { categoria: category.slug },
      };
    });
  });


  readonly featuredProducts = computed(() =>
    this.facade.products().slice(0, 4),
  );

  constructor() {
    afterNextRender(() => {
      this._isBrowser.set(true);
      this.facade.load();
    });
  }
}