import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RouterLink } from '@angular/router';

import { Alert } from '../../../shared/components/alert/alert';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { RevealStagger } from '../../../shared/components/reveal-stagger/reveal-stagger';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { CatalogFacade } from '../catalog/catalog.facade';
import { ProductCard } from '../catalog/components/product-card/product-card';
import { AnnouncementResponse } from '../../../data/models/announcement/announcement.model';
import { IsadecorHomeContentFacade } from './isadecor-home-content.facade';

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

interface HomePromotionPreview {
  id: string;
  label: string;
  title: string;
  description: string;
  imageUrl: string;
  featured?: boolean;
}

interface HomeAnnouncementPreview {
  id: string;
  label: string;
  title: string;
  description: string;
  imageUrl: string;
}

interface HomeMarqueeItem {
  text: string;
  imageUrl: string;
  imageAlt: string;
}

interface HomeQuoteStep {
  number: string;
  title: string;
  description: string;
}

interface HomeStoreBenefit {
  id: 'catalog' | 'selection' | 'quote' | 'responsive';
  title: string;
  description: string;
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
  imports: [
    Alert,
    Button,
    EmptyState,
    Loading,
    ProductCard,
    RevealStagger,
    RouterLink,
    SectionTitle,
  ],
  providers: [CatalogFacade, IsadecorHomeContentFacade],
  templateUrl: './home.html',
  styleUrl: './home.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  readonly facade = inject(CatalogFacade);
  readonly homeContent = inject(IsadecorHomeContentFacade);
  private readonly quickAccessService = inject(IsadecorHeroQuickAccessService);
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  readonly catalogUrl = '/isadecor/catalogo';
  readonly quoteUrl = '/isadecor/cotizacion';

  private readonly _isBrowser = signal(false);
  readonly isBrowser = this._isBrowser.asReadonly();
  private readonly _instagramStatus = signal<'loading' | 'ready' | 'error'>('loading');
  readonly instagramStatus = this._instagramStatus.asReadonly();

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

  readonly homeCategories = this.homeContent.categories;
  readonly homeRibbon = this.homeContent.ribbon;
  readonly homePromotions = this.homeContent.promotions;
  readonly homeAnnouncements = this.homeContent.announcements;

  readonly quickAccessImages: Readonly<Record<string, string>> = {
    'wall-panel-wpc': '/images/isadecor-left-1.jpg',
    'planchas-spc-marmol': '/images/isadecor-left-2.jpg',
    'cielos-rasos-pvc': '/images/isadecor-top.jpg',
    'pisos-molduras': '/images/isadecor-fondo.jpg',
  };

  /**
   * Espacios editoriales de muestra. No representan promociones vigentes ni
   * agregan acciones comerciales; se reemplazarán por contenido administrable.
   */
  readonly promotionPreviews: readonly HomePromotionPreview[] = [
    {
      id: 'ambientes-con-textura',
      label: 'Espacio promocional',
      title: 'Texturas que definen el ambiente',
      description: 'Composición de muestra para comunicar futuras novedades de ISADECOR.',
      imageUrl: '/images/isadecor-fondo.jpg',
      featured: true,
    },
    {
      id: 'superficies-contemporaneas',
      label: 'Vista previa',
      title: 'Superficies contemporáneas',
      description: 'Área reservada para campañas y colecciones destacadas.',
      imageUrl: '/images/isadecor-left-2.jpg',
    },
    {
      id: 'detalles-arquitectonicos',
      label: 'Vista previa',
      title: 'Detalles para cada proyecto',
      description: 'Presentación visual sin promoción comercial activa.',
      imageUrl: '/images/proyectos-showroom-isadecor.jpg',
    },
  ];

  /** Muestra editorial; los anuncios publicados siguen usando el módulo global existente. */
  readonly announcementPreviews: readonly HomeAnnouncementPreview[] = [
    {
      id: 'anuncio-demo-muestras',
      label: 'Anuncio demostrativo',
      title: 'Descubre acabados en detalle',
      description: 'Espacio visual de muestra para comunicar colecciones, novedades o asesorías.',
      imageUrl: '/images/recorrido-sala.jpg',
    },
    {
      id: 'anuncio-demo-proyectos',
      label: 'Anuncio demostrativo',
      title: 'Materiales para cada proyecto',
      description: 'Una composición editorial preparada para futuras campañas de ISADECOR.',
      imageUrl: '/images/recorrido-cocina.jpg',
    },
    {
      id: 'anuncio-demo-showroom',
      label: 'Anuncio demostrativo',
      title: 'Inspírate antes de elegir',
      description: 'Presentación de referencia sin promoción ni vigencia comercial activa.',
      imageUrl: '/images/proyectos-showroom-isadecor.jpg',
    },
  ];

  readonly marqueeItems: readonly HomeMarqueeItem[] = [
    {
      text: 'Contenido de demostración',
      imageUrl: '/images/isadecor-left-1.jpg',
      imageAlt: 'Detalle de acabado Wall Panel WPC',
    },
    {
      text: 'Acabados que transforman',
      imageUrl: '/images/isadecor-left-2.jpg',
      imageAlt: 'Detalle de plancha SPC con acabado mármol',
    },
    {
      text: 'Colecciones ISADECOR',
      imageUrl: '/images/isadecor-top.jpg',
      imageAlt: 'Aplicación de cielo raso decorativo',
    },
    {
      text: 'Cotiza tu proyecto',
      imageUrl: '/images/isadecor-fondo.jpg',
      imageAlt: 'Ambiente terminado con acabados ISADECOR',
    },
  ];

  readonly storeBenefits: readonly HomeStoreBenefit[] = [
    {
      id: 'catalog',
      title: 'Catálogo organizado',
      description: 'Explora productos por colección y acabado.',
    },
    {
      id: 'selection',
      title: 'Selección para cotizar',
      description: 'Reúne los productos que interesan a tu proyecto.',
    },
    {
      id: 'quote',
      title: 'Cotización centralizada',
      description: 'Envía tu solicitud desde el flujo actual de ISADECOR.',
    },
    {
      id: 'responsive',
      title: 'Experiencia adaptable',
      description: 'Consulta el contenido desde móvil, tablet o escritorio.',
    },
  ];

  readonly quote = {
    title: 'Pide tu cotización',
    description:
      'Cuéntanos qué productos o acabados necesitas y recibe una cotización a la medida para tu proyecto.',
    ctaLabel: 'Solicitar cotización',
    url: this.quoteUrl,
    imageUrl: '/images/asesora-consultoria.jpg',
  };

  readonly quoteSteps: readonly HomeQuoteStep[] = [
    {
      number: '01',
      title: 'Explora el catálogo',
      description: 'Encuentra el acabado o revestimiento que mejor encaje con tu espacio.',
    },
    {
      number: '02',
      title: 'Selecciona un producto',
      description: 'Ingresa desde la ficha del producto para iniciar la solicitud correcta.',
    },
    {
      number: '03',
      title: 'Completa tus datos',
      description: 'Nuestro equipo revisará la información y confirmará precio y disponibilidad.',
    },
  ];

  readonly featuredCategories = computed<readonly HomeCategoryHighlight[]>(() => {
    const rawCategories = this.facade.categories();
    const managedCategories = this.homeContent.categories();
    if (managedCategories.length > 0) {
      return managedCategories.map((item) => ({
        id: item.id,
        badge: item.etiqueta.startsWith('DEMO-HOME-') ? 'COLECCIÓN' : item.etiqueta,
        eyebrow: 'Categoría ISADECOR',
        title: item.titulo,
        description: item.descripcionResumida,
        tagline: item.textoBoton,
        imageUrl: item.imagenUrl,
        queryParams: { categoria: item.destinoAccion },
      }));
    }
    const configs = this.quickAccessService.visibleCollections();

    if (configs.length > 0) {
      return configs.map((config, index) => {
        const category = rawCategories.find((c) => c.slug === config.categorySlug);

        const name = config.title?.trim() || category?.nombre || 'Colección ISADECOR';
        const nameLower = name.toLowerCase();

        let autoBadge = 'ACABADO';
        let autoEyebrow = 'Línea Decorativa';
        let autoTagline = 'Calidad arquitectónica y durabilidad';
        let fallbackImage = '/images/isadecor-left-1.jpg';

        if (
          nameLower.includes('wall') ||
          nameLower.includes('panel') ||
          nameLower.includes('pared')
        ) {
          autoBadge = 'PARED';
          autoEyebrow = 'Acabados de Pared';
          autoTagline = 'Textura madera · Fácil instalación click';
          fallbackImage = '/images/isadecor-left-1.jpg';
        } else if (
          nameLower.includes('mármol') ||
          nameLower.includes('marmol') ||
          nameLower.includes('spc')
        ) {
          autoBadge = 'SUPERFICIES';
          autoEyebrow = 'Acabados de Superficie';
          autoTagline = 'Efecto mármol espejo · Gran formato';
          fallbackImage = '/images/isadecor-left-2.jpg';
        } else if (
          nameLower.includes('cielo') ||
          nameLower.includes('techo') ||
          nameLower.includes('pvc')
        ) {
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
            config.description?.trim() || 'Explora esta colección dentro del catálogo de ISADECOR.',
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

      if (
        nameLower.includes('wall') ||
        nameLower.includes('panel') ||
        nameLower.includes('pared')
      ) {
        badge = 'PARED';
        eyebrow = 'Acabados de Pared';
        tagline = 'Textura madera · Fácil instalación click';
        fallbackImage = '/images/isadecor-left-1.jpg';
      } else if (
        nameLower.includes('mármol') ||
        nameLower.includes('marmol') ||
        nameLower.includes('spc')
      ) {
        badge = 'SUPERFICIES';
        eyebrow = 'Acabados de Superficie';
        tagline = 'Efecto mármol espejo · Gran formato';
        fallbackImage = '/images/isadecor-left-2.jpg';
      } else if (
        nameLower.includes('cielo') ||
        nameLower.includes('techo') ||
        nameLower.includes('pvc')
      ) {
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
    this.facade.products()
      .filter((product) => product.destacado === true)
      .sort((a, b) => (a.ordenDestacado ?? 0) - (b.ordenDestacado ?? 0) || a.nombre.localeCompare(b.nombre))
      .slice(0, 8),
  );

  internalRoute(item: AnnouncementResponse): string | null {
    if (item.tipoAccion === 'URL_EXTERNA') return null;
    if (item.tipoAccion === 'CATEGORIA') return this.catalogUrl;
    if (item.tipoAccion === 'PRODUCTO') return `/isadecor/productos/${item.destinoAccion}`;
    return item.destinoAccion.startsWith('/') ? item.destinoAccion : this.catalogUrl;
  }

  externalUrl(item: AnnouncementResponse): string | null {
    return item.tipoAccion === 'URL_EXTERNA' ? item.destinoAccion : null;
  }

  contentQueryParams(item: AnnouncementResponse): Record<string, string> | null {
    return item.tipoAccion === 'CATEGORIA' ? { categoria: item.destinoAccion } : null;
  }

  constructor() {
    afterNextRender(() => {
      this._isBrowser.set(true);
      this.facade.load();
      this.homeContent.load();
      this.loadInstagramWidget();
    });
  }

  private loadInstagramWidget(): void {
    const widget = this.document.querySelector<HTMLElement>(
      '.elfsight-app-7448127f-39bf-4bfd-8721-816096ec6293',
    );
    const browserWindow = this.document.defaultView;
    if (!widget || !browserWindow) return;

    const markReady = (): void => {
      if (widget.childElementCount > 0) this._instagramStatus.set('ready');
    };
    markReady();

    const observer = new MutationObserver(markReady);
    observer.observe(widget, { childList: true, subtree: true });

    const scriptId = 'elfsight-platform-script';
    const scriptUrl = 'https://elfsightcdn.com/platform.js';
    let script =
      this.document.getElementById(scriptId) as HTMLScriptElement | null;
    script ??= this.document.querySelector<HTMLScriptElement>(`script[src="${scriptUrl}"]`);

    const markError = (): void => {
      if (this._instagramStatus() === 'loading') this._instagramStatus.set('error');
    };

    if (!script) {
      script = this.document.createElement('script');
      script.id = scriptId;
      script.src = scriptUrl;
      script.async = true;
      this.document.head.appendChild(script);
    }
    script.addEventListener('error', markError, { once: true });

    const timeoutId = browserWindow.setTimeout(markError, 15_000);
    this.destroyRef.onDestroy(() => {
      observer.disconnect();
      browserWindow.clearTimeout(timeoutId);
      script?.removeEventListener('error', markError);
    });
  }
}
