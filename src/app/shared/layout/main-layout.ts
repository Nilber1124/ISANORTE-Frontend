import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

import { Button } from '../components/button/button';

export interface NavbarLink { label: string; url: string; isAccent?: boolean; }
export interface NavbarData { logoUrl: string; links: NavbarLink[]; cta: { label: string; url: string; }; }
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
  selector: 'app-main-layout',
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, Button],
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MainLayout {
  readonly navbarData: NavbarData = {
    logoUrl: '/assets/logo.svg',
    links: [
      { label: 'Inicio', url: '/' },
      { label: 'Nosotros', url: '/nosotros' },
      { label: 'Servicios', url: '/servicios' },
      { label: 'Proyectos', url: '/proyectos' },
      { label: 'Contacto', url: '/contacto' },
      { label: 'ISADECOR', url: '/isadecor', isAccent: true }
    ],
    cta: { label: 'Conoce ISADECOR ↗', url: '/isadecor' }
  };

  readonly footerData: FooterData = {
    companyInfo: {
      logoText: 'ISANORTE',
      description: 'Transformamos espacios elevando el nivel de infraestructura, diseño, confort y estética, superando tus expectativas.'
    },
    navigation: [
      { label: 'Inicio', url: '/' },
      { label: 'Nosotros', url: '/nosotros' },
      { label: 'Catálogo', url: '/isadecor' },
      { label: 'Proyectos', url: '/proyectos' },
      { label: 'Contacto', url: '/contacto' }
    ],
    services: [
      { label: 'Construcción', url: '#' },
      { label: 'Acabados Premium', url: '#' },
      { label: 'Diseño e Interiorismo', url: '#' },
      { label: 'Arquitectura', url: '#' }
    ],
    contact: {
      email: 'hola@isanorte.com',
      phone: '+593 (0) 999 999 999',
      address: 'Quito, Ecuador'
    },
    socials: [
      { icon: 'instagram', url: '#' },
      { icon: 'linkedin', url: '#' },
      { icon: 'facebook', url: '#' }
    ],
    copyright: '© 2024 ISANORTE. Todos los derechos reservados.'
  };
}