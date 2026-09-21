import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PublicSiteFacade } from '../../public-layout/public-site.facade';

export interface IsadecorFooterLink {
  label: string;
  url: string;
}

@Component({
  selector: 'app-isadecor-footer',
  imports: [RouterLink],
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
}