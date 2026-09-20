import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';

import { PUBLIC_SITE_KEY } from '../../../core/config/public-site.config';
import {
  PublicHomeResponse,
  PublicHomeSectionType,
} from '../../../data/models/public-content/public-home.model';
import { PublicContentApiService } from '../../../data/services/public-content-api.service';
import { CinematicScene } from '../../../shared/components/cinematic-tour/cinematic-tour';
import { HOME_HERO_FALLBACK, HeroActionViewData, HeroViewData } from './home-hero-fallback';

@Injectable()
export class PublicHomeFacade {
  private readonly api = inject(PublicContentApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly _home = signal<PublicHomeResponse | null>(null);
  private readonly _loading = signal(true);
  private readonly _error = signal<string | null>(null);
  private requestInFlight = false;

  readonly home = this._home.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();

  readonly heroSection = computed(
    () =>
      this._home()?.secciones.find((section) => section.tipo === PublicHomeSectionType.HERO) ??
      null,
  );

  readonly hero = computed<HeroViewData | null>(() => {
    const home = this._home();
    if (home === null) return HOME_HERO_FALLBACK.content;

    const section = this.heroSection();
    if (section === null) return null;

    return {
      tag: section.etiqueta ?? '',
      title: section.titulo ?? '',
      subtitle: section.subtitulo ?? '',
    };
  });

  readonly heroScenes = computed<readonly CinematicScene[]>(() => {
    const home = this._home();
    if (home === null) return HOME_HERO_FALLBACK.scenes;

    const section = this.heroSection();
    if (section === null) return [];

    return [...section.escenas]
      .sort((left, right) => left.orden - right.orden)
      .map((scene, index) => ({
        id: `hero-scene-${scene.orden}-${index}`,
        imageUrl: scene.imagenUrl,
      }));
  });

  readonly heroActions = computed<readonly HeroActionViewData[]>(() => {
    const home = this._home();
    if (home === null) return HOME_HERO_FALLBACK.actions;

    const section = this.heroSection();
    if (section === null) return [];

    return [...section.acciones]
      .sort((left, right) => left.orden - right.orden)
      .slice(0, 2)
      .map((action) => ({ label: action.texto, url: action.enlace, order: action.orden }));
  });

  load(): void {
    if (this.requestInFlight) return;

    this.requestInFlight = true;
    this._loading.set(true);
    this._error.set(null);

    this.api
      .getHome(PUBLIC_SITE_KEY)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        finalize(() => {
          this.requestInFlight = false;
          this._loading.set(false);
        }),
      )
      .subscribe({
        next: (home) => this._home.set(home),
        error: () => {
          this._error.set(
            'No pudimos cargar el contenido actualizado. Mostramos temporalmente la versión local.',
          );
        },
      });
  }
}
