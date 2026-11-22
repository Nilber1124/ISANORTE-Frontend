import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-location-map',
  templateUrl: './location-map.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-w-0', '[class.h-full]': "size() === 'fill'" },
})
export class LocationMap {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly destroyRef = inject(DestroyRef);
  private readonly mapViewport = viewChild<ElementRef<HTMLElement>>('mapViewport');

  protected readonly mapVisible = signal(false);

  readonly direccion = input.required<string>();
  readonly mapEmbedUrl = input.required<string>();
  readonly mapUrl = input.required<string>();
  /** `compact` (pie de página) `large` (cuadrado) o `fill` (ocupa el alto que le deja su contenedor). */
  readonly size = input<'compact' | 'large' | 'fill'>('compact');

  protected readonly safeMapEmbedUrl = computed<SafeResourceUrl | null>(() => {
    const url = this.googleMapsUrl(this.mapEmbedUrl());
    return url === null ? null : this.sanitizer.bypassSecurityTrustResourceUrl(url);
  });

  protected readonly safeMapUrl = computed(() => this.googleMapsUrl(this.mapUrl()));

  constructor() {
    afterNextRender(() => {
      const viewport = this.mapViewport()?.nativeElement;
      if (!viewport) return;

      if (!('IntersectionObserver' in globalThis)) {
        this.mapVisible.set(true);
        return;
      }

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) return;
          this.mapVisible.set(true);
          observer.disconnect();
        },
        { rootMargin: '200px' },
      );
      observer.observe(viewport);
      this.destroyRef.onDestroy(() => observer.disconnect());
    });
  }

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
