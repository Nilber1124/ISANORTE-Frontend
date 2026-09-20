import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PUBLIC_NAVIGATION_LINKS } from '../public-navigation';
import { PublicSiteFacade } from '../public-site.facade';

@Component({
  selector: 'app-footer',
  imports: [CommonModule, RouterLink],
  templateUrl: './footer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly facade = inject(PublicSiteFacade);
  readonly navigationLinks = PUBLIC_NAVIGATION_LINKS;
  readonly currentYear = new Date().getFullYear();
}
