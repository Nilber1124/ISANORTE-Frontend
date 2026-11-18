import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';

import { Alert } from '../../../shared/components/alert/alert';
import { RevealStagger } from '../../../shared/components/reveal-stagger/reveal-stagger';
import { PublicAboutFacade } from './public-about.facade';

@Component({
  imports: [Alert, RevealStagger],
  selector: 'app-isanorte-about',
  providers: [PublicAboutFacade],
  styleUrl: './about.css',
  templateUrl: './about.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  readonly facade = inject(PublicAboutFacade);
  readonly openValue = signal<string | null>('mision');

  constructor() {
    this.facade.load();
  }

  toggleValue(id: string): void {
    this.openValue.update((current) => (current === id ? null : id));
  }
}
