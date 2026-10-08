import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Footer } from './footer/footer';
import { Navbar } from './navbar/navbar';
import { PublicSiteFacade } from '../public-layout/public-site.facade';
import { WhatsappFloat } from '../../shared/components/whatsapp-float/whatsapp-float';
import { AnnouncementRibbon } from '../../features/announcements/announcement-ribbon';

@Component({
  selector: 'app-isadecor-layout',
  imports: [RouterOutlet, Navbar, Footer, WhatsappFloat, AnnouncementRibbon],
  providers: [PublicSiteFacade],
  templateUrl: './isadecor-layout.html',
  styleUrl: './isadecor-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IsadecorLayout {
  private readonly publicSite = inject(PublicSiteFacade);
  readonly whatsappHref = this.publicSite.whatsappHref;

  constructor() {
    this.publicSite.load();
  }
}
