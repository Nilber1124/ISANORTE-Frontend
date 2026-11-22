import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { API_BASE_URL } from '../../../core/config/api.config';
import { ToastService } from '../../../core/services/toast.service';
import { trimTrailingSlashes } from '../../../shared/utils/text';
import { AdminPageHeader } from '../shared/admin-page-header/admin-page-header';

export interface AdminReview {
  id: string;
  nombreCliente: string;
  calificacion: number;
  comentario: string;
  compraVerificada: boolean;
  productoNombre: string;
  fechaCreacion: string | null;
  mostrarEnHome: boolean;
  ordenHome: number;
}

/** Elige qué reseñas reales se muestran en la Home de ISADECOR y en qué orden. */
@Component({
  selector: 'app-admin-home-reviews',
  imports: [AdminPageHeader],
  templateUrl: './admin-home-reviews.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminHomeReviews {
  private readonly http = inject(HttpClient);
  private readonly toast = inject(ToastService);
  private readonly url = `${trimTrailingSlashes(inject(API_BASE_URL))}/api/resenas`;

  readonly reviews = signal<readonly AdminReview[]>([]);
  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly savingId = signal<string | null>(null);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.http.get<AdminReview[]>(this.url).subscribe({
      next: (items) => {
        this.reviews.set(items);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar las reseñas.');
        this.loading.set(false);
      },
    });
  }

  stars(rating: number): string {
    return '★'.repeat(rating) + '☆'.repeat(Math.max(0, 5 - rating));
  }

  /** Guarda la marca y el orden de una reseña; la lista se reordena con la respuesta. */
  save(
    review: AdminReview,
    changes: Partial<Pick<AdminReview, 'mostrarEnHome' | 'ordenHome'>>,
  ): void {
    if (this.savingId()) return;
    const next = { ...review, ...changes };
    this.savingId.set(review.id);
    this.http
      .patch<AdminReview>(`${this.url}/${review.id}/home`, {
        mostrarEnHome: next.mostrarEnHome,
        ordenHome: Math.max(0, Math.trunc(Number(next.ordenHome) || 0)),
      })
      .subscribe({
        next: () => {
          this.savingId.set(null);
          this.toast.show('Guardado correctamente.', 'success');
          this.load();
        },
        error: () => {
          this.savingId.set(null);
          this.toast.show('No se pudo guardar.', 'error');
        },
      });
  }
}
