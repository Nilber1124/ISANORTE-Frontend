import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { Alert } from '../../../shared/components/alert/alert';
import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { AdminLandingFacade } from './admin-landing.facade';
import { LandingSectionForm } from './components/landing-section-form/landing-section-form';
import { HeroSceneRequest } from '../../../data/models/landing-section/hero-scene.model';
import { LandingActionRequest } from '../../../data/models/landing-section/landing-action.model';
import {
  DynamicChildManager,
  DynamicChildSave,
} from '../shared/dynamic-child-manager/dynamic-child-manager';

@Component({
  selector: 'app-admin-landing',
  imports: [Alert, Badge, Button, DynamicChildManager, EmptyState, LandingSectionForm, RouterLink],
  templateUrl: './admin-landing.html',
  styleUrls: ['./admin-landing.css'],
  providers: [AdminLandingFacade],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AdminLanding {
  readonly facade = inject(AdminLandingFacade);

  constructor() {
    afterNextRender(() => {
      this.facade.load();
    });
  }

  protected saveChild(event: DynamicChildSave): void {
    if (this.facade.childKind() === 'scene')
      this.facade.saveScene(event.request as HeroSceneRequest, event.id);
    else this.facade.saveAction(event.request as LandingActionRequest, event.id);
  }
}
