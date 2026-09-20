import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';

// Shared Components
import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { Carousel } from '../../../shared/components/carousel/carousel';
import { CinematicTour } from '../../../shared/components/cinematic-tour/cinematic-tour';
import { PublicHomeFacade } from './public-home.facade';

// Interfaces
export interface ServiceCard {
  id: string;
  title: string;
  description: string;
  bgImageUrl: string;
  linkUrl: string;
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
}
export interface PreFooterData {
  title: string;
  subtitle: string;
  cta: { label: string; url: string };
}
@Component({
  imports: [CommonModule, Button, Card, Badge, Carousel, CinematicTour],
  selector: 'app-isanorte-home',
  providers: [PublicHomeFacade],
  styleUrl: './home.css',
  templateUrl: './home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Home {
  readonly facade = inject(PublicHomeFacade);

  readonly services: ServiceCard[] = [
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

  readonly projects: ProjectCard[] = [
    {
      id: 'p1',
      title: 'Residencia Aura',
      location: 'Valle de los Chillos, Quito - Proyecto 2024',
      bgImageUrl: '/images/residencia-aura.jpg',
    },
    {
      id: 'p2',
      title: 'Edificio Tech-Corporate',
      location: 'Sector Financiero, Quito - Proyecto 2023',
      bgImageUrl:
        'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop',
    },
  ];

  readonly preFooterData: PreFooterData = {
    title: '¿Tienes un proyecto en mente?',
    subtitle:
      'Ofrecemos asesoría técnica integral sin costo para la estimación inicial de tu obra o acabados.',
    cta: { label: 'SOLICITAR ASESORÍA GRATUITA', url: '#contacto' },
  };

  constructor() {
    this.facade.load();
  }
}
