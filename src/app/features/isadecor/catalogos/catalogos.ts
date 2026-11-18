import { ChangeDetectionStrategy, Component, afterNextRender, inject } from '@angular/core';

import { Alert } from '../../../shared/components/alert/alert';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { CatalogosFacade } from './catalogos.facade';

@Component({
  selector: 'app-isadecor-catalogos',
  imports: [Alert, Button, EmptyState, Loading],
  providers: [CatalogosFacade],
  templateUrl: './catalogos.html',
  styleUrl: './catalogos.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Catalogos {
  readonly facade = inject(CatalogosFacade);

  constructor() {
    afterNextRender(() => this.facade.load());
  }
}
