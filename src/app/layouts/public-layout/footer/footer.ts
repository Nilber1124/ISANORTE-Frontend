import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface FooterLink {
  label: string;
  url: string;
}

export interface FooterData {
  companyInfo: { logoText: string; description: string };
  navigation: FooterLink[];
  services: FooterLink[];
  contact: { email: string; phone: string; address: string };
  socials: { icon: string; url: string }[];
  copyright: string;
}

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly footerData: FooterData = {
    companyInfo: {
      logoText: 'ISANORTE',
      description:
        'Transformamos espacios elevando el nivel de infraestructura, diseño, confort y estética, superando tus expectativas.',
    },
    navigation: [
      { label: 'Inicio', url: '/' },
      { label: 'Nosotros', url: '/nosotros' },
      { label: 'Catálogo', url: '/isadecor' },
      { label: 'Proyectos', url: '/proyectos' },
      { label: 'Contacto', url: '/contacto' },
    ],
    services: [
      { label: 'Construcción', url: '#' },
      { label: 'Acabados Premium', url: '#' },
      { label: 'Diseño e Interiorismo', url: '#' },
      { label: 'Arquitectura', url: '#' },
    ],
    contact: {
      email: 'hola@isanorte.com',
      phone: '+593 (0) 999 999 999',
      address: 'Quito, Ecuador',
    },
    socials: [
      { icon: 'instagram', url: '#' },
      { icon: 'linkedin', url: '#' },
      { icon: 'facebook', url: '#' },
    ],
    copyright: '© 2024 ISANORTE. Todos los derechos reservados.',
  };
}
