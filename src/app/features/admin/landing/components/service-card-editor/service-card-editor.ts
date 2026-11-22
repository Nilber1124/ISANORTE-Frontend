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
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, forkJoin, of, switchMap } from 'rxjs';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { ToastService } from '../../../../../core/services/toast.service';
import { Button } from '../../../../../shared/components/button/button';
import { ImageUploaderComponent } from '../../../../../shared/components/image-uploader/image-uploader.component';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';
import { trimTrailingSlashes } from '../../../../../shared/utils/text';
import { FieldEditor } from '../field-editor/field-editor';

export type ServiceCardField = 'nombre' | 'descripcion' | 'imagenUrl' | 'beneficios' | 'ambos';

interface Benefit {
  id: string;
  texto: string;
  orden: number;
  activo: boolean;
}
interface Service {
  id: string;
  nombre: string;
  slug: string;
  resumen: string | null;
  descripcion: string | null;
  imagenUrl: string | null;
  etiqueta: string | null;
  imagenAlt: string | null;
  activo: boolean | null;
  destacado: boolean | null;
  orden: number | null;
  beneficios: Benefit[] | null;
}

const LABELS = {
  nombre: 'Nombre del servicio',
  descripcion: 'Descripción',
  imagenUrl: 'Foto',
  beneficios: 'Puntos (uno por línea)',
} as const;

/** «Diseño y elaboración de planos» → «diseno-y-elaboracion-de-planos». */
export function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Edita una tarjeta de la página Servicios (foto, nombre, descripción y puntos), crea un servicio nuevo o lo quita de la
 * web. Los servicios no se borran: «quitar» los desactiva y siguen disponibles en `/admin/servicios`.
 */
@Component({
  selector: 'app-service-card-editor',
  imports: [Button, FieldEditor, FormsModule, ImageUploaderComponent, InputField, TextareaField],
  templateUrl: './service-card-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceCardEditor {
  /** `'new'` para crear. */
  readonly serviceId = input.required<string>();
  readonly field = input.required<ServiceCardField>();

  readonly draftChanged = output<Readonly<Record<string, string>> | null>();
  readonly saved = output<void>();
  readonly closed = output<void>();

  private readonly http = inject(HttpClient);
  private readonly base = trimTrailingSlashes(inject(API_BASE_URL));
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly labels = LABELS;
  protected readonly isNew = computed(() => this.serviceId() === 'new');
  protected readonly service = signal<Service | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly confirmRemove = signal(false);
  protected readonly values = signal<Record<string, string>>({});
  private nextOrder = 0;

  /** Campo suelto de texto (nombre o descripción): se edita con el editor de un campo. */
  protected readonly simple = computed(() => {
    const f = this.field();
    return !this.isNew() && (f === 'nombre' || f === 'descripcion') ? f : null;
  });
  protected readonly keys = computed<readonly (keyof typeof LABELS)[]>(() => {
    const f = this.field();
    return f === 'ambos' ? ['nombre', 'descripcion', 'imagenUrl', 'beneficios'] : [f];
  });
  protected readonly heading = computed(() => {
    const f = this.field();
    return `${this.isNew() ? 'Nuevo · ' : ''}Servicio${f === 'ambos' ? '' : ' · ' + LABELS[f]}`;
  });
  protected readonly savedValue = computed(() => {
    const f = this.simple();
    return f ? (this.service()?.[f] ?? '') : '';
  });

  private baseline(key: string): string {
    const s = this.service();
    if (!s) return '';
    if (key === 'beneficios') return this.benefitLines(s).join('\n');
    return String((s as unknown as Record<string, unknown>)[key] ?? '');
  }
  private benefitLines(s: Service): string[] {
    return [...(s.beneficios ?? [])]
      .filter((b) => b.activo !== false)
      .sort((a, b) => a.orden - b.orden)
      .map((b) => b.texto);
  }

  protected readonly dirty = computed(() =>
    this.keys().some((k) => (this.values()[k] ?? '') !== this.baseline(k)),
  );
  protected readonly invalid = computed(
    () =>
      (this.keys().includes('nombre') && (this.values()['nombre'] ?? '').trim() === '') ||
      (this.keys().includes('descripcion') && (this.values()['descripcion'] ?? '').trim() === '') ||
      // Un servicio publicado necesita foto (regla del servidor).
      (this.keys().includes('imagenUrl') && (this.values()['imagenUrl'] ?? '').trim() === ''),
  );

  constructor() {
    effect(() => {
      const s = this.service();
      untracked(() =>
        this.values.set({
          nombre: s?.nombre ?? '',
          descripcion: s?.descripcion ?? '',
          imagenUrl: s?.imagenUrl ?? '',
          beneficios: s ? this.benefitLines(s).join('\n') : '',
        }),
      );
    });
    effect(() => {
      const v = this.values();
      const dirty = this.dirty();
      untracked(() => {
        if (this.simple() || this.isNew()) return;
        // Solo el nombre y la descripción se ven en vivo (la foto y los puntos, al guardar).
        const live: Record<string, string> = {};
        if (this.keys().includes('nombre')) live['nombre'] = v['nombre'] ?? '';
        if (this.keys().includes('descripcion')) live['descripcion'] = v['descripcion'] ?? '';
        this.draftChanged.emit(dirty && Object.keys(live).length > 0 ? live : null);
      });
    });
    effect(() => {
      const id = this.serviceId();
      untracked(() => this.load(id));
    });
  }

  private load(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.service.set(null);
    this.confirmRemove.set(false);
    this.http
      .get<Service[]>(`${this.base}/api/servicios`)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (all) => {
          if (id === 'new') {
            this.nextOrder = all.reduce((max, s) => Math.max(max, s.orden ?? -1), -1) + 1;
          } else {
            const found = all.find((s) => s.id === id) ?? null;
            this.service.set(found);
            if (!found) this.error.set('No se encontró el servicio.');
          }
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el servicio.');
          this.loading.set(false);
        },
      });
  }

  protected setValue(key: string, value: string): void {
    this.values.update((current) => ({ ...current, [key]: value }));
  }

  protected onSingleDraft(value: string | null): void {
    const f = this.simple();
    this.draftChanged.emit(value !== null && f ? { [f]: value } : null);
  }

  protected saveSingle(value: string): void {
    const f = this.simple();
    if (f) this.update({ [f]: value.trim() });
  }

  protected save(): void {
    if (!this.dirty() || this.invalid() || this.saving()) return;
    if (this.isNew()) return this.create();
    const v = this.values();
    const patch: Record<string, string | null> = {};
    if (this.keys().includes('nombre')) patch['nombre'] = (v['nombre'] ?? '').trim();
    if (this.keys().includes('descripcion')) patch['descripcion'] = (v['descripcion'] ?? '').trim();
    if (this.keys().includes('imagenUrl')) patch['imagenUrl'] = (v['imagenUrl'] ?? '').trim() || null;
    this.update(patch, this.keys().includes('beneficios') ? this.lines(v['beneficios'] ?? '') : null);
  }

  private lines(text: string): string[] {
    return text.split('\n').map((l) => l.trim()).filter(Boolean);
  }

  /** Cambia los campos indicados del servicio (el resto viaja tal cual) y, si se editaron, sincroniza sus puntos. */
  private update(patch: Record<string, string | null>, benefits: string[] | null = null): void {
    const s = this.service();
    if (!s || this.saving()) return;
    this.begin();
    const body = {
      nombre: s.nombre, slug: s.slug, resumen: s.resumen, descripcion: s.descripcion ?? '', imagenUrl: s.imagenUrl,
      etiqueta: s.etiqueta, imagenAlt: s.imagenAlt, activo: s.activo ?? true, destacado: s.destacado ?? false,
      orden: s.orden ?? 0, ...patch,
    };
    this.http
      .put<Service>(`${this.base}/api/servicios/${encodeURIComponent(s.id)}`, body)
      .pipe(
        switchMap((updated) => (benefits ? this.syncBenefits(updated.id, s.beneficios ?? [], benefits) : of(null))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({ next: () => this.done('Servicio actualizado.', false), error: (e) => this.fail('No se pudo guardar.', e) });
  }

  /** Deja los puntos del servicio como las líneas indicadas (edita, crea y quita según haga falta). */
  private syncBenefits(serviceId: string, current: Benefit[], lines: string[]): Observable<unknown> {
    const sorted = [...current].filter((b) => b.activo !== false).sort((a, b) => a.orden - b.orden);
    const url = `${this.base}/api/servicios/${encodeURIComponent(serviceId)}/beneficios`;
    const ops: Observable<unknown>[] = [];
    lines.forEach((texto, i) => {
      const existing = sorted[i];
      if (!existing) ops.push(this.http.post(url, { texto, orden: i, activo: true }));
      else if (existing.texto !== texto || existing.orden !== i)
        ops.push(this.http.put(`${url}/${encodeURIComponent(existing.id)}`, { texto, orden: i, activo: true }));
    });
    sorted.slice(lines.length).forEach((b) => ops.push(this.http.delete(`${url}/${encodeURIComponent(b.id)}`)));
    return ops.length > 0 ? forkJoin(ops) : of(null);
  }

  private create(): void {
    const v = this.values();
    const nombre = (v['nombre'] ?? '').trim();
    this.begin();
    const slug = slugify(nombre) || `servicio-${Date.now().toString(36)}`;
    this.http
      .get<{ available: boolean }>(`${this.base}/api/servicios/slug-disponible`, { params: { slug } })
      .pipe(
        switchMap((check) => {
          const finalSlug = check.available ? slug : `${slug}-${Date.now().toString(36).slice(-4)}`;
          const imagenUrl = (v['imagenUrl'] ?? '').trim() || null;
          return this.http.post<Service>(`${this.base}/api/servicios`, {
            nombre, slug: finalSlug, resumen: null, descripcion: (v['descripcion'] ?? '').trim(),
            imagenUrl, etiqueta: null, imagenAlt: imagenUrl ? nombre : null, activo: true, destacado: false,
            orden: this.nextOrder,
          });
        }),
        switchMap((created) => this.syncBenefits(created.id, [], this.lines(v['beneficios'] ?? ''))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({ next: () => this.done('Servicio creado.', true), error: (e) => this.fail('No se pudo crear el servicio.', e) });
  }

  /** Quita el servicio de la web (lo desactiva; no se borra). */
  protected remove(): void {
    const s = this.service();
    if (!s || this.saving()) return;
    this.begin();
    this.http
      .patch(`${this.base}/api/servicios/${encodeURIComponent(s.id)}/activo`, { activo: false })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: () => this.done('Servicio quitado de la web.', true), error: (e) => this.fail('No se pudo quitar.', e) });
  }

  private begin(): void {
    this.saving.set(true);
    this.error.set(null);
  }
  private done(message: string, close: boolean): void {
    this.saving.set(false);
    this.toast.show(message, 'success');
    this.saved.emit();
    if (close) this.closed.emit();
    else this.load(this.serviceId());
  }
  private fail(message: string, response?: unknown): void {
    this.saving.set(false);
    this.confirmRemove.set(false);
    // El servidor explica el motivo (p. ej. «No se puede publicar un servicio sin imagen»).
    const reason = (response as { error?: { message?: string } } | undefined)?.error?.message;
    this.error.set(reason ? `${message} ${reason}` : message);
  }
}
