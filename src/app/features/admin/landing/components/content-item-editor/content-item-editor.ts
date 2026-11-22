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
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';
import { trimTrailingSlashes } from '../../../../../shared/utils/text';
import { FieldEditor } from '../field-editor/field-editor';

export interface ContentField {
  readonly key: string;
  readonly label: string;
  readonly rows: number;
  readonly required: boolean;
  /** Lista: se muestra un elemento por línea y se guarda unido con « | ». No se ve en vivo en la página. */
  readonly list?: boolean;
  /** Número entero (vacío = sin valor). */
  readonly number?: boolean;
}

const SEPARATOR = ' | ';

/** Elementos de «contenido del sitio» editables al tocarlos en la vista previa (prefijo de `data-edit-item`). */
export const CONTENT_ITEMS: Readonly<
  Record<
    string,
    {
      endpoint: string;
      heading: string;
      fields: readonly ContentField[];
      /** Campo por el que se localiza el elemento en la lista (por defecto, `id`). */
      matchKey?: string;
      /** Si se indica, la petición solo lleva estos campos (el resto del registro no viaja). */
      bodyKeys?: readonly string[];
    }
  >
> = {
  empresa: {
    endpoint: 'empresa',
    heading: 'Empresa',
    bodyKeys: [
      'razonSocial', 'nombreComercial', 'ruc', 'direccion', 'ciudad', 'telefono', 'telefonoSecundario', 'email',
      'emailVentas', 'whatsapp', 'horarioAtencion', 'anioFundacion', 'zonaCobertura', 'tiempoRespuesta', 'latitud',
      'longitud', 'mision', 'vision', 'valores', 'resumenNosotros',
    ],
    fields: [
      { key: 'mision', label: 'Misión', rows: 4, required: false },
      { key: 'vision', label: 'Visión', rows: 4, required: false },
      { key: 'valores', label: 'Valores (uno por línea)', rows: 5, required: false, list: true },
      { key: 'zonaCobertura', label: 'Lugares donde trabajamos (separados por coma)', rows: 2, required: false },
      { key: 'anioFundacion', label: 'Año en que empezamos', rows: 1, required: false, number: true },
    ],
  },
  pagina: {
    endpoint: 'contenidos-pagina',
    heading: 'Cabecera de la página',
    matchKey: 'pagina',
    fields: [
      { key: 'eyebrow', label: 'Frase pequeña sobre el título', rows: 1, required: false },
      { key: 'titulo', label: 'Título', rows: 2, required: false },
      { key: 'introduccion', label: 'Introducción', rows: 3, required: false },
      { key: 'descripcion', label: 'Descripción', rows: 3, required: false },
    ],
  },
  garantia: {
    endpoint: 'garantias',
    heading: 'Garantía',
    fields: [
      { key: 'titulo', label: 'Título', rows: 1, required: true },
      { key: 'texto', label: 'Texto', rows: 3, required: true },
    ],
  },
  paso: {
    endpoint: 'pasos-proceso',
    heading: 'Paso del proceso',
    fields: [
      { key: 'titulo', label: 'Título', rows: 1, required: true },
      { key: 'texto', label: 'Texto', rows: 3, required: true },
    ],
  },
  faq: {
    endpoint: 'faqs',
    heading: 'Pregunta frecuente',
    fields: [
      { key: 'pregunta', label: 'Pregunta', rows: 1, required: true },
      { key: 'respuesta', label: 'Respuesta', rows: 4, required: true },
    ],
  },
  testimonio: {
    endpoint: 'testimonios',
    heading: 'Testimonio',
    fields: [
      { key: 'texto', label: 'Texto', rows: 4, required: true },
      { key: 'autor', label: 'Nombre', rows: 1, required: true },
      { key: 'cargo', label: 'Cargo o lugar', rows: 1, required: false },
    ],
  },
};

type Item = Record<string, unknown> & { id: string };

/** Valor guardado de un campo, tal como se muestra en el editor. */
function read(field: ContentField, item: Item | null): string {
  const raw = item?.[field.key];
  if (raw === null || raw === undefined) return '';
  if (field.list) return String(raw).split('|').map((line) => line.trim()).filter(Boolean).join('\n');
  return String(raw);
}

/** Lo que se envía al guardar un campo. */
function write(field: ContentField, text: string): string | number | null {
  if (field.list) {
    const lines = text.split('\n').map((line) => line.trim()).filter(Boolean);
    return lines.length > 0 ? lines.join(SEPARATOR) : null;
  }
  if (field.number) return text.trim() === '' || Number.isNaN(Number(text)) ? null : Math.trunc(Number(text));
  return text.trim() || null;
}

/**
 * Edita uno o varios textos de un elemento del contenido del sitio (garantía, testimonio…) tocado en la
 * vista previa. `field = 'ambos'` muestra todos sus campos; si no, solo el campo tocado.
 */
@Component({
  selector: 'app-content-item-editor',
  imports: [Button, FieldEditor, InputField, TextareaField],
  templateUrl: './content-item-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContentItemEditor {
  readonly kind = input.required<string>();
  readonly itemId = input.required<string>();
  /** Clave del campo tocado o `'ambos'` (todos). */
  readonly field = input.required<string>();

  /** Lo que se teclea, por campo (borrador en vivo), o `null` si no difiere de lo guardado. */
  readonly draftChanged = output<Readonly<Record<string, string>> | null>();
  readonly saved = output<void>();
  readonly closed = output<void>();

  private readonly http = inject(HttpClient);
  private readonly base = trimTrailingSlashes(inject(API_BASE_URL));
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly config = computed(() => CONTENT_ITEMS[this.kind()]);
  protected readonly item = signal<Item | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly values = signal<Record<string, string>>({});

  /** Campo suelto tocado (o `null` si se muestran todos). */
  protected readonly single = computed<ContentField | null>(
    () => this.config().fields.find((f) => f.key === this.field()) ?? null,
  );
  protected readonly heading = computed(() => {
    const single = this.single();
    return `${this.config().heading}${single ? ' · ' + single.label : ''}`;
  });
  protected readonly savedValue = computed(() => {
    const single = this.single();
    return single ? read(single, this.item()) : '';
  });
  protected readonly dirty = computed(() => {
    const item = this.item();
    return (
      !!item && this.config().fields.some((f) => (this.values()[f.key] ?? '') !== read(f, item))
    );
  });
  protected readonly invalid = computed(() =>
    this.config().fields.some((f) => f.required && (this.values()[f.key] ?? '').trim() === ''),
  );

  constructor() {
    effect(() => {
      const item = this.item();
      untracked(() =>
        this.values.set(
          Object.fromEntries(this.config().fields.map((f) => [f.key, read(f, item ?? null)])),
        ),
      );
    });
    effect(() => {
      const values = this.values();
      const dirty = this.dirty();
      untracked(() => {
        if (!this.single()) this.draftChanged.emit(dirty ? values : null);
      });
    });
    effect(() => {
      const id = this.itemId();
      untracked(() => this.load(id));
    });
  }

  private load(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.item.set(null);
    this.http
      .get<Item[]>(`${this.base}/api/${this.config().endpoint}`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (all) => {
          const matchKey = this.config().matchKey ?? 'id';
          // `*` = el primer (y único) registro, p. ej. la empresa.
          const found = (id === '*' ? all[0] : all.find((entry) => entry[matchKey] === id)) ?? null;
          this.item.set(found);
          this.error.set(found ? null : 'No se encontró el elemento.');
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el elemento.');
          this.loading.set(false);
        },
      });
  }

  protected setValue(key: string, value: string): void {
    this.values.update((current) => ({ ...current, [key]: value }));
  }

  protected onSingleDraft(value: string | null): void {
    const single = this.single();
    // Las listas y los números no se ven en vivo en la página.
    this.draftChanged.emit(value !== null && single && !single.list && !single.number ? { [single.key]: value } : null);
  }

  protected saveSingle(value: string): void {
    const single = this.single();
    if (single) this.persist({ [single.key]: write(single, value) });
  }

  protected saveAll(): void {
    if (!this.dirty() || this.invalid()) return;
    this.persist(
      Object.fromEntries(
        this.config().fields.map((f) => [f.key, write(f, this.values()[f.key] ?? '')]),
      ),
    );
  }

  private persist(patch: Record<string, string | number | null>): void {
    const item = this.item();
    if (!item || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    // El resto del elemento se envía tal cual está guardado; solo cambian los campos editados.
    const { id, fechaCreacion, fechaActualizacion, ...all } = item as Item & {
      fechaCreacion?: unknown;
      fechaActualizacion?: unknown;
    };
    void fechaCreacion;
    void fechaActualizacion;
    const keys = this.config().bodyKeys;
    const rest = keys ? Object.fromEntries(keys.map((key) => [key, all[key] ?? null])) : all;
    this.http
      .put<Item>(`${this.base}/api/${this.config().endpoint}/${encodeURIComponent(id)}`, { ...rest, ...patch })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.item.set(updated);
          this.saving.set(false);
          this.toast.show('Cambios guardados.', 'success');
          this.saved.emit();
        },
        error: () => {
          this.saving.set(false);
          this.error.set('No se pudo guardar. Revisa el texto e inténtalo de nuevo.');
        },
      });
  }
}
