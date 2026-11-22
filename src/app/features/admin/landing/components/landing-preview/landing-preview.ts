import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  effect,
  inject,
  input,
  model,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';

import {
  ADMIN_MESSAGE_SOURCE,
  EDITOR_MESSAGE_SOURCE,
} from '../../../../../shared/utils/editor-bridge';

export type PreviewDevice = 'desktop' | 'mobile';

/** Páginas públicas que se pueden previsualizar y editar. */
export type PreviewPage = 'inicio' | 'nosotros';

const PAGE_URLS: Record<PreviewPage, string> = {
  inicio: '/?editor=1',
  nosotros: '/nosotros?editor=1',
};
export const PREVIEW_PAGE_LABELS: Record<PreviewPage, string> = { inicio: 'Inicio', nosotros: 'Nosotros' };

/** Texto que se está escribiendo en el panel, por campo, para mostrarlo ya en la página. */
export interface PreviewDraft {
  readonly block: string;
  /** Elemento repetido al que pertenece (p. ej. `servicio:<id>`); sin él, el borrador es del bloque. */
  readonly item?: string;
  readonly values: Readonly<Record<string, string>>;
}

/** Campo (texto o imagen) de un bloque que se tocó en la página. */
export interface PreviewFieldSelection {
  readonly block: string;
  readonly field: string;
  /** Elemento repetido tocado (p. ej. una tarjeta de servicio). */
  readonly item?: string;
}

const FRAME_WIDTH: Record<PreviewDevice, number> = { desktop: 1280, mobile: 390 };
/** Alto visible de la vista previa (px); el iframe se agranda para compensar la reducción. */
const VIEWPORT_HEIGHT = 640;

/**
 * Vista previa de la web real dentro del admin: la Home pública en un iframe del mismo origen,
 * reducida para caber. La página (con `?editor=1`) avisa del bloque que se toca.
 */
@Component({
  selector: 'app-landing-preview',
  templateUrl: './landing-preview.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPreview {
  /** Id del bloque (ancla de la web) que se muestra marcado. */
  readonly selected = input<string | null>(null);
  /** Cada cambio recarga la web (p. ej. tras guardar). */
  readonly reloadKey = input(0);
  /** Borrador en vivo del bloque abierto en el panel; `null` = lo guardado. */
  readonly draft = input<PreviewDraft | null>(null);
  /** Página que se muestra (Inicio o Nosotros). */
  readonly page = model<PreviewPage>('inicio');
  readonly blockSelected = output<string>();
  readonly fieldSelected = output<PreviewFieldSelection>();

  protected readonly device = signal<PreviewDevice>('desktop');
  private readonly sanitizer = inject(DomSanitizer);
  protected readonly src = computed(() =>
    this.sanitizer.bypassSecurityTrustResourceUrl(PAGE_URLS[this.page()]),
  );
  protected readonly pages = Object.entries(PREVIEW_PAGE_LABELS).map(([id, label]) => ({
    id: id as PreviewPage,
    label,
  }));
  protected readonly viewportHeight = VIEWPORT_HEIGHT;

  private readonly container = viewChild.required<ElementRef<HTMLElement>>('container');
  private readonly frame = viewChild<ElementRef<HTMLIFrameElement>>('frame');
  private readonly width = signal(0);

  protected readonly frameWidth = computed(() => FRAME_WIDTH[this.device()]);
  protected readonly scale = computed(() => {
    const available = this.width();
    return available > 0 ? Math.min(1, available / this.frameWidth()) : 1;
  });
  protected readonly offsetLeft = computed(() =>
    Math.max(0, (this.width() - this.frameWidth() * this.scale()) / 2),
  );

  private ready = false;
  /** La página ya terminó de cargar: antes, recargarla cancelaría la primera navegación del iframe. */
  private loaded = false;

  constructor() {
    const destroyRef = inject(DestroyRef);

    afterNextRender(() => {
      const element = this.container().nativeElement;
      this.width.set(element.clientWidth);
      // En pantallas estrechas la web de escritorio quedaría ilegible: se arranca en móvil.
      if (element.clientWidth < 700) this.device.set('mobile');
      const observer =
        typeof ResizeObserver === 'undefined'
          ? null
          : new ResizeObserver(() => this.width.set(element.clientWidth));
      observer?.observe(element);

      const onMessage = (event: MessageEvent): void => this.onMessage(event);
      window.addEventListener('message', onMessage);
      destroyRef.onDestroy(() => {
        observer?.disconnect();
        window.removeEventListener('message', onMessage);
      });
    });

    effect(() => {
      const block = this.selected();
      if (block && untracked(() => this.ready)) this.focus(block);
    });

    effect(() => {
      const draft = this.draft();
      untracked(() => this.sendDraft(draft));
    });

    effect(() => {
      if (this.reloadKey() > 0) {
        untracked(() => {
          if (!this.loaded) return; // la primera carga aún no terminó: ya traerá lo último
          this.ready = false;
          this.loaded = false;
          this.frame()?.nativeElement.contentWindow?.location.reload();
        });
      }
    });
  }

  protected onFrameLoad(): void {
    const href = this.frame()?.nativeElement.contentWindow?.location.href;
    this.loaded = !!href && href !== 'about:blank';
  }

  protected setPage(page: PreviewPage): void {
    if (page === this.page()) return;
    this.ready = false;
    this.loaded = false;
    this.page.set(page);
  }

  protected setDevice(device: PreviewDevice): void {
    this.device.set(device);
  }

  private onMessage(event: MessageEvent): void {
    const frameWindow = this.frame()?.nativeElement.contentWindow;
    if (event.origin !== window.location.origin || event.source !== frameWindow) return;
    const data = event.data as {
      source?: string;
      type?: string;
      block?: string;
      field?: string;
      item?: string;
    } | null;
    if (data?.source !== EDITOR_MESSAGE_SOURCE) return;
    if (data.type === 'ready') {
      this.ready = true;
      const block = this.selected();
      if (block) this.focus(block);
      this.sendDraft(this.draft());
    } else if (data.type === 'select' && data.block) {
      this.blockSelected.emit(data.block);
      if (data.field) {
        this.fieldSelected.emit({ block: data.block, field: data.field, item: data.item });
      }
    }
  }

  private sendDraft(draft: PreviewDraft | null): void {
    const frameWindow = this.frame()?.nativeElement.contentWindow;
    if (!frameWindow || !this.ready) return;
    frameWindow.postMessage(
      {
        source: ADMIN_MESSAGE_SOURCE,
        type: 'draft',
        block: draft?.block ?? this.selected() ?? '',
        item: draft?.item ?? null,
        values: draft?.values ?? null,
      },
      window.location.origin,
    );
  }

  private focus(block: string): void {
    this.frame()?.nativeElement.contentWindow?.postMessage(
      { source: ADMIN_MESSAGE_SOURCE, type: 'focus', block },
      window.location.origin,
    );
  }
}
