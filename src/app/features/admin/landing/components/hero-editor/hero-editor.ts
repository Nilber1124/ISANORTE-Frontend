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
import { NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { HeroSceneRequest, HeroSceneResponse } from '../../../../../data/models/landing-section/hero-scene.model';
import { LandingActionRequest, LandingActionResponse } from '../../../../../data/models/landing-section/landing-action.model';
import { LandingSectionResponse } from '../../../../../data/models/landing-section/landing-section-response.model';
import { LandingSectionUpdateRequest } from '../../../../../data/models/landing-section/landing-section-update-request.model';
import { Button } from '../../../../../shared/components/button/button';
import { ImageUploaderComponent } from '../../../../../shared/components/image-uploader/image-uploader.component';
import { InputField } from '../../../../../shared/components/input-field/input-field';
import { TextareaField } from '../../../../../shared/components/textarea-field/textarea-field';

export interface HeroTextsSave {
  readonly request: LandingSectionUpdateRequest;
}
export interface HeroChildSave<T> {
  readonly id: string | null;
  readonly request: T;
}
export interface HeroSwap {
  readonly kind: 'scene' | 'action';
  readonly first: HeroSceneResponse | LandingActionResponse;
  readonly second: HeroSceneResponse | LandingActionResponse;
}

/**
 * Editor del bloque «Portada (Hero)» para el panel lateral de la vista previa. Un solo formulario
 * en una columna: textos (se guardan con su botón) y listas de botones y diapositivas (cada cambio
 * se aplica al instante, y así se dice en pantalla).
 */
@Component({
  selector: 'app-hero-editor',
  imports: [Button, FormsModule, NgTemplateOutlet, ImageUploaderComponent, InputField, TextareaField],
  templateUrl: './hero-editor.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeroEditor {
  readonly section = input.required<LandingSectionResponse>();
  /** Un texto o una lista se está guardando. */
  readonly busy = input(false);
  readonly visibilityBusy = input(false);

  readonly closed = output<void>();
  readonly textsSaved = output<HeroTextsSave>();
  readonly visibilityChanged = output<boolean>();
  readonly actionSaved = output<HeroChildSave<LandingActionRequest>>();
  readonly actionDeleted = output<string>();
  readonly sceneSaved = output<HeroChildSave<HeroSceneRequest>>();
  readonly sceneDeleted = output<string>();
  readonly swapped = output<HeroSwap>();

  protected readonly etiqueta = signal('');
  protected readonly titulo = signal('');
  protected readonly subtitulo = signal('');

  protected readonly actions = computed(() =>
    [...this.section().acciones].sort((a, b) => a.orden - b.orden),
  );
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

  /** Botón en edición: id, `'new'` o nada. */
  protected readonly editingAction = signal<string | null>(null);
  protected readonly draftText = signal('');
  protected readonly draftLink = signal('');
  protected readonly confirmDelete = signal<string | null>(null);
  protected readonly newSceneUrl = signal('');

  protected readonly quickLinks: readonly string[] = ['/proyectos', '/servicios', '/nosotros', '/contacto'];

  private loadedId: string | null = null;

  constructor() {
    // Los textos se cargan al abrir el bloque (no se pisan cuando solo cambian las listas).
    effect(() => {
      const s = this.section();
      untracked(() => {
        if (this.loadedId !== s.id) {
          this.loadedId = s.id;
          this.etiqueta.set(s.etiqueta ?? '');
          this.titulo.set(s.titulo ?? '');
          this.subtitulo.set(s.subtitulo ?? '');
          this.editingAction.set(null);
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

  // ── Botones ──────────────────────────────────────────────────────────────
  protected startAction(action: LandingActionResponse | null): void {
    this.editingAction.set(action?.id ?? 'new');
    this.draftText.set(action?.texto ?? '');
    this.draftLink.set(action?.enlace ?? '');
  }

  protected cancelAction(): void {
    this.editingAction.set(null);
  }

  protected readonly draftValid = computed(
    () => this.draftText().trim() !== '' && this.draftLink().trim() !== '',
  );

  protected saveAction(): void {
    const id = this.editingAction();
    if (!id || !this.draftValid()) return;
    const existing = this.actions().find((a) => a.id === id);
    const nextOrder = this.actions().reduce((max, a) => Math.max(max, a.orden), -1) + 1;
    this.actionSaved.emit({
      id: existing ? existing.id : null,
      request: {
        texto: this.draftText().trim(),
        enlace: this.draftLink().trim(),
        orden: existing?.orden ?? nextOrder,
        activo: existing?.activo ?? true,
      },
    });
    this.editingAction.set(null);
  }

  protected toggleAction(action: LandingActionResponse): void {
    const { id, ...rest } = action;
    this.actionSaved.emit({ id, request: { ...rest, activo: !action.activo } });
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
  protected move(kind: 'scene' | 'action', index: number, direction: -1 | 1): void {
    const list = kind === 'scene' ? this.scenes() : this.actions();
    const first = list[index];
    const second = list[index + direction];
    if (first && second) this.swapped.emit({ kind, first, second });
  }

  protected askDelete(id: string): void {
    this.confirmDelete.set(id);
  }

  protected deleteAction(id: string): void {
    this.confirmDelete.set(null);
    this.actionDeleted.emit(id);
  }

  protected deleteScene(id: string): void {
    this.confirmDelete.set(null);
    this.sceneDeleted.emit(id);
  }
}
