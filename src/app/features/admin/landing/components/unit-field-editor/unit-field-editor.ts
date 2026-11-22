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
import { Button } from '../../../../../shared/components/button/button';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';
import { trimTrailingSlashes } from '../../../../../shared/utils/text';
import { FieldEditor } from '../field-editor/field-editor';

export type UnitField = 'descripcion' | 'ofertas' | 'ambos';

interface Unit {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  icono: string | null;
  imagenUrl: string | null;
  imagenAlt: string | null;
  /** Líneas separadas por «|». */
  ofertas: string | null;
  activo: boolean | null;
  destacado: boolean | null;
  orden: number | null;
  empresa: { id: string };
}

const SEPARATOR = ' | ';
const toLines = (ofertas: string | null): string =>
  (ofertas ?? '').split('|').map((line) => line.trim()).filter(Boolean).join('\n');
const fromLines = (text: string): string | null => {
  const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
  return lines.length > 0 ? lines.join(SEPARATOR) : null;
};

/** Edita la descripción y/o los puntos de oferta de la unidad de negocio (bloque ISADECOR de la Home). */
@Component({
  selector: 'app-unit-field-editor',
  imports: [Button, FieldEditor, TextareaField],
  templateUrl: './unit-field-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UnitFieldEditor {
  readonly unitSlug = input.required<string>();
  readonly field = input.required<UnitField>();

  /** Lo que se teclea (la descripción se ve en vivo; los puntos, al guardar). */
  readonly draftChanged = output<Readonly<Record<string, string>> | null>();
  readonly saved = output<void>();
  readonly closed = output<void>();

  private readonly http = inject(HttpClient);
  private readonly base = trimTrailingSlashes(inject(API_BASE_URL));
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly unit = signal<Unit | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly descripcionText = signal('');
  protected readonly ofertasText = signal('');

  protected readonly heading = computed(() => {
    const field = this.field();
    return `ISADECOR${field === 'descripcion' ? ' · Descripción' : field === 'ofertas' ? ' · Puntos de oferta' : ''}`;
  });
  protected readonly savedValue = computed(() => {
    const unit = this.unit();
    if (!unit) return '';
    return this.field() === 'ofertas' ? toLines(unit.ofertas) : (unit.descripcion ?? '');
  });
  protected readonly dirtyBoth = computed(() => {
    const unit = this.unit();
    return (
      !!unit &&
      (this.descripcionText() !== (unit.descripcion ?? '') || this.ofertasText() !== toLines(unit.ofertas))
    );
  });

  constructor() {
    effect(() => {
      const unit = this.unit();
      untracked(() => {
        this.descripcionText.set(unit?.descripcion ?? '');
        this.ofertasText.set(toLines(unit?.ofertas ?? null));
      });
    });
    effect(() => {
      // Solo la descripción se ve en vivo: los puntos son una lista de elementos y se ven al guardar.
      const values = { descripcion: this.descripcionText() };
      const dirty = this.descripcionText() !== (this.unit()?.descripcion ?? '');
      untracked(() => {
        if (this.field() === 'ambos') this.draftChanged.emit(dirty ? values : null);
      });
    });
    effect(() => {
      const slug = this.unitSlug();
      untracked(() => this.load(slug));
    });
  }

  private load(slug: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.unit.set(null);
    this.http
      .get<Unit>(`${this.base}/api/unidades-negocio/slug/${encodeURIComponent(slug)}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (unit) => {
          this.unit.set(unit);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar la unidad de negocio.');
          this.loading.set(false);
        },
      });
  }

  protected onSingleDraft(value: string | null): void {
    this.draftChanged.emit(value !== null && this.field() === 'descripcion' ? { descripcion: value } : null);
  }

  protected saveSingle(value: string): void {
    this.persist(
      this.field() === 'ofertas'
        ? { ofertas: fromLines(value) }
        : { descripcion: value.trim() || null },
    );
  }

  protected saveBoth(): void {
    if (!this.dirtyBoth()) return;
    this.persist({
      descripcion: this.descripcionText().trim() || null,
      ofertas: fromLines(this.ofertasText()),
    });
  }

  private persist(patch: { descripcion?: string | null; ofertas?: string | null }): void {
    const unit = this.unit();
    if (!unit || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    // El resto de la unidad se envía tal cual está guardado; solo cambian los textos editados.
    const body = {
      nombre: unit.nombre,
      slug: unit.slug,
      descripcion: unit.descripcion,
      icono: unit.icono,
      imagenUrl: unit.imagenUrl,
      imagenAlt: unit.imagenAlt,
      ofertas: unit.ofertas,
      activo: unit.activo ?? true,
      destacado: unit.destacado ?? false,
      orden: unit.orden ?? 0,
      empresaId: unit.empresa.id,
      ...patch,
    };
    this.http
      .put<Unit>(`${this.base}/api/unidades-negocio/${encodeURIComponent(unit.id)}`, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.unit.set(updated);
          this.saving.set(false);
          this.toast.show('Unidad de negocio actualizada.', 'success');
          this.saved.emit();
        },
        error: () => {
          this.saving.set(false);
          this.error.set('No se pudo guardar. Inténtalo de nuevo.');
        },
      });
  }
}
