import { DOCUMENT } from '@angular/common';
import { SmoothDetails } from '../../../shared/directives/smooth-details.directive';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
} from '@angular/core';

import { AccessibilityService } from '../../../core/services/accessibility.service';
import { initEditorBridge } from '../../../shared/utils/editor-bridge';
import { PublicTrustStore } from '../../../data/services/public-trust.store';
import { PublicSiteFacade } from '../../../layouts/public-layout/public-site.facade';
import { Alert } from '../../../shared/components/alert/alert';
import { Button } from '../../../shared/components/button/button';
import { CtaBand } from '../../../shared/components/cta-band/cta-band';
import { PageHeader } from '../../../shared/components/page-header/page-header';
import { RevealStagger } from '../../../shared/components/reveal-stagger/reveal-stagger';
import { PublicServicesFacade } from './public-services.facade';

@Component({
  imports: [SmoothDetails, Alert, Button, CtaBand, PageHeader, RevealStagger],
  selector: 'app-isanorte-services',
  providers: [PublicServicesFacade],
  templateUrl: './services.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Services {
  readonly facade = inject(PublicServicesFacade);
  readonly trust = inject(PublicTrustStore);

  private readonly site = inject(PublicSiteFacade, { optional: true });
  private readonly document = inject(DOCUMENT);
  private readonly a11y = inject(AccessibilityService, { optional: true });

  constructor() {
    this.facade.load();
    this.trust.load();

    // Dentro de la vista previa del admin (?editor=1) los bloques se pueden señalar para editarlos.
    const destroyRef = inject(DestroyRef);
    afterNextRender(() => {
      const win = this.document.defaultView;
      const stop = win ? initEditorBridge(this.document, win) : null;
      if (stop) destroyRef.onDestroy(stop);
    });
  }

  /** WhatsApp general de la empresa (para el cierre de la página); null si no hay número. */
  readonly whatsappHref = computed(
    () => this.site?.whatsappHrefFor('Hola, quisiera cotizar un servicio.') ?? null,
  );

  /** Cotizar un servicio concreto: WhatsApp con su nombre o, sin número, la página de contacto. */
  quoteHref(serviceName: string): string {
    return (
      this.site?.whatsappHrefFor(`Hola, quisiera cotizar el servicio de ${serviceName}.`) ??
      '/contacto'
    );
  }

  quoteTarget(serviceName: string): '_blank' | undefined {
    return this.quoteHref(serviceName).startsWith('https://wa.me/') ? '_blank' : undefined;
  }

  /**
   * Desplaza hasta el servicio sin cambiar de ruta (un `#ancla` suelto apuntaría a la raíz por el
   * `<base href>`). Sin JavaScript queda el enlace absoluto `/servicios#servicio-...`.
   */
  scrollToService(event: Event, slug: string): void {
    const target = this.document.getElementById(`servicio-${slug}`);
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({
      behavior: this.a11y?.reduceMotion() ? 'auto' : 'smooth',
      block: 'start',
    });
  }
}
