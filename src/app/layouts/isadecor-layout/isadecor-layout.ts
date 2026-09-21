import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Footer } from './footer/footer';
import { Navbar } from './navbar/navbar';
import { PublicSiteFacade } from '../public-layout/public-site.facade';

@Component({
  selector: 'app-isadecor-layout',
  imports: [RouterOutlet, Navbar, Footer],
  providers: [PublicSiteFacade],
  templateUrl: './isadecor-layout.html',
  styleUrl: './isadecor-layout.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IsadecorLayout {
  private readonly publicSite = inject(PublicSiteFacade);

  constructor() {
    this.publicSite.load();
  }
}