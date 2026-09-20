import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { LandingSectionResponse } from '../../../data/models/landing-section/landing-section-response.model';

// Shared Components
import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { Carousel } from '../../../shared/components/carousel/carousel';
import {
  CinematicTour,
  CinematicScene,
} from '../../../shared/components/cinematic-tour/cinematic-tour';
import { PublicHomeFacade, PublicHomeResourceState } from './public-home.facade';

// Interfaces
export interface HeroData {
  tag: string;
  title: string;
  subtitle: string;
  bgImageUrl: string;
  primaryBtn: { label: string; url: string };
  secondaryBtn: { label: string; url: string };
}
export interface TrustStripData {
  text: string;
  logos: { url: string; alt: string }[];
}
export interface ServiceCard {
  id: string;
  title: string;
  description: string;
  bgImageUrl: string;
  linkUrl?: string;
}
export interface HighlightGalleryItem {
  id: string;
  imageUrl: string;
}
export interface HighlightData {
  tag: string;
  title: string;
  description: string;
  bgImageUrl: string;
  topRightImageUrl: string;
  galleryImages: HighlightGalleryItem[];
  primaryBtn: { label: string; url: string };
  secondaryBtn: { label: string; url: string };
}
export interface ProjectCard {
  id: string;
  title: string;
  location: string;
  bgImageUrl: string;
  linkUrl?: string;
}
export interface PreFooterData {
  title: string;
  subtitle: string;
  cta: { label: string; url: string };
}

interface HomeSectionContent {
  eyebrow: string | null;
  title: string | null;
  content: string | null;
  cta: { label: string; url: string } | null;
}

interface HomeCtaContent {
  title: string | null;
  subtitle: string | null;
  content: string | null;
  imageUrl: string;
  cta: { label: string; url: string } | null;
}

const SERVICE_FALLBACK_IMAGE = '/images/servicios-construccion.jpg';
const PROJECT_FALLBACK_IMAGE = '/images/residencia-aura.jpg';
const CTA_FALLBACK_IMAGE = '/images/asesora-consultoria.jpg';
@Component({
  imports: [CommonModule, Button, Card, Badge, Carousel, CinematicTour],
  providers: [PublicHomeFacade],
  selector: 'app-isanorte-home',
  styleUrl: './home.css',
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  readonly facade = inject(PublicHomeFacade);

  readonly heroData: HeroData = {
    tag: 'EMPRESA DE ARQUITECTURA Y CONSTRUCCIÓN',
    title: 'Transformamos espacios\nen experiencias',
    subtitle: 'Soluciones profesionales para construcción, obra civil y acabados.',
    bgImageUrl: '/images/recorrido-exterior.jpg',
    primaryBtn: { label: 'SOLICITAR COTIZACIÓN', url: '#cotizar' },
    secondaryBtn: { label: 'HABLA CON UN ASESOR', url: '#contacto' },
  };

  readonly heroScenes: CinematicScene[] = [
    { id: 'exterior', imageUrl: '/images/recorrido-exterior.jpg' },
    { id: 'sala', imageUrl: '/images/recorrido-sala.jpg' },
    { id: 'cocina', imageUrl: '/images/recorrido-cocina.jpg' },
    { id: 'bano', imageUrl: '/images/recorrido-bano.jpg' },
    { id: 'dormitorio', imageUrl: '/images/recorrido-dormitorio.jpg' },
  ];

  readonly trustStripData: TrustStripData = {
    text: 'RESPALDADO POR PRIMERAS MARCAS DE DISEÑO Y COMPRA',
    logos: [
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg',
        alt: 'Google',
      },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', alt: 'Amazon' },
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg',
        alt: 'Netflix',
      },
      {
        url: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg',
        alt: 'Microsoft',
      },
    ],
  };

  readonly fallbackServices: ServiceCard[] = [
    {
      id: '1',
      title: 'Construcción Obra Civil',
      description:
        'Estructuras de hormigón armado, edificaciones comerciales e industriales con los más altos estándares.',
      bgImageUrl:
        'https://casasinhaus.com/wp-content/uploads/2021/02/piscina-Mallorca-inHAUS-destacada.jpg',
      linkUrl: '#',
    },
    {
      id: '2',
      title: 'Acabados & Revestimientos',
      description:
        'Instalación de porcelanatos, mármol, madera y microcemento con acabados de primera calidad.',
      bgImageUrl:
        'https://media.revistaad.es/photos/62bafacd4b8d2632f05347be/16:9/w_1920,c_limit/la-plage-foto-portada.jpg',
      linkUrl: '#',
    },
    {
      id: '3',
      title: 'Diseño & Interiorismo',
      description:
        'Creación de espacios funcionales y estéticos que reflejan tu estilo y personalidad.',
      bgImageUrl:
        'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
      linkUrl: '#',
    },
  ];

  readonly highlightData: HighlightData = {
    tag: 'NUEVA LÍNEA DE MOBILIARIO A MEDIDA',
    title: 'ISADECOR: Espacios que\ninspiran.',
    description:
      'Diseño interior y mobiliario a medida. Creamos atmósferas únicas que reflejan la esencia de quienes las habitan, uniendo materiales premium con estética atemporal.',
    bgImageUrl: '/images/isadecor-fondo.jpg',
    topRightImageUrl: '/images/isadecor-top.jpg',
    galleryImages: [
      { id: 'g1', imageUrl: '/images/isadecor-left-1.jpg' },
      { id: 'g2', imageUrl: '/images/isadecor-left-2.jpg' },
    ],
    primaryBtn: { label: 'CONOCE ISADECOR', url: '#isadecor' },
    secondaryBtn: { label: 'DESCARGAR CATÁLOGO (PDF)', url: '#catalogo' },
  };

  readonly fallbackProjects: ProjectCard[] = [
    {
      id: 'p1',
      title: 'Residencia Aura',
      location: 'Valle de los Chillos, Quito - Proyecto 2024',
      bgImageUrl: '/images/residencia-aura.jpg',
      linkUrl: '#',
    },
    {
      id: 'p2',
      title: 'Edificio Tech-Corporate',
      location: 'Sector Financiero, Quito - Proyecto 2023',
      bgImageUrl:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
      linkUrl: '#',
    },
  ];

  readonly preFooterData: PreFooterData = {
    title: '¿Tienes un proyecto en mente?',
    subtitle:
      'Ofrecemos asesoría técnica integral sin costo para la estimación inicial de tu obra o acabados.',
    cta: { label: 'SOLICITAR ASESORÍA GRATUITA', url: '#contacto' },
  };

  readonly servicesSectionContent = computed<HomeSectionContent | null>(() => {
    if (this.usesFallback(this.facade.sectionsState())) {
      return {
        eyebrow: 'Nuestros Servicios',
        title: 'Soluciones integrales de alta\ningeniería y diseño',
        content: null,
        cta: { label: 'VER TODOS LOS SERVICIOS', url: '#' },
      };
    }

    return this.facade.sectionsState() === 'success'
      ? this.mapSectionContent(this.facade.servicesSection())
      : null;
  });

  readonly serviceCards = computed<readonly ServiceCard[]>(() => {
    if (this.usesFallback(this.facade.servicesState())) return this.fallbackServices;
    if (this.facade.servicesState() !== 'success') return [];

    return this.facade.homeServices().map((service) => ({
      id: service.id,
      title: service.nombre,
      description: service.resumen?.trim() || service.descripcion,
      bgImageUrl: this.safeImageUrl(service.imagenUrl, SERVICE_FALLBACK_IMAGE),
    }));
  });

  readonly projectsSectionContent = computed<HomeSectionContent | null>(() => {
    if (this.usesFallback(this.facade.sectionsState())) {
      return {
        eyebrow: 'Obra en destacado',
        title: 'Excelencia entregada en cada\nmetro cuadrado',
        content: null,
        cta: { label: 'VER TODOS LOS PROYECTOS', url: '#' },
      };
    }

    return this.facade.sectionsState() === 'success'
      ? this.mapSectionContent(this.facade.projectsSection())
      : null;
  });

  readonly projectCards = computed<readonly ProjectCard[]>(() => {
    if (this.usesFallback(this.facade.projectsState())) return this.fallbackProjects;
    if (this.facade.projectsState() !== 'success') return [];

    return this.facade.homeProjects().map((project) => ({
      id: project.id,
      title: project.nombre,
      location: [project.ubicacion?.trim(), project.fechaProyecto?.trim(), project.cliente?.trim()]
        .filter((value): value is string => Boolean(value))
        .join(' · '),
      bgImageUrl: this.safeImageUrl(this.facade.projectImage(project), PROJECT_FALLBACK_IMAGE),
    }));
  });

  readonly ctaContent = computed<HomeCtaContent | null>(() => {
    if (this.usesFallback(this.facade.sectionsState())) {
      return {
        title: this.preFooterData.title,
        subtitle: this.preFooterData.subtitle,
        content: null,
        imageUrl: CTA_FALLBACK_IMAGE,
        cta: this.preFooterData.cta,
      };
    }

    if (this.facade.sectionsState() !== 'success') return null;
    const section = this.facade.ctaSection();
    if (section === null) return null;

    return {
      title: section.titulo,
      subtitle: section.subtitulo,
      content: section.contenido,
      imageUrl: this.safeImageUrl(section.imagenUrl, CTA_FALLBACK_IMAGE),
      cta: this.mapCta(section),
    };
  });

  constructor() {
    this.facade.load();
  }

  protected useFallbackImage(event: Event, fallbackUrl: string): void {
    const image = event.target;
    if (!(image instanceof HTMLImageElement) || image.dataset['fallbackApplied'] === 'true') return;

    image.dataset['fallbackApplied'] = 'true';
    image.src = fallbackUrl;
  }

  private mapSectionContent(section: LandingSectionResponse | null): HomeSectionContent | null {
    if (section === null) return null;

    return {
      eyebrow: section.subtitulo,
      title: section.titulo,
      content: section.contenido,
      cta: this.mapCta(section),
    };
  }

  private mapCta(section: LandingSectionResponse): { label: string; url: string } | null {
    const label = section.textoBoton?.trim();
    const url = this.safeLink(section.enlaceBoton);
    return label && url ? { label, url } : null;
  }

  private safeLink(value: string | null): string | null {
    const link = value?.trim();
    if (!link) return null;
    if (link.startsWith('/') || link.startsWith('#')) return link;

    try {
      const url = new URL(link);
      return ['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol) ? link : null;
    } catch {
      return null;
    }
  }

  private safeImageUrl(value: string | null, fallbackUrl: string): string {
    const imageUrl = value?.trim();
    if (!imageUrl) return fallbackUrl;
    if (imageUrl.startsWith('/')) return imageUrl;

    try {
      const url = new URL(imageUrl);
      return url.protocol === 'http:' || url.protocol === 'https:' ? imageUrl : fallbackUrl;
    } catch {
      return fallbackUrl;
    }
  }

  private usesFallback(state: PublicHomeResourceState): boolean {
    return state === 'error' || state === 'ssr-blocked';
  }
}
