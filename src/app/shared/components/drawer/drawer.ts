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
  output,
  viewChild,
} from '@angular/core';
import { Loading } from '../loading/loading';

export type DrawerCloseReason = 'button' | 'backdrop' | 'escape';

@Component({
  selector: 'app-drawer',
  imports: [Loading],
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

  readonly closed = output<DrawerCloseReason>();

  private readonly injector = inject(Injector);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('drawerPanel');
  private returnFocusTo?: HTMLElement;

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

  protected close(reason: DrawerCloseReason): void {
    if (!this.dismissible() || this.loading()) return;
    this.open.set(false);
    this.closed.emit(reason);
  }

  protected handleBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.close('backdrop');
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      event.preventDefault();
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
    const last = focusable[focusable.length - 1];
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
