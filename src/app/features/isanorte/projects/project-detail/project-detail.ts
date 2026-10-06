import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { Loading } from '../../../../shared/components/loading/loading';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ProjectDetailFacade } from './project-detail.facade';

@Component({
  selector: 'app-project-detail',
  imports: [EmptyState, Loading, RouterLink],
  providers: [ProjectDetailFacade],
  templateUrl: './project-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetail {
  readonly facade = inject(ProjectDetailFacade);
  private readonly route = inject(ActivatedRoute);

  readonly cover = computed(() => {
    const images = this.facade.project()?.imagenes ?? [];
    return images.find((image) => image.esPrincipal) ?? images[0] ?? null;
  });

  constructor() {
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.facade.load(params.get('slug') ?? '');
    });
  }
}
