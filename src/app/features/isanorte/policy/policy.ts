import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { PublicTrustStore } from '../../../data/services/public-trust.store';

/** Página de una política (privacidad, etc.). El texto lo administra el equipo desde el panel. */
@Component({
  selector: 'app-isanorte-policy',
  imports: [RouterLink],
  templateUrl: './policy.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Policy {
  protected readonly trust = inject(PublicTrustStore);
  private readonly title = inject(Title);
  private readonly slug = toSignal(
    inject(ActivatedRoute).paramMap.pipe(map((params) => params.get('slug') ?? '')),
    { initialValue: '' },
  );

  protected readonly policy = computed(() => this.trust.policy(this.slug()));
  /**
   * Bloques separados por una línea en blanco. Si un bloque empieza con una línea numerada
   * («1. Quién es el responsable») y sigue texto, esa línea se muestra como subtítulo.
   */
  protected readonly blocks = computed(() =>
    (this.policy()?.contenido ?? '')
      .split(/\n{2,}/)
      .map((block) => block.trim())
      .filter(Boolean)
      .map((block) => {
        const [first, ...rest] = block.split('\n');
        const isHeading = /^\d+\.\s/.test(first) && rest.length > 0;
        return isHeading
          ? { heading: first, text: rest.join('\n').trim() }
          : { heading: null, text: block };
      }),
  );

  constructor() {
    this.trust.load();
    // El título de la pestaña sigue al texto cuando llega.
    effect(() => {
      const policy = this.policy();
      if (policy) this.title.setTitle(`${policy.titulo} | ISANORTE`);
    });
  }
}
