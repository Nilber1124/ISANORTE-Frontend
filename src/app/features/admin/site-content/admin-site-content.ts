import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { forkJoin, map } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import { ToastService } from '../../../core/services/toast.service';
import { ArchivoApiService } from '../../../data/services/archivo-api.service';
import { Alert } from '../../../shared/components/alert/alert';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { InputField } from '../../../shared/components/input-field/input-field';
import { Loading } from '../../../shared/components/loading/loading';
import { Modal } from '../../../shared/components/modal/modal';
import { SelectField, SelectOption } from '../../../shared/components/select-field/select-field';
import { TextareaField } from '../../../shared/components/textarea-field/textarea-field';
import { trimTrailingSlashes } from '../../../shared/utils/text';
import {
  ISADECOR_HOME_ENTITIES,
  SITE_CONTENT_ENTITIES,
  SiteContentEntity,
  SiteContentField,
} from './site-content.config';
import { AdminPageHeader } from '../shared/admin-page-header/admin-page-header';

interface RefOption {
  readonly id: string;
  readonly label: string;
}
interface SelectionItem {
  readonly productoId: string;
  readonly nombre: string;
}

type Row = Record<string, unknown> & { id: string; activo: boolean; orden: number };
type FormValue = Record<string, string | number | boolean | null>;

/**
 * Pantalla genérica de administración del contenido del sitio. La entidad se elige por la ruta
 * (`data.entity`) y su descripción vive en `site-content.config.ts`.
 */
@Component({
  selector: 'app-admin-site-content',
  imports: [AdminPageHeader, Alert, Button, EmptyState, InputField, Loading, Modal, SelectField, TextareaField],
  templateUrl: './admin-site-content.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSiteContent {
  private readonly http = inject(HttpClient);
  private readonly files = inject(ArchivoApiService);
  private readonly toast = inject(ToastService);
  private readonly base = trimTrailingSlashes(inject(API_BASE_URL));

  /** Clave de la entidad cuando la pantalla va incrustada en otra; si no, se toma de la ruta (`data.entity`). */
  readonly entityKey = input<string | null>(null);
  /** Incrustada: sin el encabezado de página (la pantalla que la contiene pone el suyo). */
  readonly embedded = input(false, { transform: booleanAttribute });

  private readonly routeEntityKey = toSignal(
    inject(ActivatedRoute).data.pipe(map((data) => data['entity'] as string)),
    { initialValue: '' },
  );
  private readonly resolvedEntityKey = computed(() => this.entityKey() ?? this.routeEntityKey());

  readonly entity = computed<SiteContentEntity | null>(
    () =>
      [...SITE_CONTENT_ENTITIES, ...ISADECOR_HOME_ENTITIES].find(
        (item) => item.key === this.resolvedEntityKey(),
      ) ?? null,
  );

  /** Las mismas opciones de `refOptions`, en el formato del selector compartido. */
  readonly refChoices = computed<Record<string, readonly SelectOption[]>>(() =>
    Object.fromEntries(
      Object.entries(this.refOptions()).map(([key, list]) => [
        key,
        [{ value: '', label: 'Selecciona…' }, ...list.map((o) => ({ value: o.id, label: o.label }))],
      ]),
    ),
  );

  /** Opciones de los campos `ref`, por clave de campo. */
  readonly refOptions = signal<Record<string, readonly RefOption[]>>({});
  private unitId: string | null = null;

  /** Productos disponibles y selección fijada/excluida de la sección en edición. */
  readonly products = signal<readonly RefOption[]>([]);
  readonly pinned = signal<readonly string[]>([]);
  readonly excluded = signal<readonly string[]>([]);
  readonly savingSelection = signal(false);

  readonly rows = signal<readonly Row[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);
  readonly reordering = signal(false);
  readonly uploading = signal<string | null>(null);
  /** `null` = cerrado; `'new'` = alta; si no, el id en edición. */
  readonly editing = signal<string | null>(null);
  readonly form = signal<FormValue>({});

  constructor() {
    effect(() => {
      if (this.entity()) this.load();
    });
  }

  private url(suffix = ''): string {
    return `${this.base}/api/${this.entity()?.endpoint}${suffix}`;
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.editing.set(null);
    this.loadSupport();
    this.http.get<Row[]>(this.url()).subscribe({
      next: (rows) => {
        this.rows.set(rows);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar los registros.');
        this.loading.set(false);
      },
    });
  }

  /** Carga la unidad de negocio y las listas de los campos `ref` que la entidad necesita. */
  private loadSupport(): void {
    const entity = this.entity();
    if (!entity) return;
    if (entity.unitSlug && !this.unitId) {
      this.http
        .get<{ id: string }>(`${this.base}/api/unidades-negocio/activas/slug/${entity.unitSlug}`)
        .subscribe({ next: (unit) => (this.unitId = unit.id) });
    }
    for (const field of entity.fields) {
      const ref = field.ref;
      if (!ref) continue;
      this.http.get<Record<string, unknown>[]>(`${this.base}/api/${ref.endpoint}`).subscribe({
        next: (items) =>
          this.refOptions.update((current) => ({
            ...current,
            [field.key]: items.map((item) => ({
              id: String(item['id']),
              label: String(item[ref.labelKey] ?? ''),
            })),
          })),
      });
    }
    if (entity.selection) {
      this.http.get<Record<string, unknown>[]>(`${this.base}/api/productos`).subscribe({
        next: (items) =>
          this.products.set(
            items.map((item) => ({ id: String(item['id']), label: String(item['nombre']) })),
          ),
      });
    }
  }

  selectOptions(field: SiteContentField): readonly SelectOption[] {
    return [{ value: '', label: 'Selecciona…' }, ...(field.options ?? [])];
  }

  text(row: Row, key: string | undefined): string {
    return key ? String(row[key] ?? '') : '';
  }

  openNew(): void {
    const entity = this.entity();
    if (!entity) return;
    const value: FormValue = { activo: true, orden: this.rows().length };
    this.pinned.set([]);
    this.excluded.set([]);
    for (const field of entity.fields) {
      value[field.key] =
        field.type === 'checkbox'
          ? false
          : field.type === 'number'
            ? null
            : (field.initial ?? '');
    }
    this.form.set(value);
    this.editing.set('new');
  }

  private formFromRow(row: Row, entity: SiteContentEntity): FormValue {
    const value: FormValue = { activo: row.activo ?? true, orden: row.orden ?? 0 };
    for (const field of entity.fields) {
      const current = row[field.key];
      value[field.key] =
        field.type === 'checkbox'
          ? Boolean(current)
          : field.type === 'number'
            ? ((current as number | null) ?? null)
            : String(current ?? '');
    }
    return value;
  }

  openEdit(row: Row): void {
    const entity = this.entity();
    if (!entity) return;
    if (entity.selection) this.loadSelection(row.id);
    this.form.set(this.formFromRow(row, entity));
    this.editing.set(row.id);
  }

  cancel(): void {
    this.editing.set(null);
  }

  set(key: string, value: string | number | boolean | null): void {
    this.form.update((current) => ({ ...current, [key]: value }));
  }

  setNumber(key: string, raw: string): void {
    this.set(key, raw === '' ? null : Number(raw));
  }

  valid(): boolean {
    const entity = this.entity();
    if (!entity) return false;
    const form = this.form();
    return entity.fields.every(
      (field) =>
        !field.required ||
        (field.type === 'number'
          ? form[field.key] !== null
          : String(form[field.key] ?? '').trim() !== ''),
    );
  }

  /** Cuerpo de la petición a partir de los valores del formulario; `null` si falta la unidad. */
  private toBody(form: FormValue, entity: SiteContentEntity): FormValue | null {
    const body: FormValue = {};
    for (const [key, value] of Object.entries(form)) {
      body[key] = typeof value === 'string' ? value.trim() || null : value;
    }
    if (entity.noOrder) delete body['orden'];
    if (entity.noActive) delete body['activo'];
    if (entity.unitSlug) {
      if (!this.unitId) {
        this.toast.show('No se pudo identificar la unidad de negocio.', 'error');
        return null;
      }
      body['unidadNegocioId'] = this.unitId;
    }
    return body;
  }

  save(): void {
    if (this.saving() || !this.valid()) return;
    const entity = this.entity();
    if (!entity) return;
    const body = this.toBody(this.form(), entity);
    if (!body) return;
    // Los textos obligatorios nunca viajan vacíos (la validación ya lo impide).
    const id = this.editing();
    this.saving.set(true);
    const request =
      id === 'new' ? this.http.post(this.url(), body) : this.http.put(this.url(`/${id}`), body);
    request.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.show('Guardado correctamente.', 'success');
        this.load();
      },
      error: () => {
        this.saving.set(false);
        this.toast.show('No se pudo guardar. Revisa los datos.', 'error');
      },
    });
  }

  /** Sube o baja un registro intercambiando su orden con el vecino. */
  move(row: Row, direction: -1 | 1): void {
    const entity = this.entity();
    const rows = this.rows();
    const index = rows.findIndex((item) => item.id === row.id);
    const neighbor = rows[index + direction];
    if (!entity || !neighbor || this.reordering()) return;
    const rowOrder = row.orden ?? 0;
    const neighborOrder = neighbor.orden ?? 0;
    // Con órdenes iguales no hay nada que intercambiar: se separa el movido.
    const [nextRow, nextNeighbor] =
      rowOrder === neighborOrder
        ? [neighborOrder + direction, neighborOrder]
        : [neighborOrder, rowOrder];
    const put = (item: Row, orden: number) => {
      const body = this.toBody({ ...this.formFromRow(item, entity), orden }, entity);
      return body ? this.http.put(this.url(`/${item.id}`), body) : null;
    };
    const first = put(row, nextRow);
    const second = put(neighbor, nextNeighbor);
    if (!first || !second) return;
    this.reordering.set(true);
    forkJoin([first, second]).subscribe({
      next: () => {
        this.reordering.set(false);
        this.load();
      },
      error: () => {
        this.reordering.set(false);
        this.toast.show('No se pudo cambiar el orden.', 'error');
        this.load();
      },
    });
  }

  toggle(row: Row): void {
    this.http.patch(this.url(`/${row.id}/activo`), { activo: !row.activo }).subscribe({
      next: () => this.load(),
      error: () => this.toast.show('No se pudo cambiar el estado.', 'error'),
    });
  }

  /** Registro pendiente de confirmar su eliminación. */
  readonly deleting = signal<Row | null>(null);
  readonly deletingBusy = signal(false);

  remove(row: Row): void {
    this.deleting.set(row);
  }

  cancelRemove(): void {
    if (!this.deletingBusy()) this.deleting.set(null);
  }

  confirmRemove(): void {
    const row = this.deleting();
    if (!row || this.deletingBusy()) return;
    this.deletingBusy.set(true);
    this.http.delete(this.url(`/${row.id}`)).subscribe({
      next: () => {
        this.deletingBusy.set(false);
        this.deleting.set(null);
        this.toast.show('Registro eliminado.', 'success');
        this.load();
      },
      error: () => {
        this.deletingBusy.set(false);
        this.deleting.set(null);
        this.toast.show('No se pudo eliminar.', 'error');
      },
    });
  }

  upload(field: SiteContentField, event: Event): void {
    const entity = this.entity();
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!entity || !file) return;
    this.uploading.set(field.key);
    this.files.uploadImage(file, entity.folder).subscribe({
      next: (response) => {
        this.set(field.key, response.url);
        this.uploading.set(null);
      },
      error: () => {
        this.uploading.set(null);
        this.toast.show('No se pudo subir la imagen.', 'error');
      },
    });
    input.value = '';
  }

  hasOrder(): boolean {
    return !this.entity()?.noOrder;
  }

  hasActive(): boolean {
    return !this.entity()?.noActive;
  }

  // --- Productos fijados y excluidos de una sección ---------------------------------------

  private loadSelection(sectionId: string): void {
    const base = `${this.base}/api/isadecor/secciones/${sectionId}`;
    this.http.get<SelectionItem[]>(`${base}/fijados`).subscribe({
      next: (items) => this.pinned.set(items.map((item) => item.productoId)),
    });
    this.http.get<SelectionItem[]>(`${base}/excluidos`).subscribe({
      next: (items) => this.excluded.set(items.map((item) => item.productoId)),
    });
  }

  productName(id: string): string {
    return this.products().find((item) => item.id === id)?.label ?? id;
  }

  /** Productos que aún se pueden fijar (ni fijados ni excluidos). */
  pinnable(): readonly RefOption[] {
    return this.products().filter(
      (item) => !this.pinned().includes(item.id) && !this.excluded().includes(item.id),
    );
  }

  pin(id: string): void {
    if (id) this.pinned.update((current) => [...current, id]);
  }

  unpin(id: string): void {
    this.pinned.update((current) => current.filter((item) => item !== id));
  }

  movePinned(index: number, delta: -1 | 1): void {
    this.pinned.update((current) => {
      const target = index + delta;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  toggleExcluded(id: string, checked: boolean): void {
    this.excluded.update((current) =>
      checked ? [...new Set([...current, id])] : current.filter((item) => item !== id),
    );
    if (checked) this.unpin(id);
  }

  saveSelection(): void {
    const id = this.editing();
    if (!id || id === 'new' || this.savingSelection()) return;
    const base = `${this.base}/api/isadecor/secciones/${id}`;
    this.savingSelection.set(true);
    this.http.put(`${base}/fijados`, { productoIds: this.pinned() }).subscribe({
      next: () =>
        this.http.put(`${base}/excluidos`, { productoIds: this.excluded() }).subscribe({
          next: () => {
            this.savingSelection.set(false);
            this.toast.show('Selección guardada.', 'success');
          },
          error: () => this.failSelection(),
        }),
      error: () => this.failSelection(),
    });
  }

  private failSelection(): void {
    this.savingSelection.set(false);
    this.toast.show('No se pudo guardar la selección.', 'error');
  }

  /** Rótulo de la marca a la que pertenece el contenido (ISADECOR Home o ISANORTE). */
  protected eyebrowFor(config: SiteContentEntity): string {
    return ISADECOR_HOME_ENTITIES.includes(config) ? 'Home ISADECOR' : 'Contenido ISANORTE';
  }
}
