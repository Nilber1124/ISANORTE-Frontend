import { Directive, ElementRef, inject } from '@angular/core';

const DURATION_MS = 280;
const EASING = 'cubic-bezier(0.22, 1, 0.36, 1)';

/**
 * Abre y cierra un `<details>` con una transición de altura (el elemento nativo salta de golpe).
 * Mantiene el comportamiento nativo del teclado y los lectores de pantalla: solo anima el cambio.
 * Con «reducir movimiento» alterna sin animación.
 */
@Directive({
  selector: 'details[appSmoothDetails]',
  host: { '(click)': 'onClick($event)' },
})
export class SmoothDetails {
  private readonly details = inject<ElementRef<HTMLDetailsElement>>(ElementRef).nativeElement;
  private animation: Animation | null = null;

  protected onClick(event: Event): void {
    const summary = this.details.querySelector('summary');
    if (!summary || !(event.target instanceof Node) || !summary.contains(event.target)) return;
    event.preventDefault();

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce || typeof this.details.animate !== 'function') {
      this.details.open = !this.details.open;
      return;
    }
    if (this.details.open && !this.isClosing()) this.close(summary);
    else this.open();
  }

  private isClosing(): boolean {
    return this.details.dataset['closing'] === 'true';
  }

  private open(): void {
    this.animation?.cancel();
    delete this.details.dataset['closing'];
    const from = this.details.offsetHeight;
    this.details.open = true;
    const to = this.details.offsetHeight;
    this.run(from, to, () => (this.details.open = true));
  }

  private close(summary: HTMLElement): void {
    this.animation?.cancel();
    this.details.dataset['closing'] = 'true';
    const from = this.details.offsetHeight;
    const to = summary.offsetHeight + this.chromeY();
    this.run(from, to, () => {
      this.details.open = false;
      delete this.details.dataset['closing'];
    });
  }

  /** Relleno y borde verticales del `<details>`: lo que mide cerrado además del resumen. */
  private chromeY(): number {
    const style = getComputedStyle(this.details);
    return (
      parseFloat(style.paddingTop) +
      parseFloat(style.paddingBottom) +
      parseFloat(style.borderTopWidth) +
      parseFloat(style.borderBottomWidth)
    );
  }

  private run(from: number, to: number, done: () => void): void {
    this.details.style.overflow = 'hidden';
    const animation = this.details.animate(
      { height: [`${from}px`, `${to}px`] },
      { duration: DURATION_MS, easing: EASING },
    );
    this.animation = animation;
    animation.onfinish = () => {
      done();
      this.details.style.overflow = '';
      this.animation = null;
    };
    animation.oncancel = () => {
      this.details.style.overflow = '';
    };
  }
}
