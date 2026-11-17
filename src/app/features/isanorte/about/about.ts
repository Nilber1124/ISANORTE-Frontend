import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';

import { PublicTrustStore } from '../../../data/services/public-trust.store';
import { PublicSiteFacade } from '../../../layouts/public-layout/public-site.facade';
import { LocationMap } from '../../../shared/components/location-map/location-map';
import { Alert } from '../../../shared/components/alert/alert';
import { CtaBand } from '../../../shared/components/cta-band/cta-band';
import { RevealStagger } from '../../../shared/components/reveal-stagger/reveal-stagger';
import { PublicAboutFacade } from './public-about.facade';

@Component({
  imports: [Alert, CtaBand, LocationMap, RevealStagger],
  selector: 'app-isanorte-about',
  providers: [PublicAboutFacade],
  styleUrl: './about.css',
  templateUrl: './about.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class About {
  readonly facade = inject(PublicAboutFacade);
  private readonly site = inject(PublicSiteFacade, { optional: true });
  readonly trust = inject(PublicTrustStore);
  readonly coverage = computed(() => this.site?.company()?.zonaCobertura?.trim() || null);
  /** «A, B y C» → lista de lugares para mostrarlos como etiquetas. */
  readonly coverageAreas = computed(() =>
    (this.coverage() ?? '')
      .replace(/\.$/, '')
      .split(/,|\sy\s/)
      .map((part) => part.trim())
      .filter(Boolean),
  );
  readonly showMap = computed(() => this.site?.hasMap() ?? false);
  readonly mapEmbedUrl = computed(() => this.site?.mapEmbedUrl() ?? '');
  readonly mapUrl = computed(() => this.site?.mapUrl() ?? '');
  readonly officeAddress = computed(() => this.site?.fullAddress() ?? '');
  protected readonly credentialLabels: Record<string, string> = {
    LICENCIA: 'Licencia',
    COLEGIATURA: 'Colegiatura',
    CERTIFICACION: 'Certificación',
    REGISTRO: 'Registro',
  };

  readonly foundedYear = computed(() => this.site?.company()?.anioFundacion ?? null);
  readonly whatsappHref = computed(
    () => this.site?.whatsappHrefFor('Hola, quisiera cotizar mi proyecto.') ?? null,
  );

  constructor() {
    this.facade.load();
    this.trust.load();
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
