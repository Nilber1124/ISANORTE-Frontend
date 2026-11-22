import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

import { IsadecorPublicationResponse } from '../../../data/models/isadecor-home/isadecor-home-response.model';
import { CommunityNetwork } from './community-networks';
import { SocialIcon } from './social-icon';

interface SocialCard {
  network: CommunityNetwork;
  /** Miniatura del último video cargado desde administración para esa red, si hay. */
  thumbnail: string | null;
  caption: string | null;
}

const PUBLICATION_NETWORK: Record<CommunityNetwork['kind'], string> = {
  instagram: 'INSTAGRAM',
  tiktok: 'TIKTOK',
  facebook: 'FACEBOOK',
};

/**
 * Una tarjeta por red social (Instagram, TikTok, Facebook) con la vista previa de su video y el nombre de la red.
 * Al pulsarla lleva al perfil de la empresa en esa red. No carga scripts de terceros.
 */
@Component({
  selector: 'app-social-cards',
  imports: [SocialIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="m-0 grid list-none gap-4 p-0 sm:grid-cols-3" data-social-cards>
      @for (card of cards(); track card.network.url) {
        <li>
          <a
            [href]="card.network.url"
            target="_blank"
            rel="noopener noreferrer"
            class="group relative block aspect-[16/10] overflow-hidden rounded-card bg-background-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:aspect-[3/4]"
            [attr.data-social-card]="card.network.kind"
          >
            @if (card.thumbnail) {
              <img
                [src]="card.thumbnail"
                alt=""
                width="480"
                height="640"
                loading="lazy"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            } @else {
              <span
                class="absolute inset-0 bg-gradient-to-br from-accent/30 via-background-muted to-background-soft"
                aria-hidden="true"
              ></span>
            }
            <span
              class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-black/20"
              aria-hidden="true"
            ></span>
            <span class="absolute inset-x-0 top-0 flex items-center justify-end gap-2 p-5 text-white">
              <app-social-icon [network]="card.network.kind" />
              <span class="text-heading-3 font-bold uppercase tracking-wide drop-shadow">{{
                card.network.label
              }}</span>
            </span>
            <span class="absolute inset-x-0 bottom-0 p-5 text-white">
              @if (card.caption) {
                <span class="line-clamp-2 block text-body-sm font-medium">{{ card.caption }}</span>
              }
              <span class="mt-2 inline-flex items-center gap-1 text-body-sm font-semibold underline-offset-2 group-hover:underline"
                >Ver perfil<span class="sr-only"> de {{ card.network.label }} (se abre en otra pestaña)</span> →</span
              >
            </span>
          </a>
        </li>
      }
    </ul>
  `,
})
export class SocialCards {
  readonly networks = input.required<readonly CommunityNetwork[]>();
  readonly items = input<readonly IsadecorPublicationResponse[]>([]);

  protected readonly cards = computed<readonly SocialCard[]>(() =>
    this.networks().map((network) => {
      const video = this.items().find((item) => item.red === PUBLICATION_NETWORK[network.kind]);
      return { network, thumbnail: video?.miniaturaUrl ?? null, caption: video?.titulo ?? null };
    }),
  );
}
