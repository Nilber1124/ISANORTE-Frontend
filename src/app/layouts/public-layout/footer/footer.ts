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

  /** Red social reconocida por el nombre o el icono que trae la BD; `other` usa las iniciales. */
  socialKind(
    name: string,
  ): 'facebook' | 'instagram' | 'linkedin' | 'youtube' | 'tiktok' | 'x' | 'whatsapp' | 'other' {
    const value = name.toLowerCase();
    if (value.includes('facebook') || value === 'fb') return 'facebook';
    if (value.includes('instagram') || value === 'ig') return 'instagram';
    if (value.includes('linkedin')) return 'linkedin';
    if (value.includes('youtube') || value === 'yt') return 'youtube';
    if (value.includes('tiktok')) return 'tiktok';
    if (value === 'x' || value.includes('twitter')) return 'x';
    if (value.includes('whatsapp')) return 'whatsapp';
    return 'other';
  }
}
