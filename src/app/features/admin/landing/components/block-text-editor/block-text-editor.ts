import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
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
import {
  BLOCK_TEXT_DEFAULTS,
  BLOCK_TEXT_LABELS,
  BlockKey,
  BlockTextField,
} from '../../../../../shared/content/block-texts';
import { trimTrailingSlashes } from '../../../../../shared/utils/text';
import { FieldEditor } from '../field-editor/field-editor';

interface BlockTextRow {
  clave: string;
  etiqueta: string | null;
  titulo: string | null;
  subtitulo: string | null;
}

/**
 * Edita un texto de la cabecera de un bloque de la Home (frase pequeña, título o subtítulo). Si el bloque no
 * tiene texto guardado, parte del texto por defecto de la Home.
 */
@Component({
  selector: 'app-block-text-editor',
  imports: [FieldEditor],
  templateUrl: './block-text-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BlockTextEditor {
  readonly blockKey = input.required<BlockKey>();
  readonly field = input.required<BlockTextField>();

  readonly draftChanged = output<Readonly<Record<string, string>> | null>();
  readonly saved = output<void>();
  readonly closed = output<void>();

  private readonly http = inject(HttpClient);
  private readonly base = trimTrailingSlashes(inject(API_BASE_URL));
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly row = signal<BlockTextRow | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  protected readonly label = computed(() => BLOCK_TEXT_LABELS[this.field()]);
  protected readonly rows = computed(() => (this.field() === 'titulo' ? 2 : this.field() === 'subtitulo' ? 3 : 1));
  protected readonly savedValue = computed(
    () => this.row()?.[this.field()] ?? BLOCK_TEXT_DEFAULTS[this.blockKey()][this.field()] ?? '',
  );

  constructor() {
    effect(() => {
      const key = this.blockKey();
      untracked(() => this.load(key));
    });
  }

  private load(key: BlockKey): void {
    this.loading.set(true);
    this.error.set(null);
    this.row.set(null);
    this.http
      .get<BlockTextRow[]>(`${this.base}/api/textos-bloque`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (all) => {
          this.row.set(all.find((item) => item.clave === key) ?? null);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el texto.');
          this.loading.set(false);
        },
      });
  }

  protected onDraft(value: string | null): void {
    this.draftChanged.emit(value !== null ? { [this.field()]: value } : null);
  }

  protected save(value: string): void {
    if (this.saving()) return;
    const row = this.row();
    this.saving.set(true);
    this.error.set(null);
    // Los otros textos del bloque se envían como están guardados (vacío = texto por defecto).
    const body = {
      etiqueta: row?.etiqueta ?? null,
      titulo: row?.titulo ?? null,
      subtitulo: row?.subtitulo ?? null,
      [this.field()]: value || null,
    };
    this.http
      .put<BlockTextRow>(`${this.base}/api/textos-bloque/${encodeURIComponent(this.blockKey())}`, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.row.set(updated);
          this.saving.set(false);
          this.toast.show('Texto actualizado.', 'success');
          this.saved.emit();
        },
        error: () => {
          this.saving.set(false);
          this.error.set('No se pudo guardar. Inténtalo de nuevo.');
        },
      });
  }
}
