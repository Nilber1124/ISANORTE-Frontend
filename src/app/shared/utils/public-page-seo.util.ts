import { Meta, Title } from '@angular/platform-browser';

import { SeoRobots } from '../../data/models/content/page-seo.model';
import { PublicPageResponse, PublicPageSeo } from '../../data/models/public-content/public-page.model';

export interface PublicPageSeoDefaults {
  title: string;
  description: string;
}

export interface PublicPageSeoSource {
  seo?: PublicPageSeo | null;
  contenido?: {
    titulo?: string | null;
    introduccion?: string | null;
    descripcion?: string | null;
    imagenUrl?: string | null;
  } | null;
}

export const BASE_SITE_TITLE = 'ISANORTE';
export const BASE_SITE_DESCRIPTION =
  'Empresa líder en construcción, diseño arquitectónico e ingeniería con altos estándares de calidad.';

const DEFAULT_ORIGIN = 'https://isanorte.com';

/**
 * Convierte un enum SeoRobots a la directiva estándar para la etiqueta meta robots.
 */
export function toRobotsDirective(robots?: SeoRobots | null): string {
  switch (robots) {
    case SeoRobots.INDEX_FOLLOW:
      return 'index, follow';
    case SeoRobots.NOINDEX_FOLLOW:
      return 'noindex, follow';
    case SeoRobots.INDEX_NOFOLLOW:
      return 'index, nofollow';
    case SeoRobots.NOINDEX_NOFOLLOW:
      return 'noindex, nofollow';
    default:
      return 'index, follow';
  }
}

/**
 * Asegura que una URL sea absoluta para cumplir con el estándar OpenGraph (og:image).
 */
export function toAbsoluteUrl(rawUrl: string | null | undefined, doc?: Document | null): string | null {
  if (!rawUrl) return null;
  const trimmed = rawUrl.trim();
  if (!trimmed) return null;

  try {
    const baseOrigin =
      doc?.location?.origin && doc.location.origin !== 'null' && doc.location.origin.startsWith('http')
        ? doc.location.origin
        : DEFAULT_ORIGIN;
    return new URL(trimmed, baseOrigin).href;
  } catch {
    return trimmed.startsWith('http') ? trimmed : `${DEFAULT_ORIGIN}/${trimmed.replace(/^\/+/, '')}`;
  }
}

/**
 * Aplica los metadatos SEO al documento HTML utilizando los servicios Title y Meta de Angular.
 */
export function applyPublicPageSeo(
  titleService: Title,
  metaService: Meta,
  page: PublicPageResponse | PublicPageSeoSource | null,
  defaults: PublicPageSeoDefaults,
  doc?: Document | null,
): void {
  // 1. Título: prioridad SEO backend -> contenido backend -> default de página
  const seoTitle = page?.seo?.title?.trim();
  const contentTitle = page?.contenido?.titulo?.trim();
  const title = seoTitle || (contentTitle ? `${contentTitle} | ${BASE_SITE_TITLE}` : defaults.title);

  // 2. Descripción: prioridad SEO backend -> introducción/descripción contenido -> default de página
  const seoDesc = page?.seo?.description?.trim();
  const contentIntro = page?.contenido?.introduccion?.trim();
  const contentDesc = page?.contenido?.descripcion?.trim();
  const description = seoDesc || contentIntro || contentDesc || defaults.description;

  // 3. Imagen OpenGraph (URL absoluta obligatoria)
  const seoImage = page?.seo?.ogImageUrl?.trim();
  const contentImage = page?.contenido?.imagenUrl?.trim();
  const rawImage = seoImage || contentImage || null;
  const ogImageUrl = toAbsoluteUrl(rawImage, doc);

  // 4. Directiva robots
  const robots = toRobotsDirective(page?.seo?.robots);

  // Aplicar título y metadatos estándar
  titleService.setTitle(title);
  metaService.updateTag({ name: 'description', content: description });
  metaService.updateTag({ name: 'robots', content: robots });

  // Aplicar OpenGraph
  metaService.updateTag({ property: 'og:title', content: title });
  metaService.updateTag({ property: 'og:description', content: description });
  metaService.updateTag({ property: 'og:type', content: 'website' });

  if (ogImageUrl) {
    metaService.updateTag({ property: 'og:image', content: ogImageUrl });
  } else {
    metaService.removeTag('property="og:image"');
  }
}

/**
 * Limpia los metadatos específicos de la página para evitar que permanezcan al navegar a otra.
 */
export function clearPublicPageSeo(titleService: Title, metaService: Meta): void {
  titleService.setTitle(BASE_SITE_TITLE);
  metaService.updateTag({ name: 'description', content: BASE_SITE_DESCRIPTION });
  metaService.removeTag('name="robots"');
  metaService.removeTag('property="og:title"');
  metaService.removeTag('property="og:description"');
  metaService.removeTag('property="og:type"');
  metaService.removeTag('property="og:image"');
}
