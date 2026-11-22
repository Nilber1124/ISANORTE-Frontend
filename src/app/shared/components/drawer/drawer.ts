import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  model,
  signal,
  output,
  viewChild,
} from '@angular/core';
import { Button } from '../button/button';
import { Loading } from '../loading/loading';

export type DrawerCloseReason = 'button' | 'backdrop' | 'escape';

@Component({
  selector: 'app-drawer',
  imports: [Button, Loading],
  templateUrl: './drawer.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Drawer {
  readonly drawerId = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input<string | undefined>();
  readonly open = model(false);
  readonly dismissible = input(true, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  /**
   * Pide confirmación al cerrar si alguien escribió en un formulario del panel (X, fuera del panel,
   * Escape o `requestClose()`). Los paneles de solo lectura no lo activan.
   */
  readonly guardUnsaved = input(false, { transform: booleanAttribute });

  readonly closed = output<DrawerCloseReason>();

  private readonly injector = inject(Injector);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('drawerPanel');
  private returnFocusTo?: HTMLElement;
  private readonly touched = signal(false);
  protected readonly confirmingDiscard = signal(false);

  protected readonly titleId = computed(() => `${this.drawerId()}-title`);
  protected readonly descriptionId = computed(() => `${this.drawerId()}-description`);

  private readonly manageFocus = effect(() => {
    const isOpen = this.open();
    afterNextRender(
      () => {
        if (isOpen) {
          const panel = this.panel()?.nativeElement;
          if (!panel) return;
          const activeElement = panel.ownerDocument.activeElement;
          if (activeElement && 'focus' in activeElement) {
            this.returnFocusTo = activeElement as HTMLElement;
          }
          this.getFocusableElements(panel)[0]?.focus();
          if (!panel.contains(panel.ownerDocument.activeElement)) panel.focus();
        } else if (this.returnFocusTo) {
          this.returnFocusTo.focus();
          this.returnFocusTo = undefined;
        }
      },
      { injector: this.injector },
    );
  });

  protected close(reason: DrawerCloseReason, force = false): void {
    if (!this.dismissible() || this.loading()) return;
    if (!force && this.guardUnsaved() && this.touched()) {
      this.confirmingDiscard.set(true);
      return;
    }
    this.confirmingDiscard.set(false);
    this.touched.set(false);
    this.open.set(false);
    this.closed.emit(reason);
  }

  /** Cierra el panel como si se pulsara la X: los botones «Cancelar» de los formularios usan esto. */
  requestClose(): void {
    this.close('button');
  }

  protected discardAndClose(): void {
    this.close('button', true);
  }

  protected keepEditing(): void {
    this.confirmingDiscard.set(false);
  }

  /** Cualquier cambio dentro de un `<form>` del panel cuenta como «con cambios sin guardar». */
  protected markTouched(event: Event): void {
    if ((event.target as Element | null)?.closest('form')) this.touched.set(true);
  }

  protected handleBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close('backdrop');
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
      if (this.confirmingDiscard()) {
        this.keepEditing();
        return;
      }
      this.close('escape');
      return;
    }
    if (event.key !== 'Tab') return;

    const panel = this.panel()?.nativeElement;
    if (!panel) return;
    const focusable = this.getFocusableElements(panel);
    if (focusable.length === 0) {
      event.preventDefault();
      panel.focus();
      return;
    }

    const activeElement = panel.ownerDocument.activeElement;
    const first = focusable[0];
    const last = focusable.at(-1) ?? first;
    if (event.shiftKey && (activeElement === first || !panel.contains(activeElement))) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  private getFocusableElements(panel: HTMLElement): HTMLElement[] {
    const selector =
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
    return Array.from(panel.querySelectorAll<HTMLElement>(selector)).filter(
      (el) => !el.hasAttribute('aria-hidden'),
    );
  }
}
