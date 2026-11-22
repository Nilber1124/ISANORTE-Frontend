import { ChangeDetectionStrategy, Component, DestroyRef, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';

import { Footer } from './footer/footer';
import { Navbar } from './navbar/navbar';
import { WhatsappFloat } from '../../shared/components/whatsapp-float/whatsapp-float';
import { AccessibilityWidget } from '../../shared/components/accessibility-widget/accessibility-widget';
import { PublicSiteFacade } from './public-site.facade';
import { BrandService } from '../../core/services/brand.service';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, Navbar, Footer, WhatsappFloat, AccessibilityWidget],
  providers: [PublicSiteFacade],
  templateUrl: './public-layout.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayout {
  private readonly publicSite = inject(PublicSiteFacade);
  private readonly brand = inject(BrandService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  readonly whatsappHref = this.publicSite.whatsappHref;

  constructor() {
    this.brand.setBrand('isanorte');
    this.publicSite.load();

    // El mensaje de WhatsApp sigue a la página que ve el visitante.
    this.updateWhatsappMessage(this.router.url);
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((event) => this.updateWhatsappMessage(event.urlAfterRedirects));
  }

  private updateWhatsappMessage(url: string): void {
    this.publicSite.setCurrentUrl(url);
  }
}
