import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { ToastService } from '../../../../../core/services/toast.service';
import { Button } from '../../../../../shared/components/button/button';
import { ImageUploaderComponent } from '../../../../../shared/components/image-uploader/image-uploader.component';
import { trimTrailingSlashes } from '../../../../../shared/utils/text';
import { FieldEditor } from '../field-editor/field-editor';

export type ProjectCardField = 'nombre' | 'descripcion' | 'ubicacion' | 'fechaProyecto' | 'imagenUrl';

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

const LABELS: Record<ProjectCardField, string> = {
  nombre: 'Nombre del proyecto',
  descripcion: 'Descripción',
  ubicacion: 'Ubicación',
  fechaProyecto: 'Periodo de ejecución',
  imagenUrl: 'Foto de portada',
};

/**
 * Edita UN campo de una tarjeta de la página Proyectos (portada, nombre, descripción, ubicación o periodo) tocado
 * en la vista previa. Crear un proyecto o editarlo entero se hace con el formulario completo (`project-full-editor`).
 */
@Component({
  selector: 'app-project-card-editor',
  imports: [Button, FieldEditor, FormsModule, ImageUploaderComponent],
  templateUrl: './project-card-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectCardEditor {
  readonly projectId = input.required<string>();
  readonly field = input.required<ProjectCardField>();

  readonly draftChanged = output<Readonly<Record<string, string>> | null>();
  readonly saved = output<void>();
  readonly closed = output<void>();

  private readonly http = inject(HttpClient);
  private readonly url = `${trimTrailingSlashes(inject(API_BASE_URL))}/api/proyectos`;
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly labels = LABELS;
  protected readonly project = signal<Project | null>(null);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly photo = signal('');

  protected readonly isPhoto = computed(() => this.field() === 'imagenUrl');
  protected readonly heading = computed(() => `Proyecto · ${LABELS[this.field()]}`);
  protected readonly required = computed(() => this.field() === 'nombre' || this.field() === 'descripcion');
  protected readonly savedValue = computed(() => String(this.project()?.[this.field()] ?? ''));
  protected readonly photoDirty = computed(() => this.photo().trim() !== '' && this.photo() !== (this.project()?.imagenUrl ?? ''));

  constructor() {
    effect(() => {
      const id = this.projectId();
      untracked(() => this.load(id));
    });
  }

  private load(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.project.set(null);
    this.http
      .get<Project[]>(this.url)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (all) => {
          const found = all.find((p) => p.id === id) ?? null;
          this.project.set(found);
          this.photo.set(found?.imagenUrl ?? '');
          if (!found) this.error.set('No se encontró el proyecto.');
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudo cargar el proyecto.');
          this.loading.set(false);
        },
      });
  }

  protected onDraft(value: string | null): void {
    this.draftChanged.emit(value !== null ? { [this.field()]: value } : null);
  }

  protected saveText(value: string): void {
    this.update({ [this.field()]: value.trim() || null });
  }

  protected savePhoto(): void {
    if (this.photoDirty()) this.update({ imagenUrl: this.photo().trim() });
  }

  /** Cambia el campo indicado (el resto del proyecto viaja tal cual). */
  private update(patch: Record<string, unknown>): void {
    const p = this.project();
    if (!p || this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    const body = {
      nombre: p.nombre, slug: p.slug, cliente: p.cliente, ubicacion: p.ubicacion, fechaProyecto: p.fechaProyecto,
      areaM2: p.areaM2 ?? null, plazoMeses: p.plazoMeses ?? null, alcance: p.alcance ?? null,
      tipoObra: p.tipoObra ?? null, descripcion: p.descripcion, imagenUrl: p.imagenUrl, imagenAlt: p.imagenAlt,
      destacado: p.destacado ?? false, activo: p.activo ?? true, orden: p.orden ?? 0,
      servicioIds: (p.servicios ?? []).map((s) => s.id), ...patch,
    };
    this.http
      .put(`${this.url}/${encodeURIComponent(p.id)}`, body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.show('Proyecto actualizado.', 'success');
          this.saved.emit();
          this.load(this.projectId());
        },
        error: (e) => {
          this.saving.set(false);
          const reason = (e as { error?: { message?: string } })?.error?.message;
          this.error.set(reason ? `No se pudo guardar. ${reason}` : 'No se pudo guardar.');
        },
      });
  }
}
