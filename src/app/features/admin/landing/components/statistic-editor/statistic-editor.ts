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
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { trimTrailingSlashes } from '../../../../../shared/utils/text';

export type StatisticField = 'etiqueta' | 'valor' | 'ambos';

interface Statistic {
  id: string;
  valor: number;
  prefijo: string | null;
  sufijo: string | null;
  etiqueta: string;
  orden: number;
  activo: boolean;
}
interface Company {
  id: string;
  estadisticas: Statistic[] | null;
}

const LABELS: Record<string, string> = {
  cifra: 'Cifra (tal como se ve, p. ej. +12 años)',
  etiqueta: 'Etiqueta',
};

/** «+12 años» ← prefijo «+», cifra 12, sufijo « años». */
function combine(stat: Statistic | null): string {
  if (!stat) return '';
  return `${stat.prefijo ?? ''}${Number(stat.valor)}${stat.sufijo ?? ''}`;
}

/** Separa «+12 años» en prefijo, cifra y sufijo; `null` si no hay una cifra. */
export function parseFigure(text: string): { prefijo: string | null; valor: number; sufijo: string | null } | null {
  const match = /^([^0-9-]*)(-?\d+(?:[.,]\d+)?)(.*)$/.exec(text);
  if (!match) return null;
  const valor = Number(match[2].replace(',', '.'));
  if (Number.isNaN(valor)) return null;
  const sufijo = match[3].trimEnd();
  return { prefijo: match[1].trim() || null, valor, sufijo: sufijo.trim() ? sufijo : null };
}

/**
 * Edita una estadística de la empresa («+12 años de experiencia…») tocada en la vista previa. La página pública no
 * expone su id, así que se localiza por su orden. Tocar la cifra edita prefijo, cifra y sufijo; la etiqueta, solo ella.
 */
@Component({
  selector: 'app-statistic-editor',
  imports: [Button, InputField],
  templateUrl: './statistic-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticEditor {
  readonly orden = input.required<number>();
  readonly field = input.required<StatisticField>();

  /** Lo que se teclea, por campo de la página (`valor` = la cifra completa, p. ej. «+12 años»). */
  readonly draftChanged = output<Readonly<Record<string, string>> | null>();
  readonly saved = output<void>();
  readonly closed = output<void>();

  private readonly http = inject(HttpClient);
  private readonly base = trimTrailingSlashes(inject(API_BASE_URL));
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly company = signal<Company | null>(null);
  protected readonly stat = signal<Statistic | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly values = signal<Record<string, string>>({});

  protected readonly keys = computed<readonly string[]>(() => {
    const field = this.field();
    return field === 'etiqueta' ? ['etiqueta'] : field === 'valor' ? ['cifra'] : ['cifra', 'etiqueta'];
  });
  protected readonly labels = LABELS;
  protected readonly heading = computed(
    () => `Estadística${this.field() === 'etiqueta' ? ' · Etiqueta' : this.field() === 'valor' ? ' · Cifra' : ''}`,
  );

  private saved$(stat: Statistic | null): Record<string, string> {
    return { cifra: combine(stat), etiqueta: stat?.etiqueta ?? '' };
  }

  protected readonly dirty = computed(() => {
    const stat = this.stat();
    if (!stat) return false;
    const saved = this.saved$(stat);
    return this.keys().some((k) => (this.values()[k] ?? '') !== saved[k]);
  });
  protected readonly invalid = computed(() => {
    const v = this.values();
    return (
      (this.keys().includes('cifra') && parseFigure(v['cifra'] ?? '') === null) ||
      (this.keys().includes('etiqueta') && (v['etiqueta'] ?? '').trim() === '')
    );
  });

  constructor() {
    effect(() => {
      const stat = this.stat();
      untracked(() => this.values.set(this.saved$(stat)));
    });
    effect(() => {
      const v = this.values();
      const dirty = this.dirty();
      const keys = this.keys();
      untracked(() => {
        if (!dirty) return this.draftChanged.emit(null);
        const draft: Record<string, string> = {};
        if (keys.includes('cifra')) draft['valor'] = v['cifra'] ?? '';
        if (keys.includes('etiqueta')) draft['etiqueta'] = v['etiqueta'] ?? '';
        this.draftChanged.emit(draft);
      });
    });
    effect(() => {
      const orden = this.orden();
      untracked(() => this.load(orden));
    });
  }

  private load(orden: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.stat.set(null);
    this.http
      .get<Company[]>(`${this.base}/api/empresa`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (all) => {
          const company = all[0] ?? null;
          this.company.set(company);
          const found = (company?.estadisticas ?? []).find((s) => s.activo !== false && s.orden === orden) ?? null;
          this.stat.set(found);
          this.error.set(found ? null : 'No se encontró la estadística.');
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar la estadística.');
          this.loading.set(false);
        },
      });
  }

  protected setValue(key: string, value: string): void {
    this.values.update((current) => ({ ...current, [key]: value }));
  }

  protected save(): void {
    const stat = this.stat();
    const company = this.company();
    if (!stat || !company || this.saving() || !this.dirty() || this.invalid()) return;
    const v = this.values();
    this.saving.set(true);
    this.error.set(null);
    // Lo que no se editó viaja tal cual está guardado.
    const figure = this.keys().includes('cifra') ? parseFigure(v['cifra'] ?? '') : null;
    const body = {
      valor: figure ? figure.valor : stat.valor,
      prefijo: figure ? figure.prefijo : stat.prefijo,
      sufijo: figure ? figure.sufijo : stat.sufijo,
      etiqueta: this.keys().includes('etiqueta') ? (v['etiqueta'] ?? '').trim() : stat.etiqueta,
      orden: stat.orden,
      activo: stat.activo ?? true,
    };
    this.http
      .put<Statistic>(`${this.base}/api/empresa/${encodeURIComponent(company.id)}/estadisticas/${encodeURIComponent(stat.id)}`, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.stat.set(updated);
          this.saving.set(false);
          this.toast.show('Estadística actualizada.', 'success');
          this.saved.emit();
        },
        error: () => {
          this.saving.set(false);
          this.error.set('No se pudo guardar. Revisa los datos e inténtalo de nuevo.');
        },
      });
  }
}
