import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface IsadecorNavLink {
  label: string;
  url: string;
  exact?: boolean;
}

@Component({
  selector: 'app-isadecor-navbar',
  imports: [NgClass, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  readonly links: IsadecorNavLink[] = [
    { label: 'Inicio', url: '/isadecor', exact: true },
    { label: 'Catálogo', url: '/isadecor/catalogo' },
    { label: 'Productos', url: '/isadecor/catalogo' },
    { label: 'Cotización', url: '/isadecor/cotizacion' },
  ];

  readonly menuOpen = signal(false);

  protected toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}