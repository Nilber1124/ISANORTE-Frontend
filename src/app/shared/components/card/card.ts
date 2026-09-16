import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type CardPadding = 'small' | 'medium' | 'large' | 'none';

@Component({
  selector: 'app-card',
  templateUrl: './card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block h-full ' },
})
export class Card {
  readonly href = input<string | undefined>();
  readonly padding = input<CardPadding>('medium');
  readonly ariaLabel = input<string | undefined>();

  protected readonly accessibleLabel = computed(() => this.ariaLabel() ?? 'Abrir detalle');

  protected readonly classes = computed(() => {
    const base =
      'relative block h-full overflow-hidden rounded-card border border-border bg-surface shadow-card transition-[border-color,background-color,transform,box-shadow] duration-normal ease-[var(--ease-standard)]';
    const padding: Record<CardPadding, string> = {
      small: 'p-4',
      medium: 'p-6',
      large: 'p-6 md:p-8',
      none: 'p-0',
    };
    const interactive = this.href()
      ? 'cursor-pointer hover:-translate-y-1 hover:border-border-strong hover:bg-surface-hover hover:shadow-floating focus-within:-translate-y-1 focus-within:border-focus focus-within:shadow-floating'
      : '';
    return `${base} ${padding[this.padding()]} ${interactive}`;
  });
}
