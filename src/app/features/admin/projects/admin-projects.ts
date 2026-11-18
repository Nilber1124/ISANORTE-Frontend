import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject, signal } from '@angular/core';

import { ProjectResponse } from '../../../data/models/project/project-response.model';
import { Alert } from '../../../shared/components/alert/alert';
import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { Modal } from '../../../shared/components/modal/modal';
import { AdminProjectsFacade } from './admin-projects.facade';
import { ProjectForm, ProjectFormSubmission } from './components/project-form/project-form';

@Component({
  selector: 'app-admin-projects',
  imports: [Alert, Badge, Button, EmptyState, Loading, Modal, ProjectForm],
  providers: [AdminProjectsFacade],

  templateUrl: './admin-projects.html',
  styleUrl: './admin-projects.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProjects {
  readonly facade = inject(AdminProjectsFacade);
  readonly projectToDeactivate = signal<ProjectResponse | null>(null);
  readonly projectToDelete = signal<ProjectResponse | null>(null);
  readonly activeFilter = signal<'all' | 'active' | 'inactive'>('all');

  readonly filteredProjects = computed(() => {
    const f = this.activeFilter();
    const all = this.facade.projects();
    if (f === 'active') return all.filter((p) => p.activo === true);
    if (f === 'inactive') return all.filter((p) => p.activo !== true);
    return all;
  });

  readonly summaryText = computed(() => {
    const all = this.facade.projects();
    if (all.length === 0) return '';
    const total = all.length;
    const active = all.filter((p) => p.activo === true).length;
    return `${total} ${total === 1 ? 'proyecto' : 'proyectos'} · ${active} ${active === 1 ? 'activo' : 'activos'}`;
  });

  constructor() {
    afterNextRender(() => this.facade.load());
  }

  protected save(submission: ProjectFormSubmission): void {
    if (submission.mode === 'create') {
      this.facade.create(submission.request);
      return;
    }
    this.facade.update(submission.request);
  }

  protected requestActiveChange(project: ProjectResponse): void {
    if (project.activo === true) {
      this.projectToDeactivate.set(project);
      return;
    }
    this.facade.changeActive(project);
  }

  protected confirmDeactivation(): void {
    const project = this.projectToDeactivate();
    if (project === null) return;
    this.facade.changeActive(project);
    this.projectToDeactivate.set(null);
  }

  protected closeDeactivation(): void {
    if (this.facade.changingActiveId() !== null) return;
    this.projectToDeactivate.set(null);
  }

  protected toggleDestacado(project: ProjectResponse): void {
    this.facade.toggleDestacado(project);
  }

  protected requestDelete(project: ProjectResponse): void {
    this.projectToDelete.set(project);
  }

  protected confirmDelete(): void {
    const project = this.projectToDelete();
    if (project === null) return;
    this.facade.delete(project);
    this.projectToDelete.set(null);
  }

  protected closeDelete(): void {
    if (this.facade.deletingId() !== null) return;
    this.projectToDelete.set(null);
  }

  protected serviceNames(project: ProjectResponse): string {
    return project.servicios?.map((service) => service.nombre).join(', ') || 'Sin servicios';
  }
}
