import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Footer } from './footer/footer';
import { Navbar } from './navbar/navbar';
import { WhatsappFloat } from '../../shared/components/whatsapp-float/whatsapp-float';
import { PublicSiteFacade } from './public-site.facade';
import { AnnouncementRibbon } from '../../features/announcements/announcement-ribbon';

@Component({
  selector: 'app-public-layout',
  imports: [RouterOutlet, Navbar, Footer, WhatsappFloat, AnnouncementRibbon],
  providers: [PublicSiteFacade],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PublicLayout {
  private readonly publicSite = inject(PublicSiteFacade);
  readonly whatsappHref = this.publicSite.whatsappHref;

  constructor() {
    this.publicSite.load();
  }
}
