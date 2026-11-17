import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Alert } from '../../../shared/components/alert/alert';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { RevealStagger } from '../../../shared/components/reveal-stagger/reveal-stagger';
import { PublicServicesFacade } from './public-services.facade';

@Component({
  imports: [Alert, PageHeader, RevealStagger],
  selector: 'app-isanorte-services',
  providers: [PublicServicesFacade],
  templateUrl: './services.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Services {
  readonly facade = inject(PublicServicesFacade);

  constructor() {
    this.facade.load();
  }

  serviceNumber(index: number): string {
    return String(index + 1).padStart(2, '0');
  }
}
