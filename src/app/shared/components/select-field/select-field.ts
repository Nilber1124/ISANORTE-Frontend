import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
  output,
} from '@angular/core';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

@Component({
  selector: 'app-select-field',
  templateUrl: './select-field.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class SelectField {
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly options = input.required<readonly SelectOption[]>();
  readonly value = model('');
  readonly name = input<string | undefined>();
  readonly placeholder = input<string | undefined>();
  readonly helperText = input<string | undefined>();
  readonly error = input<string | undefined>();
  readonly ariaDescribedBy = input<string | undefined>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });

  readonly focused = output<FocusEvent>();
  readonly blurred = output<FocusEvent>();

  protected readonly feedbackId = computed(() => `${this.inputId()}-feedback`);
  protected readonly describedBy = computed(() => {
    const ids = [
      this.error() || this.helperText() ? this.feedbackId() : undefined,
      this.ariaDescribedBy(),
    ];
    return ids.filter(Boolean).join(' ') || undefined;
  });

  protected updateValue(event: Event): void {
    this.value.set((event.target as HTMLSelectElement).value);
  }
}
