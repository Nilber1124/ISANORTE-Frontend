import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';

import { CategoryResponse } from '../../../data/models/category/category-response.model';
import { Alert } from '../../../shared/components/alert/alert';
import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { Modal } from '../../../shared/components/modal/modal';
import { AdminCategoriesFacade } from './admin-categories.facade';
import { CategoryForm, CategoryFormSubmission } from './components/category-form/category-form';

@Component({
  selector: 'app-admin-categories',
  imports: [Alert, Badge, Button, CategoryForm, EmptyState, Loading, Modal],
  providers: [AdminCategoriesFacade],
  templateUrl: './admin-categories.html',
  styleUrl: './admin-categories.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminCategories {
  readonly facade = inject(AdminCategoriesFacade);
  readonly categoryToDeactivate = signal<CategoryResponse | null>(null);

  constructor() {
    afterNextRender(() => this.facade.load());
  }

  protected save(submission: CategoryFormSubmission): void {
    if (submission.mode === 'create') {
      this.facade.create(submission.request);
      return;
    }

    this.facade.update(submission.request);
  }

  protected requestActiveChange(category: CategoryResponse): void {
    if (category.activo === true) {
      this.categoryToDeactivate.set(category);
      return;
    }

    this.facade.changeActive(category, true);
  }

  protected confirmDeactivation(): void {
    const category = this.categoryToDeactivate();
    if (category === null) return;
    this.facade.changeActive(category, false);
    this.categoryToDeactivate.set(null);
  }

  protected closeDeactivation(): void {
    if (this.facade.changingActiveId() !== null) return;
    this.categoryToDeactivate.set(null);
  }
}
