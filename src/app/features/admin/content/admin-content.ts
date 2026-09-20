import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';

import { PageContentResponse } from '../../../data/models/content/page-content.model';
import { PageSeoResponse } from '../../../data/models/content/page-seo.model';
import { Alert } from '../../../shared/components/alert/alert';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { AdminContentFacade } from './admin-content.facade';
import { PageContentForm } from './components/page-content-form/page-content-form';
import { PageSeoForm } from './components/page-seo-form/page-seo-form';

@Component({
  selector: 'app-admin-content',
  imports: [Alert, Button, EmptyState, Loading, PageContentForm, PageSeoForm],
  templateUrl: './admin-content.html',
  providers: [AdminContentFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminContent {
  readonly facade = inject(AdminContentFacade);
  readonly tab = signal<'content' | 'seo'>('content');
  readonly contentFormOpen = signal(false);
  readonly seoFormOpen = signal(false);
  readonly selectedContent = signal<PageContentResponse | null>(null);
  readonly selectedSeo = signal<PageSeoResponse | null>(null);

  constructor() {
    afterNextRender(() => this.facade.load());
  }

  protected openContent(item: PageContentResponse | null): void {
    this.facade.clearFeedback();
    this.selectedContent.set(item);
    this.contentFormOpen.set(true);
  }

  protected openSeo(item: PageSeoResponse | null): void {
    this.facade.clearFeedback();
    this.selectedSeo.set(item);
    this.seoFormOpen.set(true);
  }
}
