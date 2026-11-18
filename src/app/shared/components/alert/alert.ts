import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';

export type AlertVariant = 'neutral' | 'info' | 'success' | 'warning' | 'error';

@Component({
  selector: 'app-alert',
  templateUrl: './alert.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class Alert {
  readonly variant = input<AlertVariant>('neutral');
  readonly title = input<string | undefined>();
  readonly dismissible = input(false, { transform: booleanAttribute });

  readonly dismissed = output<void>();

  protected readonly classes = computed(() => {
    const base = 'flex items-start gap-3 rounded-card border p-4 sm:p-5 animate-fade-in-up';
    const variants: Record<AlertVariant, string> = {
      neutral: 'border-border bg-surface-soft',
      info: 'border-info/30 bg-info/10',
      success: 'border-success/30 bg-success/10',
      warning: 'border-warning/30 bg-warning/10',
      error: 'border-error/30 bg-error/10',
    };
    return `${base} ${variants[this.variant()]}`;
  });

  protected readonly indicatorClasses = computed(() => {
    const variants: Record<AlertVariant, string> = {
      neutral: 'bg-text-muted',
      info: 'bg-info',
      success: 'bg-success',
      warning: 'bg-warning',
      error: 'bg-error',
    };
    return `mt-2 size-2 shrink-0 rounded-full ${variants[this.variant()]}`;
  });

  protected readonly liveMode = computed(() =>
    this.variant() === 'error' ? 'assertive' : 'polite',
  );
  protected readonly role = computed(() => (this.variant() === 'error' ? 'alert' : 'status'));
}
