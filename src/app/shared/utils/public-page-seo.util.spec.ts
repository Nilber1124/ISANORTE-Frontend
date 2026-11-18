import { TestBed } from '@angular/core/testing';
import { Meta, Title } from '@angular/platform-browser';

import { SeoRobots } from '../../data/models/content/page-seo.model';
import { PublicPageResponse, PublicPageType } from '../../data/models/public-content/public-page.model';
import {
  BASE_SITE_DESCRIPTION,
  BASE_SITE_TITLE,
  applyPublicPageSeo,
  clearPublicPageSeo,
  toAbsoluteUrl,
  toRobotsDirective,
} from './public-page-seo.util';

describe('public-page-seo.util', () => {
  let titleService: Title;
  let metaService: Meta;

  const defaults = {
    title: 'Nosotros | ISANORTE',
    description: 'Conoce la trayectoria de ISANORTE.',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({});
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
  });

  afterEach(() => {
    clearPublicPageSeo(titleService, metaService);
  });

  describe('toRobotsDirective', () => {
    it('maps all SeoRobots enum values accurately', () => {
      expect(toRobotsDirective(SeoRobots.INDEX_FOLLOW)).toBe('index, follow');
      expect(toRobotsDirective(SeoRobots.NOINDEX_FOLLOW)).toBe('noindex, follow');
      expect(toRobotsDirective(SeoRobots.INDEX_NOFOLLOW)).toBe('index, nofollow');
      expect(toRobotsDirective(SeoRobots.NOINDEX_NOFOLLOW)).toBe('noindex, nofollow');
      expect(toRobotsDirective(null)).toBe('index, follow');
      expect(toRobotsDirective(undefined)).toBe('index, follow');
    });
  });

  describe('toAbsoluteUrl', () => {
    it('handles absolute urls cleanly', () => {
      expect(toAbsoluteUrl('https://res.cloudinary.com/demo/image.jpg')).toBe(
        'https://res.cloudinary.com/demo/image.jpg',
      );
      expect(toAbsoluteUrl('http://example.com/foto.png')).toBe('http://example.com/foto.png');
    });

    it('resolves relative urls into absolute urls using document origin', () => {
      const mockDoc = {
        location: { origin: 'https://mi-sitio.com' },
      } as unknown as Document;

      expect(toAbsoluteUrl('/assets/nosotros.jpg', mockDoc)).toBe('https://mi-sitio.com/assets/nosotros.jpg');
      expect(toAbsoluteUrl('assets/nosotros.jpg', mockDoc)).toBe('https://mi-sitio.com/assets/nosotros.jpg');
    });

    it('falls back to https://isanorte.com when document has no valid http origin', () => {
      expect(toAbsoluteUrl('/assets/nosotros.jpg', null)).toBe('https://isanorte.com/assets/nosotros.jpg');
      expect(toAbsoluteUrl(null)).toBeNull();
      expect(toAbsoluteUrl('   ')).toBeNull();
    });
  });

  describe('applyPublicPageSeo', () => {
    it('applies explicit SEO data from backend response', () => {
      const page: PublicPageResponse = {
        contenido: {
          pagina: PublicPageType.NOSOTROS,
          eyebrow: null,
          titulo: 'Título Contenido',
          introduccion: 'Intro Contenido',
          descripcion: 'Desc Contenido',
          imagenUrl: '/imagen-contenido.jpg',
          imagenAlt: null,
          imagenFondoUrl: null,
          tags: [],
        },
        seo: {
          title: 'Título SEO Backend',
          description: 'Descripción SEO Backend',
          ogImageUrl: 'https://cdn.isanorte.com/seo.jpg',
          robots: SeoRobots.NOINDEX_FOLLOW,
        },
        empresa: null,
        servicios: null,
        proyectos: null,
      };

      applyPublicPageSeo(titleService, metaService, page, defaults);

      expect(titleService.getTitle()).toBe('Título SEO Backend');
      expect(metaService.getTag('name="description"')?.content).toBe('Descripción SEO Backend');
      expect(metaService.getTag('name="robots"')?.content).toBe('noindex, follow');
      expect(metaService.getTag('property="og:title"')?.content).toBe('Título SEO Backend');
      expect(metaService.getTag('property="og:description"')?.content).toBe('Descripción SEO Backend');
      expect(metaService.getTag('property="og:type"')?.content).toBe('website');
      expect(metaService.getTag('property="og:image"')?.content).toBe('https://cdn.isanorte.com/seo.jpg');
    });

    it('falls back to content fields when seo block is missing or empty', () => {
      const page: PublicPageResponse = {
        contenido: {
          pagina: PublicPageType.NOSOTROS,
          eyebrow: null,
          titulo: 'Sobre Nosotros',
          introduccion: 'Presentación editorial de la constructora.',
          descripcion: 'Detalle corporativo.',
          imagenUrl: 'https://cdn.isanorte.com/portada.jpg',
          imagenAlt: null,
          imagenFondoUrl: null,
          tags: [],
        },
        seo: null,
        empresa: null,
        servicios: null,
        proyectos: null,
      };

      applyPublicPageSeo(titleService, metaService, page, defaults);

      expect(titleService.getTitle()).toBe('Sobre Nosotros | ISANORTE');
      expect(metaService.getTag('name="description"')?.content).toBe('Presentación editorial de la constructora.');
      expect(metaService.getTag('name="robots"')?.content).toBe('index, follow');
      expect(metaService.getTag('property="og:image"')?.content).toBe('https://cdn.isanorte.com/portada.jpg');
    });

    it('falls back to defaults when page is null', () => {
      applyPublicPageSeo(titleService, metaService, null, defaults);

      expect(titleService.getTitle()).toBe('Nosotros | ISANORTE');
      expect(metaService.getTag('name="description"')?.content).toBe('Conoce la trayectoria de ISANORTE.');
      expect(metaService.getTag('name="robots"')?.content).toBe('index, follow');
      expect(metaService.getTag('property="og:image"')).toBeNull();
    });
  });

  describe('clearPublicPageSeo', () => {
    it('resets title, description and removes page-specific OpenGraph and robots tags', () => {
      titleService.setTitle('Título Específico');
      metaService.updateTag({ name: 'description', content: 'Desc específica' });
      metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });
      metaService.updateTag({ property: 'og:title', content: 'OG Específico' });
      metaService.updateTag({ property: 'og:description', content: 'OG Desc' });
      metaService.updateTag({ property: 'og:type', content: 'website' });
      metaService.updateTag({ property: 'og:image', content: 'https://cdn.isanorte.com/test.jpg' });

      clearPublicPageSeo(titleService, metaService);

      expect(titleService.getTitle()).toBe(BASE_SITE_TITLE);
      expect(metaService.getTag('name="description"')?.content).toBe(BASE_SITE_DESCRIPTION);
      expect(metaService.getTag('name="robots"')).toBeNull();
      expect(metaService.getTag('property="og:title"')).toBeNull();
      expect(metaService.getTag('property="og:description"')).toBeNull();
      expect(metaService.getTag('property="og:type"')).toBeNull();
      expect(metaService.getTag('property="og:image"')).toBeNull();
    });
  });
});
