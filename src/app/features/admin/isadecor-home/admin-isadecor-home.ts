import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import { map } from 'rxjs';

import { AdminHomeReviews } from '../home-reviews/admin-home-reviews';
import { AdminPageHeader } from '../shared/admin-page-header/admin-page-header';
import { AdminSiteContent } from '../site-content/admin-site-content';
import { ISADECOR_HOME_ENTITIES } from '../site-content/site-content.config';

export interface IsadecorHomeSection {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  /** Pantallas genéricas de contenido que se muestran dentro de la sección. */
  readonly entities: readonly { key: string; title: string }[];
  /** La sección es el selector de reseñas del Home. */
  readonly reviews?: boolean;
}

const entity = (key: string) => {
  const found = ISADECOR_HOME_ENTITIES.find((item) => item.key === key);
  return { key, title: found?.title ?? key, description: found?.description ?? '' };
};

/**
 * Las secciones del Home de la tienda ISADECOR, en el orden en que aparecen en la web. Cada una reutiliza su
 * pantalla de contenido de siempre, pero solo se carga al abrirla.
 */
export const ISADECOR_HOME_SECTIONS: readonly IsadecorHomeSection[] = [
  { id: 'hero', title: entity('isadecor-hero').title, description: entity('isadecor-hero').description, entities: [entity('isadecor-hero')] },
  { id: 'cinta', title: entity('isadecor-cinta').title, description: entity('isadecor-cinta').description, entities: [entity('isadecor-cinta')] },
  { id: 'promociones', title: entity('isadecor-promociones').title, description: entity('isadecor-promociones').description, entities: [entity('isadecor-promociones')] },
  { id: 'campana', title: entity('isadecor-campana').title, description: entity('isadecor-campana').description, entities: [entity('isadecor-campana')] },
  { id: 'secciones', title: entity('isadecor-secciones').title, description: entity('isadecor-secciones').description, entities: [entity('isadecor-secciones')] },
  {
    id: 'servicio',
    title: 'Bloque de servicio',
    description: 'El bloque de servicio de la Home y los puntos que lo acompañan.',
    entities: [entity('isadecor-servicios'), entity('isadecor-servicio-puntos')],
  },
  { id: 'resenas', title: 'Reseñas del Home', description: 'Qué reseñas reales se muestran en la Home y en qué orden.', entities: [], reviews: true },
  { id: 'publicaciones', title: entity('isadecor-publicaciones').title, description: entity('isadecor-publicaciones').description, entities: [entity('isadecor-publicaciones')] },
];

/**
 * Una sola pantalla para el contenido del Home de ISADECOR (antes eran 9 entradas del menú, la mayoría con
 * uno o dos elementos). Cada sección se despliega y carga su editor al abrirse; `?seccion=<id>` abre una directa.
 */
@Component({
  selector: 'app-admin-isadecor-home',
  imports: [AdminHomeReviews, AdminPageHeader, AdminSiteContent],
  templateUrl: './admin-isadecor-home.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminIsadecorHome {
  protected readonly sections = ISADECOR_HOME_SECTIONS;

  private readonly requested = toSignal(
    inject(ActivatedRoute).queryParamMap.pipe(map((params) => params.get('seccion'))),
    { initialValue: null },
  );
  private readonly toggled = signal<ReadonlyMap<string, boolean>>(new Map());

  /** Una sección está abierta si se abrió a mano o si llegó pedida por la URL (salvo que se cierre). */
  protected readonly isOpen = computed(() => {
    const toggled = this.toggled();
    const requested = this.requested();
    return (id: string): boolean => toggled.get(id) ?? id === requested;
  });

  protected toggle(id: string): void {
    const open = this.isOpen()(id);
    this.toggled.update((map) => new Map(map).set(id, !open));
  }
}
