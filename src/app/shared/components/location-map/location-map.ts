import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-location-map',
  templateUrl: './location-map.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-w-0' },
})
export class LocationMap {
  private readonly sanitizer = inject(DomSanitizer);

  readonly direccion = input.required<string>();
  readonly mapEmbedUrl = input.required<string>();
  readonly mapUrl = input.required<string>();

  protected readonly safeMapEmbedUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.googleMapsUrl(this.mapEmbedUrl());
    return url === null ? null : this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  protected readonly safeMapUrl = computed(() => this.googleMapsUrl(this.mapUrl()));

  private googleMapsUrl(value: string): string | null {
    try {
      const url = new URL(value);
      const isGoogleMapsHost =
        url.hostname === 'google.com' ||
        url.hostname === 'www.google.com' ||
        url.hostname === 'maps.google.com';

      return url.protocol === 'https:' && isGoogleMapsHost ? url.toString() : null;
    } catch {
      return null;
    }
  }
}
