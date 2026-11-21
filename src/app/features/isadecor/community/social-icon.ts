import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/** Icono de Instagram, Facebook o TikTok, decorativo (el enlace que lo contiene lleva el nombre accesible). */
@Component({
  selector: 'app-social-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      class="size-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="1.8"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
    >
      @if (network() === 'facebook') {
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
      } @else if (network() === 'tiktok') {
        <path d="M14 3v11.5a3.5 3.5 0 1 1-3.5-3.5" />
        <path d="M14 3c.4 2.6 2 4.2 5 4.4" />
      } @else {
        <rect x="2" y="2" width="20" height="20" rx="5" />
        <path d="M16 11.4A4 4 0 1 1 12.6 8 4 4 0 0 1 16 11.4z" />
        <path d="M17.5 6.5h.01" />
      }
    </svg>
  `,
})
export class SocialIcon {
  readonly network = input.required<'instagram' | 'facebook' | 'tiktok'>();
}
