import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
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
  readonly navigationLinks = PUBLIC_NAVIGATION_LINKS;
  readonly desktopUnitsOpen = signal(false);
  readonly mobileMenuOpen = signal(false);
  readonly mobileUnitsOpen = signal(false);

  private readonly elementRef = inject(ElementRef<HTMLElement>);

  toggleDesktopUnits(): void {
    this.desktopUnitsOpen.update((open) => !open);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen.update((open) => !open);
    if (!this.mobileMenuOpen()) this.mobileUnitsOpen.set(false);
  }

  toggleMobileUnits(): void {
    this.mobileUnitsOpen.update((open) => !open);
  }

  closeNavigation(): void {
    this.desktopUnitsOpen.set(false);
    this.mobileMenuOpen.set(false);
    this.mobileUnitsOpen.set(false);
  }

  @HostListener('document:keydown.escape')
  closeOnEscape(): void {
    this.closeNavigation();
  }

  @HostListener('document:click', ['$event'])
  closeDesktopOnOutsideClick(event: Event): void {
    const target = event.target;
    if (target instanceof Node && !this.elementRef.nativeElement.contains(target)) {
      this.desktopUnitsOpen.set(false);
    }
  }
}

