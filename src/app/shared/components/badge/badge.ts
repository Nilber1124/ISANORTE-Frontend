import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

export type BadgeVariant = 'neutral' | 'accent' | 'success' | 'warning' | 'error' | 'info';
export type BadgeSize = 'small' | 'medium';

@Component({
  selector: 'app-badge',
  templateUrl: './badge.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
})
export class Badge {
  readonly variant = input<BadgeVariant>('neutral');
  readonly size = input<BadgeSize>('small');
  readonly dot = input(false, { transform: booleanAttribute });
  readonly ariaLabel = input<string | undefined>();

  protected readonly classes = computed(() => {
    const variants: Record<BadgeVariant, string> = {
      neutral: '',
      accent: 'badge-accent',
      success: 'badge-success',
      warning: 'badge-warning',
      error: 'badge-error',
      info: 'badge-info',
    };
    const sizes: Record<BadgeSize, string> = {
      small: '',
      medium: 'min-h-7 gap-2 px-3 py-1.5 text-body-sm',
    };
    return ['badge transition-colors duration-fast', variants[this.variant()], sizes[this.size()]].filter(Boolean).join(' ');
  });

  protected readonly dotClasses = computed(() => {
    const variants: Record<BadgeVariant, string> = {
      neutral: 'bg-text-muted',
      accent: 'bg-accent',
      success: 'bg-success',
      warning: 'bg-warning',
      error: 'bg-error',
      info: 'bg-info',
    };
    return `size-1.5 rounded-full ${variants[this.variant()]}`;
  });
}
