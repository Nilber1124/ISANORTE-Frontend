import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';

export type BrandKey = 'isanorte' | 'isadecor';

interface BrandDefinition {
  readonly title: string;
  readonly faviconHref: string;
}

const BRANDS: Record<BrandKey, BrandDefinition> = {
  isanorte: {
    title: 'ISANORTE',
    faviconHref: 'favicon.svg',
  },
  isadecor: {
    title: 'ISADECOR',
    faviconHref: 'images/isadecor-isotipo.svg',
  },
};

/** Marca activa en pestaña del navegador (título por defecto y favicon) para ISANORTE/ISADECOR. */
@Injectable({ providedIn: 'root' })
export class BrandService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly titleService = inject(Title);

  setBrand(brand: BrandKey): void {
    const { title, faviconHref } = BRANDS[brand];
    this.titleService.setTitle(title);

    if (!isPlatformBrowser(this.platformId)) return;

    // Chrome no siempre refresca el ícono de la pestaña si solo se cambia el href
    // de un <link> existente: hay que reemplazar el nodo para forzar la recarga.
    // Se quitan también los "alternate icon" (favicon.ico de ISANORTE en index.html),
    // que si no, el navegador los prioriza sobre el <link rel="icon"> dinámico.
    const existing = this.document.querySelectorAll<HTMLLinkElement>(
      'link[rel="icon"], link[rel="alternate icon"], link[rel="shortcut icon"]',
    );
    existing.forEach((link) => link.remove());

    const favicon = this.document.createElement('link');
    favicon.setAttribute('rel', 'icon');
    favicon.setAttribute('type', 'image/svg+xml');
    favicon.setAttribute('href', faviconHref);
    this.document.head.appendChild(favicon);
  }

  titleFor(brand: BrandKey): string {
    return BRANDS[brand].title;
  }
}
