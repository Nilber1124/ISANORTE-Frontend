import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HomeRibbonItem } from '../isadecor-home.model';

/**
 * Cinta de avisos: franja de color de marca con textos cortos que avanzan despacio.
 * Se pausa al pasar el cursor o enfocar un enlace; con movimiento reducido queda estática.
 */
@Component({
  selector: 'app-home-ribbon',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    .track {
      animation: ribbon-scroll 45s linear infinite;
    }
    .ribbon:hover .track,
    .ribbon:focus-within .track {
      animation-play-state: paused;
    }
    @keyframes ribbon-scroll {
      to {
        transform: translateX(-50%);
      }
    }
    @media (prefers-reduced-motion: reduce) {
      .track {
        animation: none;
        flex-wrap: wrap;
        justify-content: center;
        width: 100%;
      }
      .copy:last-child {
        display: none;
      }
    }
  `,
  template: `
    <aside class="ribbon overflow-hidden border-y border-text-primary text-text-primary" aria-label="Avisos de ISADECOR">
      <div class="track flex w-max py-2.5">
        @for (copy of copies; track copy) {
          <ul class="copy flex shrink-0 items-center" [attr.aria-hidden]="copy === 1 ? 'true' : null">
            @for (item of items(); track item.texto) {
              <li class="flex items-center whitespace-nowrap font-mono text-caption font-medium uppercase tracking-[0.12em]">
                @if (item.enlace; as link) {
                  <a [routerLink]="path(link)" [queryParams]="params(link)" [attr.tabindex]="copy === 1 ? -1 : null"
                    class="px-6 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:underline">{{ item.texto }}</a>
                } @else {
                  <span class="px-6">{{ item.texto }}</span>
                }
                <span aria-hidden="true" class="text-accent-strong">/</span>
              </li>
            }
          </ul>
        }
      </div>
    </aside>
  `,
})
export class HomeRibbon {
  readonly items = input.required<readonly HomeRibbonItem[]>();
  protected readonly copies = [0, 1];

  protected path(link: string): string {
    return link.split('?')[0];
  }

  protected params(link: string): Record<string, string> | null {
    const query = link.split('?')[1];
    return query ? Object.fromEntries(new URLSearchParams(query)) : null;
  }
}
