import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Badge } from '../../../shared/components/badge/badge';

@Component({
  selector: 'app-admin-module-placeholder',
  imports: [Badge, RouterLink],
  template: `
    <div class="max-w-3xl">
      <app-badge variant="neutral">Próximo incremento</app-badge>
      <h1 class="mt-5 text-heading-1 text-text-primary">{{ title }}</h1>
      <p class="mt-4 text-body-lg text-text-secondary">
        La ruta está preparada, pero este módulo todavía no incluye formularios, datos ni
        operaciones administrativas.
      </p>
      <a
        routerLink="/admin"
        class="mt-8 inline-flex min-h-11 items-center rounded-button border border-border-strong bg-surface px-5 py-2.5 text-body-sm font-semibold text-text-primary transition-colors duration-fast hover:bg-surface-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus"
      >
        Volver al dashboard
      </a>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminModulePlaceholder {
  private readonly route = inject(ActivatedRoute);
  readonly title = this.route.snapshot.data['title'] as string;
}
