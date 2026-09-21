import { NgClass, NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Alert } from '../../../shared/components/alert/alert';
import { Card } from '../../../shared/components/card/card';
import { PublicProjectsFacade } from './public-projects.facade';

@Component({
  imports: [NgClass, NgTemplateOutlet, Alert, Card],
  selector: 'app-isanorte-projects',
  providers: [PublicProjectsFacade],
  styleUrl: './projects.css',
  templateUrl: './projects.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Projects {
  readonly facade = inject(PublicProjectsFacade);

  constructor() {
    this.facade.load();
  }
}
