import { ChangeDetectionStrategy, Component, afterNextRender, inject, signal } from '@angular/core';

import { SiteConfigResponse } from '../../../data/models/site-config/site-config-response.model';
import { Alert } from '../../../shared/components/alert/alert';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { AdminSiteConfigFacade } from './admin-site-config.facade';
import {
  SiteConfigForm,
  SiteConfigFormSubmission,
} from './components/site-config-form/site-config-form';

@Component({
  selector: 'app-admin-site-config',
  imports: [Alert, Button, EmptyState, Loading, SiteConfigForm],
  providers: [AdminSiteConfigFacade],
  templateUrl: './admin-site-config.html',
  styleUrl: './admin-site-config.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminSiteConfig {
  readonly facade = inject(AdminSiteConfigFacade);
  readonly failedPreviews = signal<ReadonlySet<string>>(new Set());

  constructor() {
    afterNextRender(() => this.facade.load());
  }

  protected save(submission: SiteConfigFormSubmission): void {
    if (submission.mode === 'create') this.facade.create(submission.request);
    else this.facade.update(submission.request);
  }

  protected markPreviewFailed(key: string): void {
    this.failedPreviews.update((current) => new Set([...current, key]));
  }

  protected previewFailed(config: SiteConfigResponse, field: string): boolean {
    return this.failedPreviews().has(`${config.id}:${field}`);
  }
}
