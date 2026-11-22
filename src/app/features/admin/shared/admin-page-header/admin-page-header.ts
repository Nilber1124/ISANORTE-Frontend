import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Encabezado común de las pantallas del admin: rótulo (marca o sección), título —igual al nombre del menú—,
 * descripción opcional y, a la derecha, las acciones principales que se proyecten dentro.
 */
@Component({
  selector: 'app-admin-page-header',
  template: `
    <header class="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div class="max-w-3xl">
        <p class="text-eyebrow uppercase text-text-muted">{{ eyebrow() }}</p>
        <h1 class="mt-3 text-heading-1 text-text-primary">{{ title() }}</h1>
        @if (description(); as text) {
          <p class="mt-3 text-body text-text-secondary">{{ text }}</p>
        }
      </div>
      <ng-content />
    </header>
  `,
  host: { class: 'block' },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminPageHeader {
  readonly eyebrow = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
}
