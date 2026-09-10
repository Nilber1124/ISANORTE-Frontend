import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'accent' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';
export type ButtonType = 'button' | 'submit' | 'reset';

@Component({
  selector: 'app-button',
  imports: [NgTemplateOutlet],
  templateUrl: './button.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('medium');
  readonly type = input<ButtonType>('button');
  readonly href = input<string | undefined>();
  readonly target = input<'_self' | '_blank' | undefined>();
  readonly ariaLabel = input<string | undefined>();
  readonly disabled = input(false);
  readonly loading = input(false);

  protected readonly isUnavailable = computed(() => this.disabled() || this.loading());

  protected readonly classes = computed(() => {
    const base =
      'relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-button border font-semibold transition-[color,background-color,border-color,box-shadow,transform] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-px';
    const variants: Record<ButtonVariant, string> = {
      primary:
        'border-transparent bg-action-primary text-action-primary-text hover:bg-action-primary-hover active:bg-action-primary-hover',
      secondary:
        'border-border-strong bg-surface text-text-primary hover:bg-surface-hover active:bg-background-muted',
      accent:
        'border-transparent bg-accent text-accent-contrast hover:bg-accent-hover active:bg-accent-hover',
      ghost:
        'border-transparent bg-transparent text-text-secondary hover:bg-surface-hover hover:text-text-primary active:bg-background-muted',
    };
    const sizes: Record<ButtonSize, string> = {
      small: 'min-h-10 px-4 py-2 text-body-sm',
      medium: 'min-h-11 px-5 py-2.5 text-body-sm',
      large: 'min-h-12 px-6 py-3 text-body',
    };
    const unavailable = this.isUnavailable()
      ? 'pointer-events-none cursor-not-allowed opacity-45'
      : '';
    return `${base} ${variants[this.variant()]} ${sizes[this.size()]} ${unavailable}`;
  });

  protected preventUnavailableLink(event: Event): void {
    if (this.isUnavailable()) event.preventDefault();
  }
}
