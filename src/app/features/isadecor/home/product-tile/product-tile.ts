import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HomeProductCard } from '../isadecor-home.model';

export const UNIT_LABELS: Readonly<Record<string, string>> = {
  M2: 'm²',
  UNIDAD: 'unidad',
  CAJA: 'caja',
  ML: 'ml',
};

@Component({
  selector: 'app-home-product-tile',
  imports: [DecimalPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block min-w-0' },
  template: `
    <a
      [routerLink]="['/isadecor/productos', product().slug]"
      [class.flex-row]="compact()"
      [class.flex-col]="!compact()"
      class="filete-b group flex h-full overflow-hidden rounded-card bg-background-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
    >
      <div
        class="relative overflow-hidden bg-background-muted"
        [class]="compact() ? 'size-24 shrink-0' : 'aspect-square'"
      >
        @if (product().imagen; as image) {
          @if (failedImage !== image.url) {
            <img
              [src]="image.url"
              [alt]="image.alt || product().nombre"
              width="400"
              height="400"
              loading="lazy"
              class="h-full w-full object-cover motion-safe:transition-transform motion-safe:group-hover:scale-105"
              (error)="failedImage = image.url"
            />
          }
        }
        @if (product().descuentoPorcentaje) {
          <span
            class="absolute left-2 top-2 rounded-control bg-accent px-2 py-0.5 text-caption font-bold text-accent-contrast"
          >
            -{{ product().descuentoPorcentaje | number: '1.0-0' }}%
          </span>
        }
      </div>
      <div class="flex min-w-0 flex-1 flex-col" [class]="dense() ? 'p-2' : 'p-3 sm:p-4'">
        <p class="truncate text-caption text-text-secondary">
          {{ product().categorias[0]?.nombre }}
        </p>
        <h3 class="mt-0.5 line-clamp-2 text-body text-text-primary">{{ product().nombre }}</h3>
        @if (visibleFinishes().length || product().valoracion != null) {
          <div class="my-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            @if (visibleFinishes().length) {
              <ul class="flex flex-wrap items-center gap-0.5" aria-label="Acabados">
                @for (finish of visibleFinishes(); track $index) {
                  <li
                    class="size-3.5 rounded-control border border-text-muted bg-background-muted"
                    [class.opacity-50]="finish.agotado"
                    [style.background]="swatch(finish)"
                    [attr.title]="finish.nombre + (finish.agotado ? ' (agotado)' : '')"
                  >
                    <span class="sr-only"
                      >{{ finish.nombre }}{{ finish.agotado ? ' (agotado)' : '' }}</span
                    >
                  </li>
                }
              </ul>
            }
            @if (product().valoracion != null) {
              <span class="whitespace-nowrap text-caption text-text-secondary">
                <span aria-hidden="true" class="text-accent-strong">★</span>
                {{ product().valoracion }}<span class="sr-only"> de 5 estrellas</span> ({{
                  product().resenasCantidad
                }}<span class="sr-only"> reseñas</span>)
              </span>
            }
          </div>
        }

        <div class="mt-auto pt-1">
          @if (product().precioBase !== null) {
            <p
              class="flex flex-wrap items-baseline gap-x-1 text-body-sm font-bold text-text-primary"
            >
              @if (product().modalidad === 'COTIZAR') {
                <span class="text-caption font-normal text-text-secondary">Desde</span>
              }
              <span class="whitespace-nowrap">S/ {{ product().precioBase | number: '1.2-2' }}</span>
              <span class="font-mono text-caption font-normal text-text-secondary"
                >/ {{ unit() }}</span
              >
              @if (product().precioAnterior) {
                <del class="text-caption font-normal text-text-secondary">
                  <span class="sr-only">Antes </span>S/
                  {{ product().precioAnterior | number: '1.2-2' }}
                </del>
              }
            </p>
          } @else {
            <p class="text-body-sm font-semibold text-text-primary">Consultar precio</p>
          }
          @if (product().entrega || product().estadoStock === 'QUEDAN') {
            <div class="flex flex-wrap gap-x-2 text-caption">
              @if (product().entrega) {
                <span class="text-text-secondary">{{ product().entrega }}</span>
              }
              @if (product().estadoStock === 'QUEDAN' && product().quedan) {
                <span class="font-semibold text-accent-strong">Quedan {{ product().quedan }}</span>
              }
            </div>
          }
          @if (product().estadoStock === 'AGOTADO' || product().disponibilidad === 'AGOTADO') {
            <p class="mt-1 font-semibold text-text-primary">Agotado</p>
          } @else {
            <span
              class="mt-1.5 inline-flex min-h-8 w-full items-center justify-center rounded-control px-2 text-body-sm font-semibold"
              [class]="
                product().modalidad === 'COMPRAR'
                  ? 'bg-accent text-accent-contrast'
                  : 'border border-border-strong text-text-primary'
              "
            >
              {{ product().modalidad === 'COMPRAR' ? 'Comprar' : 'Cotizar' }}
            </span>
          }
        </div>
      </div>
    </a>
  `,
})
export class HomeProductTile {
  readonly product = input.required<HomeProductCard>();
  readonly compact = input(false);
  readonly dense = input(false);
  protected failedImage: string | null = null;
  protected readonly visibleFinishes = computed(() => (this.product().acabados ?? []).slice(0, 5));
  protected readonly unit = computed(() => UNIT_LABELS[this.product().unidadVenta] ?? 'unidad');

  protected swatch(finish: { color: string | null; imagenUrl?: string | null }): string | null {
    return finish.imagenUrl ? `url("${finish.imagenUrl}") center / cover` : finish.color;
  }
}
