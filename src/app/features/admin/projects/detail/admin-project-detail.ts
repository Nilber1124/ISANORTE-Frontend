import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Alert } from '../../../../shared/components/alert/alert';
import { Badge } from '../../../../shared/components/badge/badge';
import { Button } from '../../../../shared/components/button/button';
import { Card } from '../../../../shared/components/card/card';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../../shared/components/loading/loading';
import { AdminProjectDetailFacade } from './admin-project-detail.facade';
import { ProjectImageSubmission, ProjectImages } from './components/project-images/project-images';

@Component({
  selector: 'app-admin-project-detail',
  imports: [Alert, Badge, Button, Card, EmptyState, Loading, ProjectImages, RouterLink],
  providers: [AdminProjectDetailFacade],
  templateUrl: './admin-project-detail.html',
  styleUrl: './admin-project-detail.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminProjectDetail {
  readonly facade = inject(AdminProjectDetailFacade);
  private readonly route = inject(ActivatedRoute);

  constructor() {
    afterNextRender(() => this.facade.load(this.route.snapshot.paramMap.get('id') ?? ''));
  }

  protected saveImage(submission: ProjectImageSubmission): void {
    if (submission.imageId === null) {
      this.facade.createImage(submission.request);
      return;
    }
    this.facade.updateImage(submission.imageId, submission.request);
  }

  protected deleteImage(imageId: string): void {
    this.facade.deleteImage(imageId);
  }

  protected serviceNames(): string {
    return (
      this.facade
        .project()
        ?.servicios?.map((service) => service.nombre)
        .join(', ') || 'Sin servicios asociados'
    );
  }
}
