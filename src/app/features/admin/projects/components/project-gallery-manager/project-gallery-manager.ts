import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { ToastService } from '../../../../../core/services/toast.service';
import { Button } from '../../../../../shared/components/button/button';
import { ImageUploaderComponent } from '../../../../../shared/components/image-uploader/image-uploader.component';
import { trimTrailingSlashes } from '../../../../../shared/utils/text';

export interface GalleryPhoto {
  id: string;
  proyectoSlug: string;
  url: string;
  alt: string | null;
  etiqueta: string;
  activo: boolean;
  orden: number;
}

export const GALLERY_STAGES = [
  { value: 'ANTES', label: 'Antes' },
  { value: 'PROCESO', label: 'Durante la obra' },
  { value: 'FINAL', label: 'Resultado' },
  { value: 'DETALLE', label: 'Detalle' },
] as const;

/** Fotos «Antes, durante y después» de un proyecto (`proyecto_galeria`, ligadas por slug). */
@Component({
  selector: 'app-project-gallery-manager',
  imports: [Button, FormsModule, ImageUploaderComponent],
  templateUrl: './project-gallery-manager.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectGalleryManager {
  readonly slug = input.required<string>();
  readonly projectName = input('');

  private readonly http = inject(HttpClient);
  private readonly url = `${trimTrailingSlashes(inject(API_BASE_URL))}/api/proyecto-galeria`;
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly stages = GALLERY_STAGES;
  protected readonly photos = signal<readonly GalleryPhoto[]>([]);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly confirmDelete = signal<string | null>(null);
  protected readonly newUrl = signal('');
  protected readonly newStage = signal<string>('PROCESO');
  protected readonly sorted = computed(() => [...this.photos()].sort((a, b) => a.orden - b.orden));

  constructor() {
    effect(() => {
      this.slug();
      untracked(() => this.load());
    });
  }

  private load(): void {
    this.loading.set(true);
    this.http
      .get<GalleryPhoto[]>(this.url)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (all) => {
          this.photos.set(all.filter((p) => p.proyectoSlug === this.slug()));
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar las fotos.');
          this.loading.set(false);
        },
      });
  }

  private body(p: GalleryPhoto, patch: Partial<GalleryPhoto> = {}): Omit<GalleryPhoto, 'id'> {
    return { proyectoSlug: p.proyectoSlug, url: p.url, alt: p.alt, etiqueta: p.etiqueta, activo: p.activo, orden: p.orden, ...patch };
  }

  private run(request: ReturnType<HttpClient['get']>, message: string): void {
    this.busy.set(true);
    this.error.set(null);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.busy.set(false);
        this.confirmDelete.set(null);
        this.toast.show(message, 'success');
        this.load();
      },
      error: (e) => {
        this.busy.set(false);
        this.confirmDelete.set(null);
        const reason = (e as { error?: { message?: string } })?.error?.message;
        this.error.set(reason ? `No se pudo guardar. ${reason}` : 'No se pudo guardar.');
      },
    });
  }

  protected add(): void {
    const url = this.newUrl().trim();
    if (!url || this.busy()) return;
    const orden = this.photos().reduce((max, p) => Math.max(max, p.orden), -1) + 1;
    this.run(
      this.http.post(this.url, { proyectoSlug: this.slug(), url, alt: this.projectName() || null, etiqueta: this.newStage(), activo: true, orden }),
      'Foto añadida.',
    );
    this.newUrl.set('');
  }

  protected changeStage(p: GalleryPhoto, etiqueta: string): void {
    if (etiqueta === p.etiqueta || this.busy()) return;
    this.run(this.http.put(`${this.url}/${encodeURIComponent(p.id)}`, this.body(p, { etiqueta })), 'Foto actualizada.');
  }

  /** Intercambia el orden con la foto vecina. */
  protected move(p: GalleryPhoto, delta: -1 | 1): void {
    const list = this.sorted();
    const i = list.findIndex((x) => x.id === p.id);
    const other = list[i + delta];
    if (!other || this.busy()) return;
    this.busy.set(true);
    forkJoin([
      this.http.put(`${this.url}/${encodeURIComponent(p.id)}`, this.body(p, { orden: other.orden })),
      this.http.put(`${this.url}/${encodeURIComponent(other.id)}`, this.body(other, { orden: p.orden })),
    ])
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => { this.busy.set(false); this.load(); },
        error: () => { this.busy.set(false); this.error.set('No se pudo cambiar el orden.'); },
      });
  }

  protected remove(p: GalleryPhoto): void {
    if (this.busy()) return;
    this.run(this.http.delete(`${this.url}/${encodeURIComponent(p.id)}`), 'Foto quitada.');
  }

  protected stageLabel(value: string): string {
    return this.stages.find((s) => s.value === value)?.label ?? value;
  }
}
