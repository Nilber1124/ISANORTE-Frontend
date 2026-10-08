import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';

import { AnnouncementResponse } from '../../../data/models/announcement/announcement.model';
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
}
