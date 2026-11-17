import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { PUBLIC_NAVIGATION_LINKS } from '../public-navigation';
import { PublicSiteFacade } from '../public-site.facade';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  readonly facade = inject(PublicSiteFacade);
  /** Contacto tiene botón propio en la cabecera, así que no se repite en la lista. */
  readonly navigationLinks = PUBLIC_NAVIGATION_LINKS.filter((link) => link.url !== '/contacto');
  readonly mobileMenuOpen = signal(false);
  readonly whatsappHref = this.facade.whatsappHref;
  readonly phone = computed(() => this.facade.contactPhones()[0] ?? null);
  /** Solo se muestra el teléfono si es un número distinto al de WhatsApp (si no, sería repetido). */
  readonly phoneHref = computed(() => {
    const phone = this.phone();
    if (!phone) return null;
    const digits = phone.replace(/\D/g, '');
    if (digits && digits === this.facade.whatsappNumber()) return null;
    return `tel:${phone.replace(/[^\d+]/g, '')}`;
  });

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeNavigation(): void {
    this.mobileMenuOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.closeNavigation();
  }
}
