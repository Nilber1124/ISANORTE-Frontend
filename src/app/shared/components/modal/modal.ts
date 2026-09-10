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

export type ModalSize = 'small' | 'medium' | 'large';
export type ModalCloseReason = 'button' | 'backdrop' | 'escape';

@Component({
  selector: 'app-modal',
  imports: [Loading],
  templateUrl: './modal.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Modal {
  readonly modalId = input.required<string>();
  readonly title = input.required<string>();
  readonly description = input<string | undefined>();
  readonly size = input<ModalSize>('medium');
  readonly open = model(false);
  readonly dismissible = input(true, { transform: booleanAttribute });
  readonly closeOnBackdrop = input(true, { transform: booleanAttribute });
  readonly closeOnEscape = input(true, { transform: booleanAttribute });
  readonly loading = input(false, { transform: booleanAttribute });
  readonly showFooter = input(true, { transform: booleanAttribute });

  readonly closed = output<ModalCloseReason>();

  private readonly injector = inject(Injector);
  private readonly panel = viewChild<ElementRef<HTMLElement>>('modalPanel');
  private returnFocusTo?: HTMLElement;

  protected readonly titleId = computed(() => `${this.modalId()}-title`);
  protected readonly descriptionId = computed(() => `${this.modalId()}-description`);
  protected readonly panelClasses = computed(() => {
    const sizes: Record<ModalSize, string> = {
      small: 'max-w-lg',
      medium: 'max-w-2xl',
      large: 'max-w-4xl',
    };
    return `relative flex max-h-[calc(100dvh-2rem)] w-full flex-col overflow-hidden rounded-panel border border-border-strong bg-surface-elevated shadow-floating ${sizes[this.size()]}`;
  });

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

  protected close(reason: ModalCloseReason): void {
    if (!this.dismissible() || this.loading()) return;
    this.open.set(false);
    this.closed.emit(reason);
  }

  protected handleBackdrop(event: MouseEvent): void {
    if (event.target === event.currentTarget && this.closeOnBackdrop()) this.close('backdrop');
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape' && this.closeOnEscape()) {
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
      (element) => !element.hasAttribute('aria-hidden'),
    );
  }
}
