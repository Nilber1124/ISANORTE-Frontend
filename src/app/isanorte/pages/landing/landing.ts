import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

// Shared Components
import { Button } from '../../../shared/components/button/button';
import { Card } from '../../../shared/components/card/card';
import { SectionTitle } from '../../../shared/components/section-title/section-title';
import { Badge } from '../../../shared/components/badge/badge';
import { ChangeDetectionStrategy } from '@angular/core';

// Interfaces
export interface NavbarLink { label: string; url: string; isActive?: boolean; isAccent?: boolean; }
export interface NavbarData { logoUrl: string; links: NavbarLink[]; cta: { label: string; url: string; }; }
export interface HeroData { tag: string; title: string; subtitle: string; bgImageUrl: string; primaryBtn: { label: string; url: string; }; secondaryBtn: { label: string; url: string; }; }
export interface TrustStripData { text: string; logos: { url: string; alt: string; }[]; }
export interface ServiceCard { id: string; title: string; description: string; bgImageUrl: string; linkUrl: string; }
export interface HighlightData { tag: string; title: string; description: string; imageUrl: string; primaryBtn: { label: string; url: string; }; secondaryBtn: { label: string; url: string; }; }
export interface ProjectCard { id: string; title: string; location: string; bgImageUrl: string; }
export interface PreFooterData { title: string; subtitle: string; cta: { label: string; url: string; }; }
export interface FooterLink { label: string; url: string; }
export interface FooterData {
  companyInfo: { logoText: string; description: string; };
  navigation: FooterLink[];
  services: FooterLink[];
  contact: { email: string; phone: string; address: string; };
  socials: { icon: string; url: string; }[];
  copyright: string;
}

@Component({
  imports: [CommonModule, RouterLink, Button, Card, SectionTitle, Badge],
  selector: 'app-landing',
  styleUrl: './landing.css',
  templateUrl: './landing.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Landing {

  readonly heroData: HeroData = {
    tag: 'EMPRESA DE ARQUITECTURA Y CONSTRUCCIÓN',
    title: 'Transformamos espacios\nen experiencias',
    subtitle: 'Soluciones profesionales para construcción, obra civil y acabados.',
    bgImageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop',
    primaryBtn: { label: 'SOLICITAR COTIZACIÓN', url: '#cotizar' },
    secondaryBtn: { label: 'HABLA CON UN ASESOR', url: '#contacto' }
  };

  readonly trustStripData: TrustStripData = {
    text: 'RESPALDADO POR PRIMERAS MARCAS DE DISEÑO Y COMPRA',
    logos: [
      { url: 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', alt: 'Google' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', alt: 'Amazon' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Netflix_2015_logo.svg', alt: 'Netflix' },
      { url: 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg', alt: 'Microsoft' }
    ]
  };

  readonly services: ServiceCard[] = [
    {
      id: '1',
      title: 'Construcción Obra Civil',
      description: 'Estructuras de hormigón armado, edificaciones comerciales e industriales con los más altos estándares.',
      bgImageUrl: 'https://casasinhaus.com/wp-content/uploads/2021/02/piscina-Mallorca-inHAUS-destacada.jpg',
      linkUrl: '#'
    },
    {
      id: '2',
      title: 'Acabados & Revestimientos',
      description: 'Instalación de porcelanatos, mármol, madera y microcemento con acabados de primera calidad.',
      bgImageUrl: 'https://media.revistaad.es/photos/62bafacd4b8d2632f05347be/16:9/w_1920,c_limit/la-plage-foto-portada.jpg',
      linkUrl: '#'
    },
    {
      id: '3',
      title: 'Diseño & Interiorismo',
      description: 'Creación de espacios funcionales y estéticos que reflejan tu estilo y personalidad.',
      bgImageUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop',
      linkUrl: '#'
    }
  ];

  readonly highlightData: HighlightData = {
    tag: 'NUEVA LÍNEA DE MOBILIARIO A MEDIDA',
    title: 'ISADECOR: Espacios que\ninspiran.',
    description: 'Explora nuestra nueva sección de mobiliario y acabados para el hogar y oficina. Piezas únicas diseñadas y fabricadas con los mejores materiales. Uniendo funcionalidad, confort y estética para transformar tus espacios.',
    imageUrl: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=1000&auto=format&fit=crop',
    primaryBtn: { label: 'EXPLORAR ISADECOR', url: '#isadecor' },
    secondaryBtn: { label: 'DESCARGAR CATÁLOGO (PDF)', url: '#catalogo' }
  };

  readonly projects: ProjectCard[] = [
    {
      id: 'p1',
      title: 'Residencia Aura',
      location: 'Valle de los Chillos, Quito - Proyecto 2024',
      bgImageUrl: '/images/residencia-aura.jpg'
    },
    {
      id: 'p2',
      title: 'Edificio Tech-Corporate',
      location: 'Sector Financiero, Quito - Proyecto 2023',
      bgImageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop'
    }
  ];

  readonly preFooterData: PreFooterData = {
    title: '¿Tienes un proyecto en mente?',
    subtitle: 'Ofrecemos asesoría técnica integral sin costo para la estimación inicial de tu obra o acabados.',
    cta: { label: 'SOLICITAR ASESORÍA GRATUITA', url: '#contacto' }
  };
}
