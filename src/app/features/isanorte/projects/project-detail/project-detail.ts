import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PublicTrustStore } from '../../../../data/services/public-trust.store';
import { PROJECT_TYPE_LABELS } from '../../../../data/models/public-content/public-page.model';
import { PublicSiteFacade } from '../../../../layouts/public-layout/public-site.facade';
import { Button } from '../../../../shared/components/button/button';
import { Loading } from '../../../../shared/components/loading/loading';
import { EmptyState } from '../../../../shared/components/empty-state/empty-state';
import { ProjectDetailFacade } from './project-detail.facade';
import { coverImage } from './related-projects';

@Component({
  selector: 'app-project-detail',
  imports: [Button, EmptyState, Loading, RouterLink],
  providers: [ProjectDetailFacade],
  templateUrl: './project-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProjectDetail {
  readonly facade = inject(ProjectDetailFacade);
  readonly trust = inject(PublicTrustStore);
  private readonly route = inject(ActivatedRoute);

  private readonly site = inject(PublicSiteFacade, { optional: true });

  readonly cover = computed(() => {
    const project = this.facade.project();
    return project ? coverImage(project) : null;
  });

  /** Fotos adicionales (sin repetir la portada). */
  readonly gallery = computed(() => {
    const project = this.facade.project();
    const cover = this.cover();
    return project ? project.imagenes.filter((image) => image.url !== cover?.url) : [];
  });

  /** Cotizar algo similar: WhatsApp con el nombre del proyecto o, sin número, Contacto. */
  readonly quoteHref = computed(() => {
    const name = this.facade.project()?.nombre ?? '';
    return (
      this.site?.whatsappHrefFor(
        `Hola, vi el proyecto «${name}» y quisiera cotizar algo similar.`,
      ) ?? '/contacto'
    );
  });
  readonly quoteTarget = computed(() =>
    this.quoteHref().startsWith('https://wa.me/') ? '_blank' : undefined,
  );

  readonly typeLabel = computed(() => {
    const type = this.facade.project()?.tipoObra;
    return type ? PROJECT_TYPE_LABELS[type] : null;
  });

  /** Galería de la BD (antes, proceso, final, detalle), por etiqueta. */
  readonly stagedGallery = computed(() => {
    const slug = this.facade.project()?.slug;
    return slug ? this.trust.galleryFor(slug) : [];
  });
  readonly testimonials = computed(() => {
    const slug = this.facade.project()?.slug;
    return slug ? this.trust.testimonialsFor(slug) : [];
  });
  protected readonly stageLabels: Record<string, string> = {
    ANTES: 'Antes',
    PROCESO: 'Durante la obra',
    FINAL: 'Resultado',
    DETALLE: 'Detalle',
  };

  protected readonly coverOf = coverImage;

  constructor() {
    this.trust.load();
    this.route.paramMap.pipe(takeUntilDestroyed()).subscribe((params) => {
      this.facade.load(params.get('slug') ?? '');
    });
  }
}
