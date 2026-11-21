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
  readonly blockSelected = output<string>();

  protected readonly device = signal<PreviewDevice>('desktop');
  protected readonly src = inject(DomSanitizer).bypassSecurityTrustResourceUrl('/?editor=1');
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
      if (this.reloadKey() > 0) {
        untracked(() => {
          this.ready = false;
          this.frame()?.nativeElement.contentWindow?.location.reload();
        });
      }
    });
  }

  protected setDevice(device: PreviewDevice): void {
    this.device.set(device);
  }

  private onMessage(event: MessageEvent): void {
    const frameWindow = this.frame()?.nativeElement.contentWindow;
    if (event.origin !== window.location.origin || event.source !== frameWindow) return;
    const data = event.data as { source?: string; type?: string; block?: string } | null;
    if (data?.source !== EDITOR_MESSAGE_SOURCE) return;
    if (data.type === 'ready') {
      this.ready = true;
      const block = this.selected();
      if (block) this.focus(block);
    } else if (data.type === 'select' && data.block) {
      this.blockSelected.emit(data.block);
    }
  }

  private focus(block: string): void {
    this.frame()?.nativeElement.contentWindow?.postMessage(
      { source: ADMIN_MESSAGE_SOURCE, type: 'focus', block },
      window.location.origin,
    );
  }
}
