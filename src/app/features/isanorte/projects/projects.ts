import { NgClass, NgTemplateOutlet } from '@angular/common';
import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, afterNextRender, inject } from '@angular/core';

import { RouterLink } from '@angular/router';
import { Alert } from '../../../shared/components/alert/alert';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { Card } from '../../../shared/components/card/card';
import { initEditorBridge } from '../../../shared/utils/editor-bridge';
import { PublicProjectsFacade } from './public-projects.facade';

@Component({
  imports: [NgClass, NgTemplateOutlet, Alert, Card, PageHeader, RouterLink],
  selector: 'app-isanorte-projects',
  providers: [PublicProjectsFacade],
  templateUrl: './projects.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Projects {
  readonly facade = inject(PublicProjectsFacade);

  constructor() {
    this.facade.load();

    // Dentro de la vista previa del admin (?editor=1) los bloques se pueden señalar para editarlos.
    const destroyRef = inject(DestroyRef);
    const document = inject(DOCUMENT);
    afterNextRender(() => {
      const win = document.defaultView;
      const stop = win ? initEditorBridge(document, win) : null;
      if (stop) destroyRef.onDestroy(stop);
    });
  }
}
