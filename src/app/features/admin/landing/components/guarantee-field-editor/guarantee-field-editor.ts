import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { ToastService } from '../../../../../core/services/toast.service';
import { Button } from '../../../../../shared/components/button/button';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';
import { trimTrailingSlashes } from '../../../../../shared/utils/text';
import { FieldEditor } from '../field-editor/field-editor';

export type GuaranteeField = 'titulo' | 'texto' | 'ambos';

interface Guarantee {
  id: string;
  titulo: string;
  texto: string;
  enHero: boolean;
  orden: number;
  activo: boolean;
}

const LABELS = {
  titulo: { label: 'Título', rows: 1, required: true },
  texto: { label: 'Texto', rows: 3, required: true },
} as const;

/** Edita el título y/o el texto de una garantía («Por qué elegir a ISANORTE») tocada en la vista previa. */
@Component({
  selector: 'app-guarantee-field-editor',
  imports: [Button, FieldEditor, InputField, TextareaField],
  templateUrl: './guarantee-field-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GuaranteeFieldEditor {
  readonly guaranteeId = input.required<string>();
  readonly field = input.required<GuaranteeField>();

  /** Lo que se teclea, por campo (borrador en vivo), o `null` si no difiere de lo guardado. */
  readonly draftChanged = output<Readonly<Record<string, string>> | null>();
  readonly saved = output<void>();
  readonly closed = output<void>();

  private readonly http = inject(HttpClient);
  private readonly base = trimTrailingSlashes(inject(API_BASE_URL));
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly item = signal<Guarantee | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly tituloText = signal('');
  protected readonly textoText = signal('');

  protected readonly single = () => (this.field() === 'ambos' ? null : (this.field() as 'titulo' | 'texto'));
  protected readonly meta = () => LABELS[this.single() ?? 'titulo'];
  protected readonly heading = () => {
    const single = this.single();
    return `Garantía${single ? ' · ' + LABELS[single].label : ''}`;
  };
  protected readonly currentValue = () => {
    const item = this.item();
    const single = this.single();
    return item && single ? item[single] : '';
  };
  protected readonly bothDirty = () => {
    const item = this.item();
    return !!item && (this.tituloText() !== item.titulo || this.textoText() !== item.texto);
  };
  protected readonly bothInvalid = () =>
    this.tituloText().trim() === '' || this.textoText().trim() === '';

  constructor() {
    effect(() => {
      const item = this.item();
      untracked(() => {
        this.tituloText.set(item?.titulo ?? '');
        this.textoText.set(item?.texto ?? '');
      });
    });
    effect(() => {
      const values = { titulo: this.tituloText(), texto: this.textoText() };
      const dirty = this.bothDirty();
      untracked(() => {
        if (this.field() === 'ambos') this.draftChanged.emit(dirty ? values : null);
      });
    });
    effect(() => {
      const id = this.guaranteeId();
      untracked(() => this.load(id));
    });
  }

  private load(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.item.set(null);
    this.http
      .get<Guarantee[]>(`${this.base}/api/garantias`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (all) => {
          const found = all.find((g) => g.id === id) ?? null;
          this.item.set(found);
          this.error.set(found ? null : 'No se encontró la garantía.');
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar la garantía.');
          this.loading.set(false);
        },
      });
  }

  protected onSingleDraft(value: string | null): void {
    const single = this.single();
    this.draftChanged.emit(value !== null && single ? { [single]: value } : null);
  }

  protected save(value: string): void {
    const single = this.single();
    if (single) this.persist({ [single]: value });
  }

  protected saveBoth(): void {
    if (!this.bothDirty() || this.bothInvalid()) return;
    this.persist({ titulo: this.tituloText().trim(), texto: this.textoText().trim() });
  }

  private persist(patch: Partial<Pick<Guarantee, 'titulo' | 'texto'>>): void {
    const item = this.item();
    if (!item || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    // El resto de la garantía se envía tal cual está guardado.
    const body = {
      titulo: item.titulo,
      texto: item.texto,
      enHero: item.enHero,
      orden: item.orden,
      activo: item.activo,
      ...patch,
    };
    this.http
      .put<Guarantee>(`${this.base}/api/garantias/${encodeURIComponent(item.id)}`, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.item.set(updated);
          this.saving.set(false);
          this.toast.show('Garantía actualizada.', 'success');
          this.saved.emit();
        },
        error: () => {
          this.saving.set(false);
          this.error.set('No se pudo guardar. Revisa el texto e inténtalo de nuevo.');
        },
      });
  }
}
