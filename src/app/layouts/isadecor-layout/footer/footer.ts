import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { pickCommunityNetworks } from '../../../features/isadecor/community/community-networks';
import { SocialIcon } from '../../../features/isadecor/community/social-icon';
import { PublicSiteFacade } from '../../public-layout/public-site.facade';

export interface IsadecorFooterLink {
  label: string;
  url: string;
}

@Component({
  selector: 'app-isadecor-footer',
  imports: [RouterLink, SocialIcon],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Footer {
  readonly facade = inject(PublicSiteFacade);

  readonly description = 'Paneles WPC, planchas SPC, pisos y cielos rasos para tus interiores.';

  readonly shop: IsadecorFooterLink[] = [
    { label: 'Productos', url: '/isadecor/productos' },
    { label: 'Catálogos PDF', url: '/isadecor/catalogos' },
    { label: 'Seguimiento de mi pedido', url: '/isadecor/mi-cuenta' },
    { label: 'Comunidad', url: '/isadecor/comunidad' },
  ];

  /**
   * Ayuda (muestra): confirmar con el cliente y enlazar cada página cuando exista.
   * `url: null` se muestra atenuado hasta contar con el destino.
   */
  readonly help: readonly { label: string; url: string | null; whatsapp?: string }[] = [
    { label: 'Cambios y devoluciones', url: null },
    { label: 'Tipos de entrega', url: null },
    { label: 'Garantía de fábrica', url: null },
    {
      label: 'Venta para constructoras',
      url: null,
      whatsapp: 'Hola ISADECOR, quisiera una cotización para una constructora.',
    },
  ];

  /** Ayuda con el enlace de WhatsApp ya resuelto (null si no hay número comercial configurado). */
  readonly helpLinks = computed(() =>
    this.help.map((item) => ({
      ...item,
      whatsappHref: item.whatsapp ? this.facade.whatsappHrefFor(item.whatsapp) : null,
    })),
  );

  readonly networks = computed(() =>
    pickCommunityNetworks(this.facade.presentableSocialNetworks()),
  );

  readonly payments = 'Visa · Mastercard · Yape · Plin · Transferencia';

  readonly whatsappHref = this.facade.whatsappHref;

  readonly copyright = '© 2026 ISADECOR. Todos los derechos reservados.';

  readonly direccionIsadecor = computed(() =>
    [this.facade.address(), this.facade.city()].filter((value) => value !== null).join(', '),
  );
  readonly mapUrlIsadecor = 'https://www.google.com/maps?q=-7.1462778,-78.5206944';
}
