import { ChangeDetectionStrategy, Component, DestroyRef, computed, inject, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable, forkJoin } from 'rxjs';

import { ToastService } from '../../../../../core/services/toast.service';
import { ProjectResponse } from '../../../../../data/models/project/project-response.model';
import { ProjectUpdateRequest } from '../../../../../data/models/project/project-update-request.model';
import { ProjectApiService } from '../../../../../data/services/project-api.service';
import { Button } from '../../../../../shared/components/button/button';

/** Cuántos proyectos muestra la Home (los primeros de la lista, en orden). */
export const HOME_PROJECTS_LIMIT = 4;

/**
 * Qué proyectos salen en la Home y en qué orden. Solo cambia eso (orden y «destacado»): los textos y fotos de cada
 * proyecto se editan en `/admin/proyectos`.
 */
@Component({
  selector: 'app-projects-order-editor',
  imports: [Button],
  templateUrl: './projects-order-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectsOrderEditor {
  /** Los cambios se guardaron: la vista previa debe recargarse. */
  readonly saved = output<void>();
  readonly closed = output<void>();

  private readonly api = inject(ProjectApiService);
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly limit = HOME_PROJECTS_LIMIT;
  protected readonly projects = signal<readonly ProjectResponse[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);

  /** En la Home: activos y destacados, por orden. */
  protected readonly shown = computed(() =>
    this.projects()
      .filter((p) => p.activo !== false && p.destacado === true)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)),
  );
  /** Activos que no salen en la Home. */
  protected readonly hidden = computed(() =>
    this.projects()
      .filter((p) => p.activo !== false && p.destacado !== true)
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0)),
  );

  constructor() {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.api
      .getAll()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (all) => {
          this.projects.set(all);
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los proyectos.');
          this.loading.set(false);
        },
      });
  }

  /** Petición completa con el proyecto tal cual está guardado; solo cambian los campos indicados. */
  private request(project: ProjectResponse, patch: Partial<ProjectUpdateRequest>): Observable<ProjectResponse> {
    const body: ProjectUpdateRequest = {
      nombre: project.nombre,
      slug: project.slug,
      cliente: project.cliente,
      ubicacion: project.ubicacion,
      fechaProyecto: project.fechaProyecto,
      areaM2: project.areaM2 ?? null,
      plazoMeses: project.plazoMeses ?? null,
      alcance: project.alcance ?? null,
      tipoObra: project.tipoObra ?? null,
      descripcion: project.descripcion,
      imagenUrl: project.imagenUrl,
      imagenAlt: project.imagenAlt,
      destacado: project.destacado ?? false,
      activo: project.activo ?? true,
      orden: project.orden ?? 0,
      servicioIds: (project.servicios ?? []).map((s) => s.id),
      ...patch,
    };
    return this.api.update(project.id, body);
  }

  private apply(requests: Observable<ProjectResponse>[]): void {
    if (this.saving()) return;
    this.saving.set(true);
    this.error.set(null);
    forkJoin(requests)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.projects.update((all) => all.map((p) => updated.find((u) => u.id === p.id) ?? p));
          this.saving.set(false);
          this.toast.show('Proyectos de la Home actualizados.', 'success');
          this.saved.emit();
        },
        error: () => {
          this.saving.set(false);
          this.error.set('No se pudo guardar el cambio.');
        },
      });
  }

  /** Sube o baja un proyecto de la Home intercambiando su orden con el vecino. */
  protected move(index: number, direction: -1 | 1): void {
    const list = this.shown();
    const first = list[index];
    const second = list[index + direction];
    if (!first || !second) return;
    const a = first.orden ?? 0;
    const b = second.orden ?? 0;
    // Con órdenes iguales se separa el movido para que el cambio sea visible.
    const [nextFirst, nextSecond] = a === b ? [b + direction, b] : [b, a];
    this.apply([this.request(first, { orden: nextFirst }), this.request(second, { orden: nextSecond })]);
  }

  /** Muestra u oculta un proyecto en la Home; al mostrarlo va al final de la lista. */
  protected toggle(project: ProjectResponse): void {
    if (project.destacado === true) {
      this.apply([this.request(project, { destacado: false })]);
      return;
    }
    const last = this.shown().reduce((max, p) => Math.max(max, p.orden ?? 0), -1);
    this.apply([this.request(project, { destacado: true, orden: last + 1 })]);
  }
}
