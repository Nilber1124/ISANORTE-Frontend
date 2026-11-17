import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Cabecera oscura de las páginas internas (Servicios, Proyectos): etiqueta superior, título H1 y
 * una línea de acento. Presenta texto que cada página recibe; no conoce el negocio.
 */
@Component({
  selector: 'app-page-header',
  templateUrl: './page-header.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageHeader {
  readonly eyebrow = input<string | null | undefined>();
  readonly title = input<string | null | undefined>();
}
