import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { LocationMap } from '../../../shared/components/location-map/location-map';
import { PublicSiteFacade } from '../../public-layout/public-site.facade';

export interface IsadecorFooterLink {
  label: string;
  url: string;
}

@Component({
  selector: 'app-isadecor-footer',
  imports: [RouterLink, LocationMap],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly facade = inject(PublicSiteFacade);

  readonly description =
    'Acabados y revestimientos para interiores: paneles WPC, planchas SPC y cielos rasos PVC para elevar el confort y la estética de tus espacios.';

  readonly navigation: IsadecorFooterLink[] = [
    { label: 'Inicio', url: '/isadecor' },
    { label: 'Catálogo', url: '/isadecor/catalogo' },
    { label: 'Cotización', url: '/isadecor/cotizacion' },
  ];

  readonly collections: IsadecorFooterLink[] = [
    { label: 'Paneles WPC', url: '/isadecor/catalogo' },
    { label: 'Planchas SPC', url: '/isadecor/catalogo' },
    { label: 'Cielos rasos PVC', url: '/isadecor/catalogo' },
  ];

  readonly copyright = '© 2025 ISADECOR. Todos los derechos reservados.';

  readonly direccionIsadecor = computed(() =>
    [this.facade.address(), this.facade.city()].filter((value) => value !== null).join(', '),
  );
  readonly mapEmbedUrlIsadecor = computed(() =>
    this.googleMapsUrl(this.direccionIsadecor(), true),
  );
  readonly mapUrlIsadecor = computed(() => this.googleMapsUrl(this.direccionIsadecor(), false));

  private googleMapsUrl(direccion: string, embed: boolean): string {
    const query = encodeURIComponent(direccion);
    return embed
      ? `https://www.google.com/maps?q=${query}&output=embed`
      : `https://www.google.com/maps/search/?api=1&query=${query}`;
  }
}
