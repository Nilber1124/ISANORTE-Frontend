import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { Alert } from '../../../shared/components/alert/alert';
import { RevealStagger } from '../../../shared/components/reveal-stagger/reveal-stagger';
import { PublicServicesFacade } from './public-services.facade';

@Component({
  imports: [Alert, RevealStagger],
  selector: 'app-isanorte-services',
  providers: [PublicServicesFacade],
  styleUrl: './services.css',
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
