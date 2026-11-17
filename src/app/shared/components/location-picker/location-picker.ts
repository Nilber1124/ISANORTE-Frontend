import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  effect,
  inject,
  input,
  model,
  viewChild,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import type { Map as LeafletMap, Marker } from 'leaflet';

/** Centro inicial (Cajamarca) cuando todavía no hay un punto guardado. */
const DEFAULT_CENTER: [number, number] = [-7.1638, -78.5003];

/**
 * Selector de ubicación: se hace clic en el mapa o se arrastra el pin y se obtienen latitud y longitud.
 * Usa Leaflet con teselas de OpenStreetMap (sin clave de API). Solo corre en el navegador.
 */
@Component({
  selector: 'app-location-picker',
  templateUrl: './location-picker.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LocationPicker {
  readonly latitud = model<number | null>(null);
  readonly longitud = model<number | null>(null);
  readonly disabled = input(false);

  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('map');
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private map?: LeafletMap;
  private marker?: Marker;
  private leaflet?: typeof import('leaflet');

  constructor() {
    inject(DestroyRef).onDestroy(() => this.map?.remove());

    afterNextRender(() => {
      if (this.isBrowser) void this.init();
    });

    // El pin sigue a los valores (p. ej. al limpiar o al cargar datos).
    effect(() => {
      const lat = this.latitud();
      const lng = this.longitud();
      if (!this.map || !this.leaflet) return;
      this.syncMarker(lat, lng);
    });
  }

  protected clear(): void {
    this.latitud.set(null);
    this.longitud.set(null);
  }

  protected readonly formatted = () => {
    const lat = this.latitud();
    const lng = this.longitud();
    return lat === null || lng === null ? null : `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  };

  private async init(): Promise<void> {
    const L = (await import('leaflet')).default;
    this.leaflet = L;
    const lat = this.latitud();
    const lng = this.longitud();
    const hasPoint = lat !== null && lng !== null;

    const map = L.map(this.host().nativeElement, {
      center: hasPoint ? [lat, lng] : DEFAULT_CENTER,
      zoom: hasPoint ? 16 : 13,
    });
    this.map = map;
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    map.on('click', (event) => {
      if (this.disabled()) return;
      this.setPoint(event.latlng.lat, event.latlng.lng);
    });
    this.syncMarker(lat, lng);
    // El selector vive dentro de un panel que se abre: se recalcula el tamaño al mostrarse.
    setTimeout(() => map.invalidateSize(), 250);
  }

  private setPoint(lat: number, lng: number): void {
    this.latitud.set(Number(lat.toFixed(6)));
    this.longitud.set(Number(lng.toFixed(6)));
  }

  private syncMarker(lat: number | null, lng: number | null): void {
    const L = this.leaflet;
    const map = this.map;
    if (!L || !map) return;
    if (lat === null || lng === null) {
      this.marker?.remove();
      this.marker = undefined;
      return;
    }
    if (!this.marker) {
      const icon = L.divIcon({
        className: '',
        html: '<span style="display:block;width:22px;height:22px;border-radius:50% 50% 50% 0;background:#f97316;border:3px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.45);transform:rotate(-45deg)"></span>',
        iconSize: [22, 22],
        iconAnchor: [11, 22],
      });
      this.marker = L.marker([lat, lng], { icon, draggable: !this.disabled() }).addTo(map);
      this.marker.on('dragend', () => {
        const position = this.marker?.getLatLng();
        if (position) this.setPoint(position.lat, position.lng);
      });
    } else {
      this.marker.setLatLng([lat, lng]);
    }
    if (!map.getBounds().contains([lat, lng])) map.panTo([lat, lng]);
  }
}
