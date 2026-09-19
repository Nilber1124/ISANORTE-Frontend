import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';

import { Alert } from '../../../shared/components/alert/alert';
import { Badge } from '../../../shared/components/badge/badge';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { AdminLandingFacade } from './admin-landing.facade';
import { LandingSectionForm } from './components/landing-section-form/landing-section-form';

@Component({
  selector: 'app-admin-landing',
  imports: [Alert, Badge, Button, EmptyState, LandingSectionForm, RouterLink],
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
}
