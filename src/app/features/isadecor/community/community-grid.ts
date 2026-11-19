import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

import { IsadecorPublicationResponse } from '../../../data/models/isadecor-home/isadecor-home-response.model';

const INSTAGRAM_POST = /^https:\/\/(www\.)?instagram\.com\/(p|reel|reels|tv)\/([A-Za-z0-9_-]+)\/?$/;
const TIKTOK_VIDEO = /^https:\/\/(www\.)?tiktok\.com\/@[^/]+\/video\/(\d+)/;

/**
 * Cuadrícula de videos de redes sociales. Solo se muestra la miniatura: el reproductor de la red
 * se carga al abrir un video, así la página no descarga scripts de terceros.
 */
@Component({
  selector: 'app-community-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:gap-4 md:grid-cols-4">
      @for (item of items(); track item.url) {
        <li>
          <button
            type="button"
            (click)="open(item)"
            class="filete-b group relative block aspect-[4/5] w-full overflow-hidden rounded-card bg-background-muted text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            [attr.aria-label]="'Ver video: ' + label(item)"
          >
            @if (item.miniaturaUrl) {
              <img
                [src]="item.miniaturaUrl"
                alt=""
                width="400"
                height="500"
                loading="lazy"
                class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            }
            <span
              class="absolute inset-0 flex items-center justify-center bg-black/20 transition-colors group-hover:bg-black/30"
              aria-hidden="true"
            >
              <span
                class="flex size-12 items-center justify-center rounded-full bg-white/90 text-black"
              >
                <svg class="ml-0.5 size-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
            </span>
            @if (item.titulo) {
              <span
                class="absolute inset-x-0 bottom-0 line-clamp-2 bg-gradient-to-t from-black/75 to-transparent p-3 pt-8 text-body-sm font-medium text-white"
                >{{ item.titulo }}</span
              >
            }
          </button>
        </li>
      }
    </ul>

    @if (selected(); as video) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="label(video)"
        (click)="close()"
        (keydown.escape)="close()"
      >
        <div class="relative w-full max-w-sm" (click)="$event.stopPropagation()">
          <button
            type="button"
            class="absolute -top-11 right-0 min-h-10 rounded-button bg-white px-4 text-body-sm font-semibold text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
            (click)="close()"
          >
            Cerrar
          </button>
          @if (embed(); as src) {
            <iframe
              [src]="src"
              class="h-[34rem] max-h-[80svh] w-full rounded-card bg-white"
              [title]="label(video)"
              loading="lazy"
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowfullscreen
            ></iframe>
          }
          <a
            [href]="video.url"
            target="_blank"
            rel="noopener noreferrer"
            class="mt-3 block text-center text-body-sm font-semibold text-white underline"
            >Ver en {{ video.red === 'TIKTOK' ? 'TikTok' : 'Instagram' }}</a
          >
        </div>
      </div>
    }
  `,
})
export class CommunityGrid {
  private readonly sanitizer = inject(DomSanitizer);

  readonly items = input.required<readonly IsadecorPublicationResponse[]>();
  protected readonly selected = signal<IsadecorPublicationResponse | null>(null);

  /** Solo se incrusta una URL que cumple el patrón exacto de la red; si no, queda el enlace externo. */
  protected readonly embed = computed<SafeResourceUrl | null>(() => {
    const video = this.selected();
    if (!video) return null;
    const instagram = INSTAGRAM_POST.exec(video.url);
    if (video.red === 'INSTAGRAM' && instagram) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.instagram.com/${instagram[2] === 'reels' ? 'reel' : instagram[2]}/${instagram[3]}/embed/`,
      );
    }
    const tiktok = TIKTOK_VIDEO.exec(video.url);
    if (video.red === 'TIKTOK' && tiktok) {
      return this.sanitizer.bypassSecurityTrustResourceUrl(
        `https://www.tiktok.com/player/v1/${tiktok[2]}`,
      );
    }
    return null;
  });

  protected label(item: IsadecorPublicationResponse): string {
    return item.titulo || (item.red === 'TIKTOK' ? 'Video de TikTok' : 'Video de Instagram');
  }

  protected open(item: IsadecorPublicationResponse): void {
    this.selected.set(item);
  }

  protected close(): void {
    this.selected.set(null);
  }
}
