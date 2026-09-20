import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { Button } from '../../../shared/components/button/button';
import { PublicLayoutFacade, PublicLayoutResourceState } from '../public-layout.facade';

export interface NavbarLink {
  label: string;
  url: string;
  isAccent?: boolean;
}

const PRIMARY_LINKS: readonly NavbarLink[] = [
  { label: 'Inicio', url: '/' },
  { label: 'Nosotros', url: '/nosotros' },
  { label: 'Servicios', url: '/servicios' },
  { label: 'Proyectos', url: '/proyectos' },
  { label: 'Contacto', url: '/contacto' },
];

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive, Button],
  templateUrl: './navbar.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Navbar {
  readonly facade = inject(PublicLayoutFacade);
  readonly mobileMenuOpen = signal(false);
  readonly failedLogoUrl = signal<string | null>(null);
  private readonly mobileMenuButton = viewChild<ElementRef<HTMLButtonElement>>('mobileMenuButton');

  readonly brandName = computed(() => {
    const companyName = this.facade.company()?.nombreComercial.trim();
    if (companyName) return companyName;

    const siteTitle = this.facade.siteConfig()?.tituloSitio?.trim();
    if (siteTitle) return siteTitle;

    return this.allowsBrandFallback() ? 'ISANORTE' : null;
  });

  readonly logoUrl = computed(() => {
    const logoUrl = this.safeImageUrl(this.facade.siteConfig()?.logoUrl);
    return logoUrl === this.failedLogoUrl() ? null : logoUrl;
  });

  readonly showFallbackSubtitle = computed(() => {
    const hasCompanyName = Boolean(this.facade.company()?.nombreComercial.trim());
    const hasSiteTitle = Boolean(this.facade.siteConfig()?.tituloSitio?.trim());
    return !hasCompanyName && !hasSiteTitle && this.allowsBrandFallback();
  });

  readonly isadecorUnit = computed(
    () =>
      this.facade.businessUnits().find((unit) => unit.slug.trim().toLowerCase() === 'isadecor') ??
      null,
  );

  readonly showIsadecor = computed(
    () => this.isadecorUnit() !== null || this.usesFallback(this.facade.businessUnitsState()),
  );

  readonly links = computed<readonly NavbarLink[]>(() => {
    if (!this.showIsadecor()) return PRIMARY_LINKS;

    return [
      ...PRIMARY_LINKS,
      {
        label: this.isadecorUnit()?.nombre.trim() || 'ISADECOR',
        url: '/isadecor',
        isAccent: true,
      },
    ];
  });

  readonly isadecorCtaLabel = computed(
    () => `Conoce ${this.isadecorUnit()?.nombre.trim() || 'ISADECOR'} ↗`,
  );

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  handleLogoError(): void {
    const logoUrl = this.logoUrl();
    if (logoUrl) this.failedLogoUrl.set(logoUrl);
  }

  @HostListener('document:keydown.escape')
  closeMobileMenuWithEscape(): void {
    if (!this.mobileMenuOpen()) return;

    this.mobileMenuOpen.set(false);
    this.mobileMenuButton()?.nativeElement.focus();
  }

  private allowsBrandFallback(): boolean {
    return (
      this.facade.hasAmbiguousCompany() ||
      this.facade.hasAmbiguousSiteConfig() ||
      this.usesFallback(this.facade.companyState()) ||
      this.usesFallback(this.facade.siteConfigState())
    );
  }

  private safeImageUrl(value: string | null | undefined): string | null {
    const imageUrl = value?.trim();
    if (!imageUrl) return null;
    if (imageUrl.startsWith('/')) return imageUrl;

    try {
      const url = new URL(imageUrl);
      return url.protocol === 'http:' || url.protocol === 'https:' ? imageUrl : null;
    } catch {
      return null;
    }
  }

  private usesFallback(state: PublicLayoutResourceState): boolean {
    return state === 'error' || state === 'ssr-blocked';
  }
}
