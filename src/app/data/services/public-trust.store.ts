import { Injectable, computed, inject, signal } from '@angular/core';
import { finalize } from 'rxjs';

import { PUBLIC_SITE_KEY } from '../../core/config/public-site.config';
import { BLOCK_TEXT_DEFAULTS, BlockKey, BlockTextField } from '../../shared/content/block-texts';
import { PublicTrustResponse } from '../models/public-content/public-trust.model';
import { PublicContentApiService } from './public-content-api.service';

/**
 * Contenido de confianza (FAQ, equipo, credenciales, testimonios, clientes, garantías, pasos y galería).
 * Se pide una sola vez y lo comparten Home, Nosotros, Servicios y el detalle de proyecto.
 * Si la API falla, las listas quedan vacías y cada sección se oculta.
 */
@Injectable({ providedIn: 'root' })
export class PublicTrustStore {
  private readonly api = inject(PublicContentApiService);

  private readonly _data = signal<PublicTrustResponse | null>(null);
  private readonly _loading = signal(true);
  private requested = false;

  readonly loading = this._loading.asReadonly();
  readonly loaded = computed(() => this._data() !== null);

  readonly faqs = computed(() => this._data()?.faqs ?? []);
  readonly team = computed(() => this._data()?.equipo ?? []);
  readonly credentials = computed(() => this._data()?.credenciales ?? []);
  readonly testimonials = computed(() => this._data()?.testimonios ?? []);
  readonly guarantees = computed(() => this._data()?.garantias ?? []);
  readonly heroGuarantees = computed(() => this.guarantees().filter((item) => item.enHero));
  readonly steps = computed(() => this._data()?.pasos ?? []);
  readonly policies = computed(() => this._data()?.politicas ?? []);
  readonly gallery = computed(() => this._data()?.galeria ?? []);

  /** Texto de cabecera de un bloque de la Home: el guardado en el admin o, si no hay, el de por defecto. */
  blockText(key: BlockKey, field: BlockTextField): string {
    const saved = this._data()?.textos?.find((item) => item.clave === key)?.[field];
    return saved ?? BLOCK_TEXT_DEFAULTS[key][field] ?? '';
  }

  faqsFor(scope: 'HOME' | 'SERVICIOS' | 'CONTACTO') {
    return this.faqs().filter((item) => item.ambito === scope || item.ambito === 'GENERAL');
  }

  policy(slug: string) {
    return this.policies().find((item) => item.slug === slug) ?? null;
  }

  galleryFor(projectSlug: string) {
    return this.gallery().filter((item) => item.proyectoSlug === projectSlug);
  }

  testimonialsFor(projectSlug: string) {
    return this.testimonials().filter((item) => item.proyectoSlug === projectSlug);
  }

  load(): void {
    if (this.requested) return;
    this.requested = true;
    this.api
      .getTrust(PUBLIC_SITE_KEY)
      .pipe(finalize(() => this._loading.set(false)))
      .subscribe({
        next: (data) => this._data.set(data),
        error: () => this._data.set(null),
      });
  }
}
