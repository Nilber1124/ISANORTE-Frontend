import { ChangeDetectionStrategy, Component, afterNextRender, computed, inject } from '@angular/core';

import { Alert } from '../../../shared/components/alert/alert';
import { Button } from '../../../shared/components/button/button';
import { EmptyState } from '../../../shared/components/empty-state/empty-state';
import { Loading } from '../../../shared/components/loading/loading';
import { CatalogosFacade } from './catalogos.facade';

/** Cloudinary: con `fl_attachment` el PDF se descarga en vez de abrirse (el atributo `download` se ignora entre dominios). */
export function downloadUrl(url: string): string {
  return url.includes('/raw/upload/') && !url.includes('/fl_attachment')
    ? url.replace('/raw/upload/', '/raw/upload/fl_attachment/')
    : url;
}

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
  protected readonly downloadUrl = downloadUrl;

  /** La primera línea (por orden) se muestra destacada; con un solo catálogo, solo ese. */
  protected readonly featured = computed(() => this.facade.catalogos()[0] ?? null);
  protected readonly others = computed(() => this.facade.catalogos().slice(1));

  constructor() {
    afterNextRender(() => this.facade.load());
  }
}
