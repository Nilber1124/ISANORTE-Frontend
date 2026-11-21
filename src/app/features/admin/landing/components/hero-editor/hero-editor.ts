import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { FormsModule } from '@angular/forms';

import { HeroSceneRequest, HeroSceneResponse } from '../../../../../data/models/landing-section/hero-scene.model';
import { LandingSectionResponse } from '../../../../../data/models/landing-section/landing-section-response.model';
import { LandingSectionUpdateRequest } from '../../../../../data/models/landing-section/landing-section-update-request.model';
import { Button } from '../../../../../shared/components/button/button';
import { ImageUploaderComponent } from '../../../../../shared/components/image-uploader/image-uploader.component';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';

/** Texto que se está escribiendo (se muestra ya en la vista previa) o `null` si no hay cambios. */
export type HeroDraft = Readonly<Record<'etiqueta' | 'titulo' | 'subtitulo', string>> | null;

/** Campo que se tocó en la vista previa; `n` cambia en cada toque para volver a enfocarlo. */
export interface HeroFocusRequest {
  readonly field: string;
  readonly n: number;
}

export interface HeroTextsSave {
  readonly request: LandingSectionUpdateRequest;
}
export interface HeroChildSave<T> {
  readonly id: string | null;
  readonly request: T;
}
export interface HeroSwap {
  readonly first: HeroSceneResponse;
  readonly second: HeroSceneResponse;
}

/**
 * Editor del bloque «Portada (Hero)» para el panel lateral de la vista previa. Un solo formulario
 * en una columna: textos (se guardan con su botón) y la lista de fotos de fondo (cada cambio
 * se aplica al instante, y así se dice en pantalla).
 */
@Component({
  selector: 'app-hero-editor',
  imports: [Button, FormsModule, ImageUploaderComponent, InputField, TextareaField],
  templateUrl: './hero-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroEditor {
  readonly section = input.required<LandingSectionResponse>();
  /** Un texto o una lista se está guardando. */
  readonly busy = input(false);
  readonly visibilityBusy = input(false);
  /** Campo tocado en la vista previa: se enfoca aquí. */
  readonly focusRequest = input<HeroFocusRequest | null>(null);
  /** Si se indica, se muestra solo ese campo o lista (etiqueta, titulo, subtitulo, fotos). */
  readonly only = input<string | null>(null);

  readonly closed = output<void>();
  readonly textsSaved = output<HeroTextsSave>();
  readonly visibilityChanged = output<boolean>();
  readonly sceneSaved = output<HeroChildSave<HeroSceneRequest>>();
  readonly sceneDeleted = output<string>();
  readonly swapped = output<HeroSwap>();
  readonly draftChanged = output<HeroDraft>();
  /** Pide pasar del campo suelto al formulario completo del Hero. */
  readonly showAll = output<void>();

  private static readonly LABELS: Readonly<Record<string, string>> = {
    etiqueta: 'Frase pequeña sobre el título',
    titulo: 'Título',
    subtitulo: 'Subtítulo',
    fotos: 'Fotos de fondo',
  };

  protected readonly onlyLabel = computed(() => HeroEditor.LABELS[this.only() ?? ''] ?? null);

  /** ¿Se muestra este campo o lista? (todos, salvo que se haya tocado uno concreto) */
  protected shows(key: string): boolean {
    const only = this.only();
    return !only || only === key;
  }

  protected showsTexts(): boolean {
    return this.shows('etiqueta') || this.shows('titulo') || this.shows('subtitulo');
  }

  protected readonly etiqueta = signal('');
  protected readonly titulo = signal('');
  protected readonly subtitulo = signal('');

  protected readonly scenes = computed(() =>
    [...this.section().escenas].sort((a, b) => a.orden - b.orden),
  );

  protected readonly textsDirty = computed(() => {
    const s = this.section();
    return (
      this.etiqueta() !== (s.etiqueta ?? '') ||
      this.titulo() !== (s.titulo ?? '') ||
      this.subtitulo() !== (s.subtitulo ?? '')
    );
  });

  protected readonly confirmDelete = signal<string | null>(null);
  protected readonly newSceneUrl = signal('');


  private loadedId: string | null = null;

  private static readonly FOCUS_TARGETS: Readonly<Record<string, string>> = {
    etiqueta: 'hero-etiqueta',
    titulo: 'hero-titulo',
    subtitulo: 'hero-subtitulo',
    fotos: 'hero-fotos',
  };

  constructor() {
    // Escritura en vivo: lo tecleado se ve ya en la vista previa (sin guardar).
    effect(() => {
      const values = {
        etiqueta: this.etiqueta(),
        titulo: this.titulo(),
        subtitulo: this.subtitulo(),
      };
      const dirty = this.textsDirty();
      untracked(() => this.draftChanged.emit(dirty ? values : null));
    });

    // Al tocar un texto de la página se enfoca su campo (o se muestra su lista).
    effect(() => {
      const request = this.focusRequest();
      if (!request) return;
      const id = HeroEditor.FOCUS_TARGETS[request.field];
      if (!id) return;
      setTimeout(() => {
        const target = document.getElementById(id);
        if (!target) return;
        target.scrollIntoView?.({ behavior: 'smooth', block: 'center' });
        target.focus({ preventScroll: true });
      }, 50);
    });

    // Los textos se cargan al abrir el bloque (no se pisan cuando solo cambian las listas).
    effect(() => {
      const s = this.section();
      untracked(() => {
        if (this.loadedId !== s.id) {
          this.loadedId = s.id;
          this.etiqueta.set(s.etiqueta ?? '');
          this.titulo.set(s.titulo ?? '');
          this.subtitulo.set(s.subtitulo ?? '');
          this.confirmDelete.set(null);
        }
      });
    });
  }

  protected saveTexts(): void {
    const s = this.section();
    this.textsSaved.emit({
      request: {
        configuracionSitioId: s.configuracionSitioId,
        tipo: s.tipo,
        etiqueta: this.etiqueta().trim() || null,
        // El salto de línea del título es parte del diseño: se conserva (solo se recortan los extremos).
        titulo: this.titulo().trim() || null,
        subtitulo: this.subtitulo().trim() || null,
        contenido: s.contenido,
        imagenUrl: s.imagenUrl,
        imagenAlt: s.imagenAlt,
        textoBoton: s.textoBoton,
        enlaceBoton: s.enlaceBoton,
        orden: s.orden ?? 0,
        visible: s.visible ?? true,
      },
    });
  }

  // ── Diapositivas ─────────────────────────────────────────────────────────
  protected addScene(url: string): void {
    if (!url) return;
    const nextOrder = this.scenes().reduce((max, s) => Math.max(max, s.orden), -1) + 1;
    this.sceneSaved.emit({ id: null, request: { imagenUrl: url, alt: null, orden: nextOrder, activo: true } });
    this.newSceneUrl.set('');
  }

  protected saveSceneAlt(scene: HeroSceneResponse, alt: string): void {
    const clean = alt.trim() || null;
    if (clean === (scene.alt ?? null)) return;
    const { id, ...rest } = scene;
    this.sceneSaved.emit({ id, request: { ...rest, alt: clean } });
  }

  protected toggleScene(scene: HeroSceneResponse): void {
    const { id, ...rest } = scene;
    this.sceneSaved.emit({ id, request: { ...rest, activo: !scene.activo } });
  }

  // ── Comunes ──────────────────────────────────────────────────────────────
  protected move(index: number, direction: -1 | 1): void {
    const list = this.scenes();
    const first = list[index];
    const second = list[index + direction];
    if (first && second) this.swapped.emit({ first, second });
  }

  protected askDelete(id: string): void {
    this.confirmDelete.set(id);
  }

  protected deleteScene(id: string): void {
    this.confirmDelete.set(null);
    this.sceneDeleted.emit(id);
  }
}
