import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal, untracked } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { API_BASE_URL } from '../../../../../core/config/api.config';
import { ToastService } from '../../../../../core/services/toast.service';
import { Button } from '../../../../../shared/components/button/button';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';
import { trimTrailingSlashes } from '../../../../../shared/utils/text';

export interface ProjectTestimonial {
  id: string;
  autor: string;
  cargo: string | null;
  texto: string;
  proyectoSlug: string | null;
  fotoUrl: string | null;
  fotoAlt: string | null;
  activo: boolean;
  orden: number;
}

interface Draft {
  id: string | null;
  autor: string;
  cargo: string;
  texto: string;
}

/** Testimonio(s) de un proyecto (ligado(s) por slug). Se crean, editan y borran aquí mismo. */
@Component({
  selector: 'app-project-testimonial-manager',
  imports: [Button, InputField, TextareaField],
  templateUrl: './project-testimonial-manager.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectTestimonialManager {
  readonly slug = input.required<string>();

  private readonly http = inject(HttpClient);
  private readonly url = `${trimTrailingSlashes(inject(API_BASE_URL))}/api/testimonios`;
  private readonly toast = inject(ToastService);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly items = signal<readonly ProjectTestimonial[]>([]);
  protected readonly loading = signal(true);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly draft = signal<Draft | null>(null);
  protected readonly confirmDelete = signal<string | null>(null);
  private nextOrder = 0;

  constructor() {
    effect(() => {
      this.slug();
      untracked(() => this.load());
    });
  }

  private load(): void {
    this.loading.set(true);
    this.http
      .get<ProjectTestimonial[]>(this.url)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (all) => {
          this.nextOrder = all.reduce((max, t) => Math.max(max, t.orden), -1) + 1;
          this.items.set(all.filter((t) => t.proyectoSlug === this.slug()));
          this.loading.set(false);
        },
        error: () => {
          this.error.set('No se pudieron cargar los testimonios.');
          this.loading.set(false);
        },
      });
  }

  protected startNew(): void {
    this.draft.set({ id: null, autor: '', cargo: '', texto: '' });
  }
  protected startEdit(t: ProjectTestimonial): void {
    this.draft.set({ id: t.id, autor: t.autor, cargo: t.cargo ?? '', texto: t.texto });
  }
  protected set(key: 'autor' | 'cargo' | 'texto', value: string): void {
    this.draft.update((d) => (d ? { ...d, [key]: value } : d));
  }
  protected get valid(): boolean {
    const d = this.draft();
    return !!d && d.autor.trim() !== '' && d.texto.trim() !== '';
  }

  protected save(): void {
    const d = this.draft();
    if (!d || !this.valid || this.busy()) return;
    const current = this.items().find((t) => t.id === d.id);
    const body = {
      autor: d.autor.trim(), cargo: d.cargo.trim() || null, texto: d.texto.trim(), proyectoSlug: this.slug(),
      fotoUrl: current?.fotoUrl ?? null, fotoAlt: current?.fotoAlt ?? null, activo: current?.activo ?? true,
      orden: current?.orden ?? this.nextOrder,
    };
    this.finish(
      d.id ? this.http.put(`${this.url}/${encodeURIComponent(d.id)}`, body) : this.http.post(this.url, body),
      d.id ? 'Testimonio actualizado.' : 'Testimonio añadido.',
    );
  }

  protected remove(t: ProjectTestimonial): void {
    if (this.busy()) return;
    this.finish(this.http.delete(`${this.url}/${encodeURIComponent(t.id)}`), 'Testimonio quitado.');
  }

  private finish(request: ReturnType<HttpClient['get']>, message: string): void {
    this.busy.set(true);
    this.error.set(null);
    request.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.busy.set(false);
        this.draft.set(null);
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
}
