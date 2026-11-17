import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { PublicSiteFacade } from '../../../layouts/public-layout/public-site.facade';
import { Alert } from '../../../shared/components/alert/alert';
import { CtaBand } from '../../../shared/components/cta-band/cta-band';
import { RevealStagger } from '../../../shared/components/reveal-stagger/reveal-stagger';
import { PublicAboutFacade } from './public-about.facade';

@Component({
  imports: [Alert, CtaBand, RevealStagger],
  selector: 'app-isanorte-about',
  providers: [PublicAboutFacade],
  styleUrl: './about.css',
  templateUrl: './about.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  readonly facade = inject(PublicAboutFacade);
  private readonly site = inject(PublicSiteFacade, { optional: true });
  readonly whatsappHref = computed(
    () => this.site?.whatsappHrefFor('Hola, quisiera cotizar mi proyecto.') ?? null,
  );

  constructor() {
    this.facade.load();
  }

  /** «A | B | C» se presenta como lista; un texto sin barras queda como párrafo (devuelve null). */
  valueParts(description: string): readonly string[] | null {
    const parts = description
      .split('|')
      .map((part) => part.trim())
      .filter(Boolean);
    return parts.length > 1 ? parts : null;
  }
}
