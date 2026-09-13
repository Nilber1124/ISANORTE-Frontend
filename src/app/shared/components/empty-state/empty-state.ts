import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

@Component({
  selector: 'app-empty-state',
  templateUrl: './empty-state.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class EmptyState {
  readonly emptyStateId = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input<string | undefined>();
  readonly compact = input(false, { transform: booleanAttribute });

  protected readonly titleId = computed(() => `${this.emptyStateId()}-title`);
  protected readonly descriptionId = computed(() => `${this.emptyStateId()}-description`);
  protected readonly classes = computed(() =>
    this.compact()
      ? 'rounded-card border border-dashed border-border bg-surface p-6 text-center animate-fade-in-up'
      : 'rounded-panel border border-dashed border-border bg-surface px-6 py-12 text-center sm:px-10 sm:py-16 animate-fade-in-up',
  );
}
