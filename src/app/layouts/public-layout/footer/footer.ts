import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocationMap } from '../../../shared/components/location-map/location-map';
import { PUBLIC_NAVIGATION_LINKS } from '../public-navigation';
import { PublicSiteFacade } from '../public-site.facade';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink, LocationMap],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly facade = inject(PublicSiteFacade);
  readonly navigationLinks = PUBLIC_NAVIGATION_LINKS;
  readonly currentYear = new Date().getFullYear();

  readonly direccionIsanorte = computed(() =>
    [this.facade.address(), this.facade.city()].filter((value) => value !== null).join(', '),
  );
  readonly mapEmbedUrlIsanorte =
    'https://www.google.com/maps?q=-7.1462778,-78.5206944&output=embed';
  readonly mapUrlIsanorte = 'https://www.google.com/maps?q=-7.1462778,-78.5206944';
}
