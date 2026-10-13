import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal } from '@angular/core';

import { AnnouncementLocation, AnnouncementResponse } from '../../../data/models/announcement/announcement.model';
import { ProductResponse } from '../../../data/models/product/product-response.model';
import { Alert } from '../../../shared/components/alert/alert';
import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { Modal } from '../../../shared/components/modal/modal';
import { AdminAnnouncementsFacade } from './admin-announcements.facade';
import { AnnouncementForm } from './components/announcement-form/announcement-form';

@Component({
  selector: 'app-admin-announcements',
  imports: [Alert, Badge, Button, EmptyState, Loading, Modal, AnnouncementForm],
  providers: [AdminAnnouncementsFacade],
  templateUrl: './admin-announcements.html',
  styleUrl: './admin-announcements.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminAnnouncements {
  readonly facade = inject(AdminAnnouncementsFacade);
  readonly pendingDelete = signal<AnnouncementResponse | null>(null);
  readonly activeTab = signal<'ribbon' | 'promotions' | 'announcements' | 'products' | 'categories'>('ribbon');

  readonly visibleAnnouncements = computed(() => {
    const tab = this.activeTab();
    return this.facade.announcements().filter((item) => {
      if (tab === 'ribbon') return item.ubicacion === 'CINTA_HOME';
      if (tab === 'promotions') {
        return item.ubicacion === 'PROMOCION_PRINCIPAL' || item.ubicacion === 'PROMOCION_SECUNDARIA';
      }
      if (tab === 'announcements') {
        return item.ubicacion === 'ANUNCIOS_HOME' || item.ubicacion === 'GENERAL';
      }
      if (tab === 'categories') return item.ubicacion === 'CATEGORIA_SUPERIOR';
      return false;
    });
  });

  readonly isadecorProducts = computed(() =>
    this.facade.products()
      .filter((product) => product.unidadNegocio?.slug === 'isadecor')
      .sort((a, b) => (a.ordenDestacado ?? 0) - (b.ordenDestacado ?? 0) || a.nombre.localeCompare(b.nombre)),
  );

  readonly isadecorCategories = computed(() =>
    this.facade.categories()
      .filter(
        (category) =>
          category.unidadNegocio === null || category.unidadNegocio.slug === 'isadecor',
      )
      .sort((a, b) => (a.orden ?? 0) - (b.orden ?? 0) || a.nombre.localeCompare(b.nombre)),
  );

  readonly activeLocation = computed<AnnouncementLocation>(() => {
    const tab = this.activeTab();
    if (tab === 'ribbon') return 'CINTA_HOME';
    if (tab === 'promotions') return 'PROMOCION_PRINCIPAL';
    if (tab === 'categories') return 'CATEGORIA_SUPERIOR';
    return 'ANUNCIOS_HOME';
  });

  constructor() {
    afterNextRender(() => this.facade.load());
  }

  protected status(announcement: AnnouncementResponse): string {
    if (!announcement.activo) return 'Inactivo';
    const now = Date.now();
    if (announcement.fechaInicio && new Date(announcement.fechaInicio).getTime() > now)
      return 'Programado';
    if (announcement.fechaFin && new Date(announcement.fechaFin).getTime() < now)
      return 'Finalizado';
    return 'Publicado';
  }

  protected statusVariant(
    announcement: AnnouncementResponse,
  ): 'neutral' | 'info' | 'success' | 'warning' {
    const value = this.status(announcement);
    if (value === 'Publicado') return 'success';
    if (value === 'Programado') return 'info';
    if (value === 'Finalizado') return 'warning';
    return 'neutral';
  }

  protected confirmDelete(): void {
    const announcement = this.pendingDelete();
    if (!announcement) return;
    this.facade.delete(announcement);
    this.pendingDelete.set(null);
  }

  protected updateFeatured(product: ProductResponse, event: Event): void {
    const input = event.currentTarget as HTMLInputElement;
    this.facade.updateFeatured(product, input.checked, product.ordenDestacado ?? 0);
  }

  protected updateFeaturedOrder(product: ProductResponse, event: Event): void {
    const value = Number((event.currentTarget as HTMLInputElement).value);
    this.facade.updateFeatured(product, true, Number.isFinite(value) ? value : 0);
  }
}
