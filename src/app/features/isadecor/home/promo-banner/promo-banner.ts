import { DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HomePromotion } from '../isadecor-home.model';

const UNIT_LABELS: Readonly<Record<string, string>> = {
  M2: 'm²',
  UNIDAD: 'unidad',
  CAJA: 'caja',
  ML: 'ml',
};

/**
 * Promoción del Home. `large` = oferta principal (foto de ambiente, descuento enorme y precio);
 * sin `large` = fila compacta de la lista de ofertas.
 */
@Component({
  selector: 'app-home-promo-banner',
  imports: [DatePipe, DecimalPipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (large()) {
      <a
        [routerLink]="['/isadecor/productos', promo().producto.slug]"
        class="group grid h-full overflow-hidden rounded-panel border border-border bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:grid-cols-[1.05fr_1fr]"
      >
        <img
          [src]="promo().imagenUrl"
          alt=""
          loading="lazy"
          class="h-60 w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] sm:h-full sm:min-h-[26rem]"
        />
        <div class="flex flex-col justify-center gap-3 p-6 sm:p-9">
          @if (promo().tipo === 'DESCUENTO') {
            <p
              class="[font-family:var(--font-display)] text-[clamp(4rem,9vw,7rem)] font-semibold leading-none tracking-[-0.05em] text-accent-strong"
            >
              −{{ promo().producto.descuentoPorcentaje | number: '1.0-0' }}%
            </p>
          } @else {
            <p class="font-mono text-caption uppercase tracking-[0.12em] text-accent-strong">
              Novedad
            </p>
          }
          <h3 class="text-heading-2 text-text-primary">{{ promo().titulo }}</h3>
          @if (promo().producto.precioBase !== null) {
            <p class="flex flex-wrap items-baseline gap-x-3 text-text-primary">
              <strong class="text-heading-3 font-semibold"
                >S/ {{ promo().producto.precioBase | number: '1.2-2' }}</strong
              >
              @if (promo().producto.precioAnterior) {
                <span class="font-mono text-body-sm text-text-muted line-through"
                  >S/ {{ promo().producto.precioAnterior | number: '1.2-2' }}</span
                >
              }
              <span class="font-mono text-caption text-text-muted">/ {{ unit() }}</span>
            </p>
          }
          @if (promo().fechaFin) {
            <p class="font-mono text-caption text-text-secondary">
              Hasta el {{ promo().fechaFin | date: 'd MMM' }}
              @if (daysLeft() !== null) {
                · quedan {{ daysLeft() }} {{ daysLeft() === 1 ? 'día' : 'días' }}
              }
            </p>
          }
          <span
            class="mt-2 inline-flex w-fit items-center rounded-button bg-accent px-5 py-2.5 text-body-sm font-semibold text-accent-contrast"
            >Ver oferta</span
          >
        </div>
      </a>
    } @else {
      <a
        [routerLink]="['/isadecor/productos', promo().producto.slug]"
        class="group flex items-center gap-4 py-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      >
        @if (promo().producto.imagen; as image) {
          <img
            [src]="image.url"
            alt=""
            loading="lazy"
            width="96"
            height="96"
            class="size-20 shrink-0 rounded-card object-cover sm:size-24"
          />
        }
        <div class="min-w-0 flex-1">
          @if (promo().tipo === 'DESCUENTO') {
            <span
              class="rounded-control bg-accent px-2 py-0.5 font-mono text-caption font-medium text-accent-contrast"
              >−{{ promo().producto.descuentoPorcentaje | number: '1.0-0' }}%</span
            >
          } @else {
            <span
              class="rounded-control border border-accent-strong px-2 py-0.5 font-mono text-caption font-medium uppercase text-accent-strong"
              >Nuevo</span
            >
          }
          <h3 class="mt-1.5 text-heading-3 text-text-primary group-hover:underline">
            {{ promo().titulo }}
          </h3>
          @if (promo().producto.precioBase !== null) {
            <p class="mt-0.5 text-body-sm text-text-primary">
              @if (promo().tipo !== 'DESCUENTO') {
                <span class="text-text-muted">Desde </span>
              }
              <strong>S/ {{ promo().producto.precioBase | number: '1.2-2' }}</strong>
              @if (promo().producto.precioAnterior) {
                <span class="ml-1 font-mono text-caption text-text-muted line-through"
                  >S/ {{ promo().producto.precioAnterior | number: '1.2-2' }}</span
                >
              }
              <span class="font-mono text-caption text-text-muted"> / {{ unit() }}</span>
            </p>
          }
          @if (promo().fechaFin) {
            <p class="font-mono text-caption text-text-muted">
              Hasta el {{ promo().fechaFin | date: 'd MMM' }}
              @if (daysLeft() !== null) {
                · quedan {{ daysLeft() }}
              }
            </p>
          }
        </div>
        <span
          aria-hidden="true"
          class="text-accent-strong transition-transform group-hover:translate-x-1"
          >→</span
        >
      </a>
    }
  `,
})
export class HomePromoBanner {
  readonly promo = input.required<HomePromotion>();
  readonly large = input(false);
  protected readonly unit = computed(
    () => UNIT_LABELS[this.promo().producto.unidadVenta] ?? 'unidad',
  );
  protected readonly daysLeft = computed(() => {
    const end = this.promo().fechaFin;
    if (!end) return null;
    const days = Math.ceil((new Date(end + 'T23:59:59').getTime() - Date.now()) / 86_400_000);
    return days >= 0 ? days : null;
  });
}
