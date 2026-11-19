import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HomeProductCard } from '../isadecor-home.model';

const UNIT_LABELS: Readonly<Record<string, string>> = { M2: 'm²', UNIDAD: 'unidad', CAJA: 'caja', ML: 'ml' };

const MAX_SWATCHES = 5;

/** Tarjeta de producto del Home: foto, nombre, precio por unidad y acción según modalidad. */
@Component({
  selector: 'app-home-product-tile',
  imports: [DecimalPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      [routerLink]="['/isadecor/productos', product().slug]"
      [class.flex-row]="compact()" [class.flex-col]="!compact()"
      class="filete-b group flex h-full overflow-hidden rounded-card bg-background-soft transition-shadow hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
    >
      <div class="overflow-hidden bg-background-muted" [class]="compact() ? 'relative size-24 shrink-0' : 'relative aspect-square'">
        @if (product().imagen; as image) {
          <img [src]="image.url" [alt]="image.alt || product().nombre" width="400" height="400" loading="lazy"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
        }
        @if (product().descuentoPorcentaje) {
          <span class="absolute left-2 top-2 rounded-md bg-accent px-2.5 py-1 text-body-sm font-bold text-accent-contrast">-{{ product().descuentoPorcentaje | number: '1.0-0' }}%</span>
        }
      </div>
      <div class="flex min-w-0 flex-1 flex-col p-3 sm:p-4">
        <p class="text-body-sm text-text-secondary">{{ product().categorias[0]?.nombre }}</p>
        <h3 class="mt-1 text-body font-semibold text-text-primary">{{ product().nombre }}</h3>
        @if (visibleFinishes().length) {
          <div class="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1.5">
            <ul class="flex flex-wrap items-center gap-1.5" aria-label="Acabados disponibles">
              @for (finish of visibleFinishes(); track finish.nombre) {
                <li class="size-6 rounded-[3px] border border-text-muted" [class.opacity-40]="finish.agotado" [style.background]="swatch(finish)" [attr.title]="finish.nombre + (finish.agotado ? ' (agotado)' : '')">
                  <span class="sr-only">{{ finish.nombre }}{{ finish.agotado ? ' (agotado)' : '' }}</span>
                </li>
              }
            </ul>
            <p class="text-body-sm text-text-secondary">{{ totalFinishes() }} acabados</p>
          </div>
        }
        @if (product().valoracion) {
          <p class="mt-2 flex items-center gap-1.5 text-body-sm text-text-secondary" [attr.aria-label]="product().valoracion + ' de 5 estrellas, ' + product().resenasCantidad + ' reseñas'">
            <svg class="size-4 text-accent-strong" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 3l2.7 5.8 6.3.7-4.7 4.3 1.3 6.2L12 16.9 6.4 20l1.3-6.2L3 9.5l6.3-.7z" /></svg>
            <span class="font-semibold text-text-primary">{{ product().valoracion }}</span>
            <span>({{ product().resenasCantidad }} reseñas)</span>
          </p>
        }
        <div class="mt-auto pt-3">
          @if (product().precioBase !== null) {
            <p class="flex flex-wrap items-baseline gap-x-1 text-body-lg font-bold text-text-primary">
              @if (product().modalidad === 'COTIZAR') { <span class="text-body-sm font-normal text-text-secondary">Desde </span> }
              S/ {{ product().precioBase | number: '1.2-2' }}<span class="text-body-sm font-normal text-text-secondary"> / {{ unit() }}</span>
            </p>
            @if (product().precioAnterior) {
              <p class="text-body-sm text-text-secondary">Antes <span class="line-through">S/ {{ product().precioAnterior | number: '1.2-2' }}</span></p>
            }
          } @else {
            <p class="text-body font-semibold text-text-primary">Consultar precio</p>
          }
          @if (product().estadoStock === 'QUEDAN' && product().quedan) {
            <p class="mt-1 text-body-sm font-semibold text-accent-strong">Quedan {{ product().quedan }}</p>
          }
          @if (product().entrega) {
            <p class="mt-1 text-body-sm text-text-secondary">{{ product().entrega }}</p>
          }
          <span class="mt-3 inline-flex w-full items-center justify-center rounded-control px-3 py-2 text-body-sm font-semibold"
            [class]="product().modalidad === 'COMPRAR' ? 'bg-accent text-accent-contrast' : 'border border-border-strong text-text-primary'">
            {{ product().modalidad === 'COMPRAR' ? 'Comprar' : 'Cotizar' }}
          </span>
        </div>
      </div>
    </a>
  `,
})
export class HomeProductTile {
  protected swatch(finish: { color: string | null; imagenUrl?: string | null }): string {
    return finish.imagenUrl ? `url(${finish.imagenUrl}) center / cover` : (finish.color ?? 'transparent');
  }

  readonly product = input.required<HomeProductCard>();
  /** Versión horizontal y baja, para superponer sobre el video en móvil. */
  readonly compact = input(false);
  protected readonly visibleFinishes = computed(() => (this.product().acabados ?? []).slice(0, MAX_SWATCHES));
  protected readonly totalFinishes = computed(() => this.product().acabados?.length ?? 0);
  protected readonly unit = computed(() => UNIT_LABELS[this.product().unidadVenta] ?? 'unidad');
}
