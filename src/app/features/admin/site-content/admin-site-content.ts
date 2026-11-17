import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import { ToastService } from '../../../core/services/toast.service';
import { ArchivoApiService } from '../../../data/services/archivo-api.service';
import { trimTrailingSlashes } from '../../../shared/utils/text';
import { SITE_CONTENT_ENTITIES, SiteContentEntity, SiteContentField } from './site-content.config';

type Row = Record<string, unknown> & { id: string; activo: boolean; orden: number };
type FormValue = Record<string, string | number | boolean | null>;

/**
 * Pantalla genérica de administración del contenido del sitio. La entidad se elige por la ruta
 * (`data.entity`) y su descripción vive en `site-content.config.ts`.
 */
@Component({
  selector: 'app-admin-site-content',
  templateUrl: './admin-site-content.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSiteContent {
  private readonly http = inject(HttpClient);
  private readonly files = inject(ArchivoApiService);
  private readonly toast = inject(ToastService);
  private readonly base = trimTrailingSlashes(inject(API_BASE_URL));

  private readonly entityKey = toSignal(
    inject(ActivatedRoute).data.pipe(map((data) => data['entity'] as string)),
    { initialValue: '' },
  );

  readonly entity = computed<SiteContentEntity | null>(
    () => SITE_CONTENT_ENTITIES.find((item) => item.key === this.entityKey()) ?? null,
  );

  readonly rows = signal<readonly Row[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly saving = signal(false);
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

  text(row: Row, key: string | undefined): string {
    return key ? String(row[key] ?? '') : '';
  }

  openNew(): void {
    const entity = this.entity();
    if (!entity) return;
    const value: FormValue = { activo: true, orden: this.rows().length };
    for (const field of entity.fields) {
      value[field.key] = field.type === 'checkbox' ? false : field.type === 'number' ? null : '';
    }
    this.form.set(value);
    this.editing.set('new');
  }

  openEdit(row: Row): void {
    const entity = this.entity();
    if (!entity) return;
    const value: FormValue = { activo: row.activo, orden: row.orden };
    for (const field of entity.fields) {
      const current = row[field.key];
      value[field.key] =
        field.type === 'checkbox'
          ? Boolean(current)
          : field.type === 'number'
            ? ((current as number | null) ?? null)
            : String(current ?? '');
    }
    this.form.set(value);
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

  save(): void {
    if (this.saving() || !this.valid()) return;
    const body: FormValue = {};
    for (const [key, value] of Object.entries(this.form())) {
      body[key] = typeof value === 'string' ? value.trim() || null : value;
    }
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

  toggle(row: Row): void {
    this.http.patch(this.url(`/${row.id}/activo`), { activo: !row.activo }).subscribe({
      next: () => this.load(),
      error: () => this.toast.show('No se pudo cambiar el estado.', 'error'),
    });
  }

  remove(row: Row): void {
    const entity = this.entity();
    if (!entity || !window.confirm('¿Eliminar este registro? No se puede deshacer.')) return;
    this.http.delete(this.url(`/${row.id}`)).subscribe({
      next: () => this.load(),
      error: () => this.toast.show('No se pudo eliminar.', 'error'),
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
}
