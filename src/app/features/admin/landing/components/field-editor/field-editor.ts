import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';

import { Button } from '../../../../../shared/components/button/button';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';

/**
 * Edita UN solo campo de texto en el panel de la vista previa (lo que se tocó en la página).
 * Lo que se teclea se emite como borrador en vivo; solo se guarda con el botón.
 */
@Component({
  selector: 'app-field-editor',
  imports: [Button, InputField, TextareaField],
  templateUrl: './field-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FieldEditor {
  /** Dónde se está editando (p. ej. «Servicios · Título»). */
  readonly heading = input.required<string>();
  readonly label = input.required<string>();
  /** Valor guardado. */
  readonly value = input<string>('');
  /** 1 = campo de una línea; más = campo de varias líneas. */
  readonly rows = input(1);
  readonly helper = input<string | undefined>();
  readonly required = input(false);
  readonly busy = input(false);
  readonly loading = input(false);
  readonly error = input<string | null>(null);

  /** Lo tecleado (borrador en vivo) o `null` si vuelve a coincidir con lo guardado. */
  readonly draftChanged = output<string | null>();
  readonly saved = output<string>();
  readonly closed = output<void>();

  protected readonly text = signal('');
  protected readonly dirty = computed(() => this.text() !== this.value());
  protected readonly invalid = computed(() => this.required() && this.text().trim() === '');

  constructor() {
    // El campo se rellena cuando cambia lo guardado (otro campo, otra tarjeta, tras guardar).
    effect(() => {
      const saved = this.value();
      untracked(() => this.text.set(saved));
    });
    effect(() => {
      const text = this.text();
      const dirty = this.dirty();
      untracked(() => this.draftChanged.emit(dirty ? text : null));
    });
  }

  protected save(): void {
    if (!this.dirty() || this.invalid() || this.busy()) return;
    // Los saltos de línea internos se conservan; solo se recortan los extremos.
    this.saved.emit(this.text().trim());
  }
}
