import { ISADECOR_SOCIAL_NETWORKS } from '../../../core/config/public-site.config';
import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  computed,
  inject,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { IsadecorPublicationResponse } from '../../../data/models/isadecor-home/isadecor-home-response.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { PublicSiteFacade } from '../../../layouts/public-layout/public-site.facade';
import { CommunityGrid } from './community-grid';
import { CommunityNetwork } from './community-networks';
import { SocialIcon } from './social-icon';

/** Página con los videos de Instagram (y TikTok cuando se cargue) de ISADECOR. */
@Component({
  selector: 'app-isadecor-community',
  imports: [CommunityGrid, RouterLink, SocialIcon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="app-container py-12 sm:py-16">
      <header class="max-w-2xl">
        <p class="font-mono text-caption uppercase tracking-[0.12em] text-accent-strong">
          Comunidad
        </p>
        <h1 class="mt-3 text-heading-1 text-text-primary">Mira cómo quedan nuestros acabados</h1>
        <p class="mt-3 text-body-lg text-text-secondary">
          Instalaciones, antes y después y novedades, directo de nuestras redes.
        </p>
        @if (networks().length) {
          <p class="mt-5 flex flex-wrap gap-3">
            @for (network of networks(); track network.url) {
              <a
                [href]="network.url"
                target="_blank"
                rel="noopener noreferrer"
                class="inline-flex min-h-11 items-center gap-2 rounded-button border border-border-strong px-4 text-body-sm font-semibold text-text-primary hover:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
              >
                <app-social-icon [network]="network.kind" /> {{ network.label }}
              </a>
            }
          </p>
        }
      </header>

      @if (loading()) {
        <div class="mt-10 grid grid-cols-2 gap-3 md:grid-cols-4" aria-hidden="true">
          @for (s of skeletons; track s) {
            <div class="aspect-[4/5] animate-pulse rounded-card bg-background-muted"></div>
          }
        </div>
      } @else if (error()) {
        <p class="mt-10 text-body text-text-secondary">
          {{ error() }}
          <button type="button" class="ml-2 font-semibold text-accent underline" (click)="load()">
            Reintentar
          </button>
        </p>
      } @else if (items().length) {
        <div class="mt-10"><app-community-grid [items]="items()" /></div>
      } @else {
        <p
          class="mt-10 rounded-card border border-border bg-surface p-8 text-center text-body text-text-secondary"
        >
          Pronto compartiremos aquí nuestros videos.
          <a routerLink="/isadecor" class="ml-1 font-semibold text-accent-strong underline"
            >Volver a la tienda</a
          >
        </p>
      }
    </main>
  `,
})
export class Community {
  private readonly api = inject(PublicContentApiService);
  private readonly site = inject(PublicSiteFacade);

  readonly items = signal<readonly IsadecorPublicationResponse[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly skeletons = [0, 1, 2, 3];

  /** Instagram y TikTok de la empresa (los demás enlaces no se muestran aquí). */
  readonly networks = computed<CommunityNetwork[]>(() => [...ISADECOR_SOCIAL_NETWORKS]);

  constructor() {
    afterNextRender(() => this.load());
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api.getIsadecorCommunity('isanorte', 'isadecor').subscribe({
      next: (items) => {
        this.items.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar los videos.');
        this.loading.set(false);
      },
    });
  }
}
