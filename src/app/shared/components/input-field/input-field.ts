import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  input,
  model,
  output,
} from '@angular/core';

export type InputFieldType =
  'text' | 'email' | 'password' | 'tel' | 'url' | 'search' | 'number' | 'date';

@Component({
  selector: 'app-input-field',
  templateUrl: './input-field.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class InputField {
  readonly inputId = input.required<string>();
  readonly label = input.required<string>();
  readonly type = input<InputFieldType>('text');
  readonly value = model('');
  readonly name = input<string | undefined>();
  readonly placeholder = input<string | undefined>();
  readonly autocomplete = input<string | undefined>();
  readonly inputMode = input<string | undefined>();
  readonly helperText = input<string | undefined>();
  readonly error = input<string | undefined>();
  readonly ariaDescribedBy = input<string | undefined>();
  readonly disabled = input(false, { transform: booleanAttribute });
  readonly readonly = input(false, { transform: booleanAttribute });
  readonly required = input(false, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly minLength = input<number | undefined>();
  readonly maxLength = input<number | undefined>();

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
    this.value.set((event.target as HTMLInputElement).value);
  }
}
