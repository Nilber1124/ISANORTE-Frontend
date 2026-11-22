import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, forkJoin, map, of } from 'rxjs';

import { API_BASE_URL } from '../../../core/config/api.config';
import { trimTrailingSlashes } from '../../../shared/utils/text';
import { AdminPageHeader } from '../shared/admin-page-header/admin-page-header';
import { SITE_CONTENT_ENTITIES } from '../site-content/site-content.config';

/** Catálogos que se muestran como tarjetas (las políticas viven en «Sitio y empresa»). */
export const WEB_CONTENT_KEYS = ['faqs', 'equipo', 'credenciales', 'testimonios', 'garantias', 'pasos-proceso'] as const;

interface WebContentCard {
  readonly key: string;
  readonly title: string;
  readonly description: string;
  readonly route: string;
  /** `null` mientras carga o si la consulta falló. */
  readonly total: number | null;
  readonly active: number | null;
}

/**
 * Entrada única del menú para los catálogos de contenido de la web (preguntas, equipo, credenciales,
 * testimonios, garantías y pasos). Cada tarjeta enseña cuántos elementos tiene y abre su pantalla.
 * Todos se editan también tocándolos en la vista previa de Landing; aquí quedan para ver los desactivados,
 * reordenar y revisar la lista completa.
 */
@Component({
  selector: 'app-admin-web-content',
  imports: [AdminPageHeader, RouterLink],
  templateUrl: './admin-web-content.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminWebContent {
  private readonly http = inject(HttpClient);
  private readonly base = trimTrailingSlashes(inject(API_BASE_URL));
  private readonly destroyRef = inject(DestroyRef);

  protected readonly cards = signal<readonly WebContentCard[]>(
    WEB_CONTENT_KEYS.map((key) => this.card(key, null, null)),
  );

  constructor() {
    forkJoin(
      WEB_CONTENT_KEYS.map((key) => {
        const entity = SITE_CONTENT_ENTITIES.find((e) => e.key === key);
        if (!entity) return of(this.card(key, null, null));
        return this.http.get<readonly { activo?: boolean | null }[]>(`${this.base}/api/${entity.endpoint}`).pipe(
          map((rows) => this.card(key, rows.length, rows.filter((r) => r.activo !== false).length)),
          catchError(() => of(this.card(key, null, null))),
        );
      }),
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((cards) => this.cards.set(cards));
  }

  private card(key: string, total: number | null, active: number | null): WebContentCard {
    const entity = SITE_CONTENT_ENTITIES.find((e) => e.key === key);
    return {
      key,
      title: entity?.title ?? key,
      description: entity?.description ?? '',
      route: `/admin/sitio/${key}`,
      total,
      active,
    };
  }

  protected countLabel(card: WebContentCard): string {
    if (card.total === null) return '—';
    const hidden = card.total - (card.active ?? card.total);
    const base = `${card.total} ${card.total === 1 ? 'elemento' : 'elementos'}`;
    return hidden > 0 ? `${base} · ${hidden} oculto${hidden === 1 ? '' : 's'}` : base;
  }
}
