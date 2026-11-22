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
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { ToastService } from '../../../../../core/services/toast.service';
import { Button } from '../../../../../shared/components/button/button';
import { ImageUploaderComponent } from '../../../../../shared/components/image-uploader/image-uploader.component';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';
import { trimTrailingSlashes } from '../../../../../shared/utils/text';
import { FieldEditor } from '../field-editor/field-editor';
import { slugify } from '../service-card-editor/service-card-editor';

export type ProjectCardField =
  | 'nombre'
  | 'descripcion'
  | 'ubicacion'
  | 'fechaProyecto'
  | 'imagenUrl'
  | 'tipoObra'
  | 'servicios'
  | 'ambos';

interface Project {
  id: string;
  nombre: string;
  slug: string;
  cliente: string | null;
  ubicacion: string | null;
  fechaProyecto: string | null;
  areaM2?: number | null;
  plazoMeses?: number | null;
  alcance?: string | null;
  tipoObra?: string | null;
  descripcion: string;
  imagenUrl: string | null;
  imagenAlt: string | null;
  destacado: boolean | null;
  activo: boolean | null;
  orden: number | null;
  servicios: { id: string; nombre: string; slug: string }[] | null;
}
interface ServiceOption {
  id: string;
  nombre: string;
}

const LABELS = {
  nombre: 'Nombre del proyecto',
  descripcion: 'Descripción',
  ubicacion: 'Ubicación',
  fechaProyecto: 'Periodo de ejecución',
  imagenUrl: 'Foto de portada',
  tipoObra: 'Tipo de obra',
  servicios: 'Servicios que se aplicaron',
} as const;
type Key = keyof typeof LABELS;

const TYPES = [
  { value: 'VIVIENDA', label: 'Vivienda' },
  { value: 'COMERCIAL', label: 'Comercial' },
  { value: 'INDUSTRIAL', label: 'Industrial' },
  { value: 'INSTITUCIONAL', label: 'Institucional' },
  { value: 'REMODELACION', label: 'Remodelación' },
  { value: 'HABILITACION', label: 'Habilitación urbana' },
] as const;

const TEXT_KEYS: readonly Key[] = ['nombre', 'descripcion', 'ubicacion', 'fechaProyecto'];

/**
 * Edita una tarjeta de la página Proyectos (portada, nombre, descripción, ubicación, periodo, tipo de obra y
 * servicios), crea un proyecto nuevo o lo quita de la web. «Quitar» lo desactiva: sigue en `/admin/proyectos`.
 */
@Component({
  selector: 'app-project-card-editor',
  imports: [Button, FieldEditor, FormsModule, ImageUploaderComponent, InputField, TextareaField],
  templateUrl: './project-card-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCardEditor {
  /** `'new'` para crear. */
  readonly projectId = input.required<string>();
  readonly field = input.required<ProjectCardField>();

  readonly draftChanged = output<Readonly<Record<string, string>> | null>();
  readonly saved = output<void>();
  readonly closed = output<void>();

  private readonly http = inject(HttpClient);
  private readonly base = trimTrailingSlashes(inject(API_BASE_URL));
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly labels = LABELS;
  protected readonly types = TYPES;
  protected readonly isNew = computed(() => this.projectId() === 'new');
  protected readonly project = signal<Project | null>(null);
  protected readonly services = signal<readonly ServiceOption[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly confirmRemove = signal(false);
  protected readonly values = signal<Record<string, string>>({});
  protected readonly serviceIds = signal<readonly string[]>([]);
  private all: Project[] = [];

  /** Campo suelto de texto: se edita con el editor de un solo campo. */
  protected readonly simple = computed(() => {
    const f = this.field();
    return !this.isNew() && (TEXT_KEYS as readonly string[]).includes(f)
      ? (f as 'nombre' | 'descripcion' | 'ubicacion' | 'fechaProyecto')
      : null;
  });
  protected readonly keys = computed<readonly Key[]>(() => {
    const f = this.field();
    return f === 'ambos'
      ? ['imagenUrl', 'nombre', 'descripcion', 'ubicacion', 'fechaProyecto', 'tipoObra', 'servicios']
      : [f];
  });
  protected readonly heading = computed(() => {
    const f = this.field();
    return `${this.isNew() ? 'Nuevo · ' : ''}Proyecto${f === 'ambos' ? '' : ' · ' + LABELS[f]}`;
  });
  protected readonly savedValue = computed(() => {
    const f = this.simple();
    return f ? String(this.project()?.[f as 'nombre'] ?? '') : '';
  });
  protected readonly requiredSimple = computed(() => {
    const f = this.simple();
    return f === 'nombre' || f === 'descripcion';
  });

  private baseline(key: Key): string {
    const p = this.project();
    if (!p) return '';
    if (key === 'servicios') return this.idsOf(p).join(',');
    return String((p as unknown as Record<string, unknown>)[key] ?? '');
  }
  private idsOf(p: Project): string[] {
    return (p.servicios ?? []).map((s) => s.id).sort();
  }

  protected readonly dirty = computed(() =>
    this.keys().some((k) =>
      k === 'servicios'
        ? [...this.serviceIds()].sort().join(',') !== this.baseline(k)
        : (this.values()[k] ?? '') !== this.baseline(k),
    ),
  );
  protected readonly invalid = computed(() => {
    const ks = this.keys();
    const v = this.values();
    return (
      (ks.includes('nombre') && (v['nombre'] ?? '').trim() === '') ||
      (ks.includes('descripcion') && (v['descripcion'] ?? '').trim() === '') ||
      (ks.includes('imagenUrl') && (v['imagenUrl'] ?? '').trim() === '')
    );
  });

  constructor() {
    effect(() => {
      const p = this.project();
      untracked(() => {
        this.values.set({
          nombre: p?.nombre ?? '',
          descripcion: p?.descripcion ?? '',
          ubicacion: p?.ubicacion ?? '',
          fechaProyecto: p?.fechaProyecto ?? '',
          imagenUrl: p?.imagenUrl ?? '',
          tipoObra: p?.tipoObra ?? '',
        });
        this.serviceIds.set(p ? this.idsOf(p) : []);
      });
    });
    effect(() => {
      const v = this.values();
      const dirty = this.dirty();
      untracked(() => {
        if (this.simple() || this.isNew()) return;
        // En vivo solo los textos; la foto, el tipo y los servicios se ven al guardar.
        const live: Record<string, string> = {};
        for (const k of ['nombre', 'descripcion', 'ubicacion', 'fechaProyecto'] as const) {
          if (this.keys().includes(k)) live[k] = v[k] ?? '';
        }
        this.draftChanged.emit(dirty && Object.keys(live).length > 0 ? live : null);
      });
    });
    effect(() => {
      const id = this.projectId();
      untracked(() => this.load(id));
    });
  }

  private load(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.project.set(null);
    this.confirmRemove.set(false);
    forkJoin({
      projects: this.http.get<Project[]>(`${this.base}/api/proyectos`),
      services: this.http.get<ServiceOption[]>(`${this.base}/api/servicios`),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ projects, services }) => {
          this.all = projects;
          this.services.set(services);
          if (id !== 'new') {
            const found = projects.find((p) => p.id === id) ?? null;
            this.project.set(found);
            if (!found) this.error.set('No se encontró el proyecto.');
          }
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el proyecto.');
          this.loading.set(false);
        },
      });
  }

  /** Abre el proyecto completo (descripción larga, ficha, fotos de la obra y testimonio) en Proyectos. */
  protected openFullRecord(): void {
    const p = this.project();
    if (p) void this.router.navigate(['/admin/proyectos'], { queryParams: { editar: p.id } });
  }

  protected setValue(key: string, value: string): void {
    this.values.update((current) => ({ ...current, [key]: value }));
  }

  protected toggleService(id: string, checked: boolean): void {
    this.serviceIds.update((ids) => (checked ? [...ids, id] : ids.filter((x) => x !== id)));
  }

  protected onSingleDraft(value: string | null): void {
    const f = this.simple();
    this.draftChanged.emit(value !== null && f ? { [f]: value } : null);
  }

  protected saveSingle(value: string): void {
    const f = this.simple();
    if (f) this.update({ [f]: value.trim() || null });
  }

  protected save(): void {
    if (!this.dirty() || this.invalid() || this.saving()) return;
    if (this.isNew()) return this.create();
    const v = this.values();
    const patch: Record<string, unknown> = {};
    const ks = this.keys();
    if (ks.includes('nombre')) patch['nombre'] = (v['nombre'] ?? '').trim();
    if (ks.includes('descripcion')) patch['descripcion'] = (v['descripcion'] ?? '').trim();
    if (ks.includes('ubicacion')) patch['ubicacion'] = (v['ubicacion'] ?? '').trim() || null;
    if (ks.includes('fechaProyecto')) patch['fechaProyecto'] = (v['fechaProyecto'] ?? '').trim() || null;
    if (ks.includes('imagenUrl')) patch['imagenUrl'] = (v['imagenUrl'] ?? '').trim() || null;
    if (ks.includes('tipoObra')) patch['tipoObra'] = (v['tipoObra'] ?? '') || null;
    if (ks.includes('servicios')) patch['servicioIds'] = [...this.serviceIds()];
    this.update(patch);
  }

  /** Cambia los campos indicados del proyecto (el resto viaja tal cual). */
  private update(patch: Record<string, unknown>): void {
    const p = this.project();
    if (!p || this.saving()) return;
    this.begin();
    const body = this.body(p, patch);
    this.http
      .put(`${this.base}/api/proyectos/${encodeURIComponent(p.id)}`, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.done('Proyecto actualizado.', false),
        error: (e) => this.fail('No se pudo guardar.', e),
      });
  }

  private body(p: Project, patch: Record<string, unknown>): Record<string, unknown> {
    return {
      nombre: p.nombre, slug: p.slug, cliente: p.cliente, ubicacion: p.ubicacion, fechaProyecto: p.fechaProyecto,
      areaM2: p.areaM2 ?? null, plazoMeses: p.plazoMeses ?? null, alcance: p.alcance ?? null,
      tipoObra: p.tipoObra ?? null, descripcion: p.descripcion, imagenUrl: p.imagenUrl, imagenAlt: p.imagenAlt,
      destacado: p.destacado ?? false, activo: p.activo ?? true, orden: p.orden ?? 0,
      servicioIds: this.idsOf(p), ...patch,
    };
  }

  private create(): void {
    const v = this.values();
    const nombre = (v['nombre'] ?? '').trim();
    const taken = new Set(this.all.map((p) => p.slug));
    const root = slugify(nombre) || 'proyecto';
    let slug = root;
    for (let n = 2; taken.has(slug); n++) slug = `${root}-${n}`;
    const imagenUrl = (v['imagenUrl'] ?? '').trim() || null;
    this.begin();
    this.http
      .post(`${this.base}/api/proyectos`, {
        nombre, slug, cliente: null,
        ubicacion: (v['ubicacion'] ?? '').trim() || null,
        fechaProyecto: (v['fechaProyecto'] ?? '').trim() || null,
        areaM2: null, plazoMeses: null, alcance: null,
        tipoObra: (v['tipoObra'] ?? '') || null,
        descripcion: (v['descripcion'] ?? '').trim(),
        imagenUrl, imagenAlt: imagenUrl ? nombre : null,
        destacado: false, activo: true,
        orden: this.all.reduce((max, p) => Math.max(max, p.orden ?? -1), -1) + 1,
        servicioIds: [...this.serviceIds()],
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.done('Proyecto creado.', true),
        error: (e) => this.fail('No se pudo crear el proyecto.', e),
      });
  }

  /** Quita el proyecto de la web (lo desactiva; no se borra). */
  protected remove(): void {
    const p = this.project();
    if (!p || this.saving()) return;
    this.begin();
    this.http
      .patch(`${this.base}/api/proyectos/${encodeURIComponent(p.id)}/activo`, { activo: false })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => this.done('Proyecto quitado de la web.', true),
        error: (e) => this.fail('No se pudo quitar.', e),
      });
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
    else this.load(this.projectId());
  }
  private fail(message: string, response?: unknown): void {
    this.saving.set(false);
    this.confirmRemove.set(false);
    const reason = (response as { error?: { message?: string } } | undefined)?.error?.message;
    this.error.set(reason ? `${message} ${reason}` : message);
  }
}
