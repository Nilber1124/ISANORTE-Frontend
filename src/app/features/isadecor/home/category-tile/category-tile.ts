import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { HomeCategory } from '../isadecor-home.model';

/** Tarjeta de categoría de la escena: foto, nombre, qué incluye y acceso al catálogo filtrado. */
@Component({
  selector: 'app-home-category-tile',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <a
      [routerLink]="'/isadecor/productos'"
      [queryParams]="{ categoria: category().slug }"
      class="filete-b group flex h-full overflow-hidden rounded-card bg-background-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
      [class.flex-row]="compact()"
      [class.flex-col]="!compact()"
    >
      <div class="overflow-hidden bg-background-muted" [class]="compact() ? 'size-24 shrink-0' : 'aspect-[4/3]'">
        <img [src]="category().imagenUrl" alt="" width="400" height="300" loading="lazy"
          class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
      </div>
      <div class="flex flex-1 flex-col justify-center p-4">
        <p class="text-heading-3 font-bold text-text-primary">{{ category().nombre }}</p>
        <p class="mt-1 text-body-sm text-text-secondary">{{ category().descripcion }}</p>
        <span class="mt-3 text-body-sm font-semibold text-accent">Ver {{ category().nombre.toLowerCase() }} →</span>
      </div>
    </a>
  `,
})
export class HomeCategoryTile {
  readonly category = input.required<HomeCategory>();
  readonly compact = input(false);
}
