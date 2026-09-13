import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

export type LoadingVariant = 'spinner' | 'dots';
export type LoadingSize = 'small' | 'medium' | 'large';
export type LoadingLayout = 'inline' | 'block';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class Loading {
  readonly variant = input<LoadingVariant>('spinner');
  readonly size = input<LoadingSize>('medium');
  readonly layout = input<LoadingLayout>('block');
  readonly label = input('Cargando');
  readonly showLabel = input(true, { transform: booleanAttribute });

  protected readonly wrapperClasses = computed(() =>
    this.layout() === 'inline'
      ? 'inline-flex items-center gap-3 text-text-secondary'
      : 'flex min-h-32 flex-col items-center justify-center gap-4 text-center text-text-secondary',
  );

  protected readonly spinnerClasses = computed(() => {
    const sizes: Record<LoadingSize, string> = {
      small: 'size-4 border-2',
      medium: 'size-6 border-2',
      large: 'size-9 border-2',
    };
    return `${sizes[this.size()]} animate-spin rounded-full border-current border-r-transparent`;
  });

  protected readonly dotClasses = computed(() => {
    const sizes: Record<LoadingSize, string> = {
      small: 'size-1.5',
      medium: 'size-2',
      large: 'size-2.5',
    };
    return `${sizes[this.size()]} rounded-full bg-current animate-loading-dot`;
  });
}
