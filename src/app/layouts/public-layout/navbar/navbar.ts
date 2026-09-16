import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Button } from '../../../shared/components/button/button';

export interface NavbarLink {
  label: string;
  url: string;
  isAccent?: boolean;
}

export interface NavbarData {
  logoText: string;
  links: NavbarLink[];
  cta: { label: string; url: string };
}

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, Button],
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  readonly navbarData: NavbarData = {
    logoText: 'ISANORTE',
    links: [
      { label: 'Inicio', url: '/' },
      { label: 'Nosotros', url: '/nosotros' },
      { label: 'Servicios', url: '/servicios' },
      { label: 'Proyectos', url: '/proyectos' },
      { label: 'Contacto', url: '/contacto' },
      { label: 'ISADECOR', url: '/isadecor', isAccent: true },
    ],
    cta: { label: 'Conoce ISADECOR ↗', url: '/isadecor' },
  };
}
