import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  input,
  signal,
  viewChild,
} from '@angular/core';

import { AccessibilityService } from '../../../core/services/accessibility.service';

/** Dónde se monta el widget: botón flotante abajo a la izquierda, o integrado en una barra. */
export type AccessibilityWidgetPlacement = 'floating' | 'inline';

/**
 * Botón de accesibilidad con panel desplegable (no modal) para toda la web.
 *
 * Opciones: modo oscuro, alto contraste, tamaño de texto, reducir animaciones y resaltar enlaces,
 * más "Restablecer todo". El estado vive en {@link AccessibilityService}; este componente solo
 * presenta los controles.
 *
 * Accesibilidad propia: botón con `aria-expanded`/`aria-controls`, interruptores con
 * `role="switch"` y `aria-checked`, estado visible en texto (no solo en color), cierre con
 * Escape o al hacer clic fuera con el foco devuelto al botón, objetivos táctiles de 44 px o más
 * y una región `aria-live` que anuncia cada cambio.
 *
 * Uso: `<app-accessibility-widget />` una sola vez por layout. En barras (p. ej. el topbar del
 * panel de administración): `<app-accessibility-widget placement="inline" />`.
 */
@Component({
  selector: 'app-accessibility-widget',
  templateUrl: './accessibility-widget.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(document:keydown.escape)': 'onEscape()',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class AccessibilityWidget {
  readonly placement = input<AccessibilityWidgetPlacement>('floating');

  protected readonly a11y = inject(AccessibilityService);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly trigger = viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly panel = viewChild<ElementRef<HTMLElement>>('panel');

  protected readonly open = signal(false);

  protected readonly rootClass = computed(() =>
    this.placement() === 'floating'
      ? 'fixed z-40 bottom-[max(1.25rem,env(safe-area-inset-bottom))] left-[max(1.25rem,env(safe-area-inset-left))]'
      : 'relative inline-flex',
  );

  protected readonly triggerClass = computed(() =>
    this.placement() === 'floating'
      ? 'inline-flex size-12 cursor-pointer items-center justify-center rounded-full border border-border-strong bg-action-primary text-action-primary-text shadow-floating transition-colors hover:bg-action-primary-hover'
      : 'inline-flex size-11 cursor-pointer items-center justify-center rounded-control border border-border bg-surface text-text-secondary transition-colors hover:bg-surface-hover hover:text-text-primary',
  );

  protected readonly panelClass = computed(
    () =>
      'z-50 w-[min(22rem,calc(100vw-2rem))] max-h-[min(36rem,calc(100dvh-7rem))] overflow-y-auto rounded-panel border border-border bg-surface-elevated p-4 text-text-primary shadow-floating ' +
      (this.placement() === 'floating'
        ? 'absolute bottom-full left-0 mb-3'
        : 'absolute right-0 top-full mt-2'),
  );

  /** Ficha cuadrada de una opción: borde y fondo de acento cuando está activa. */
  protected tileClass(active: boolean): string {
    return (
      'flex min-h-24 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-control border-2 p-2 text-center transition-colors ' +
      (active
        ? 'border-accent bg-accent/10 text-text-primary'
        : 'border-border bg-surface text-text-primary hover:bg-surface-hover')
    );
  }

  protected toggle(): void {
    if (this.open()) {
      this.close();
      return;
    }
    this.open.set(true);
    // El foco pasa al panel para que el lector de pantalla anuncie su título.
    afterNextRender(() => this.panel()?.nativeElement.focus(), { injector: this.injector });
  }

  protected close(returnFocus = true): void {
    if (!this.open()) return;
    this.open.set(false);
    if (returnFocus) this.trigger()?.nativeElement.focus();
  }

  protected onEscape(): void {
    this.close();
  }

  protected onDocumentClick(event: MouseEvent): void {
    if (!this.open()) return;
    const target = event.target;
    if (target instanceof Node && !this.host.nativeElement.contains(target)) {
      // Clic fuera: se cierra sin mover el foco, que ya está donde la persona hizo clic.
      this.close(false);
    }
  }
}
