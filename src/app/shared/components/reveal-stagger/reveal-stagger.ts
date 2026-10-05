import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
} from '@angular/core';

/** Cuándo disparar la secuencia de aparición. */
export type RevealStaggerTrigger = 'load' | 'view';

/**
 * Variante de entrada de cada elemento, controlada con el valor del atributo
 * `data-reveal` (`data-reveal="left"`, `data-reveal="slide-left"`, ...).
 */
export type RevealStaggerVariant =
  | 'up'
  | 'down'
  | 'left'
  | 'right'
  | 'fade'
  | 'scale'
  | 'slide-left'
  | 'slide-right';

/**
 * Orquesta la aparición escalonada de los elementos del consumidor.
 *
 * La plantilla propia de este componente es un simple `<ng-content>`: el
 * consumidor proyecta el contenido real y marca qué elementos quiere animar
 * con los atributos `data-reveal` (variante) y `data-reveal-order` (orden).
 * Este componente no conoce el contenido proyectado: solo toma todos los
 * `[data-reveal]` presentes, los ordena y los va mostrando en secuencia.
 *
 * Atributos opcionales por elemento (en el template del consumidor):
 * - `data-reveal="up|down|left|right|fade|scale|slide-left|slide-right"`
 *   define desde dónde entra el elemento (por defecto `up`).
 * - `data-reveal-order="1..n"` define la posición en la secuencia. Si falta,
 *   se respeta el orden de aparición en el DOM.
 * - `data-reveal-duration="1.2"` sobreescribe la duración global (segundos).
 * - `data-reveal-float` añade una flotación suave (yoyo) infinita después de
 *   la entrada, útil para imágenes decorativas.
 *
 * Entradas configurables: `stagger` (separación entre inicios, s), `duration`
 * (s por elemento), `ease`, `trigger` (`load` al montar / `view` al entrar en
 * el viewport), `distance` (px del desplazamiento base) y `startDelay` (s).
 *
 * - GSAP se carga diferido y se ejecuta solo en el navegador
 *   (`afterNextRender`), seguro con SSR/prerender e hidratación.
 * - `prefers-reduced-motion`: los elementos permanecen en su estado final y no
 *   se ejecuta ninguna animación (la regla `[data-reveal] { opacity: 0 }` solo
 *   aplica bajo `no-preference`).
 * - Las animaciones se crean dentro de `gsap.context()` y se revierten con
 *   `ctx.revert()` al destruir el componente.
 *
 * Uso:
 * `<app-reveal-stagger [stagger]="0.18" [trigger]="'view'"> ... </app-reveal-stagger>`
 */
@Component({
  selector: 'app-reveal-stagger',
  imports: [],
  templateUrl: './reveal-stagger.html',
  styleUrl: './reveal-stagger.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RevealStagger {
  /** Separación (en segundos) entre el inicio de cada elemento. */
  readonly stagger = input(0.15);
  /** Duración (en segundos) por defecto de cada aparición. */
  readonly duration = input(0.8);
  /** Easing de las apariciones (nombre GSAP o función de timing). */
  readonly ease = input('power2.out');
  /** Cuándo disparar la secuencia: al montar (`load`) o al entrar al viewport (`view`). */
  readonly trigger = input<RevealStaggerTrigger>('load');
  /** Desplazamiento inicial (px) de las variantes direccionales `up/down/left/right`. */
  readonly distance = input(28);
  /** Retraso opcional (segundos) antes de iniciar la secuencia. */
  readonly startDelay = input(0);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private destroyed = false;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
    });
    afterNextRender(() => {
      void this.init();
    });
  }

  private async init(): Promise<void> {
    const { default: gsap } = await import('gsap');
    const hostEl = this.host.nativeElement;

    // El componente pudo destruirse mientras se descargaba GSAP.
    if (this.destroyed) return;

    // Accesibilidad: sin animaciones, los [data-reveal] permanecen visibles
    // en su estado final (la regla de ocultado solo aplica con no-preference).
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {}, hostEl);

    // Revierte los tweens de la secuencia al destruir el componente, tanto en
    // la ruta `load` como en la `view` (antes de que esta haga `return`).
    this.destroyRef.onDestroy(() => {
      ctx.revert();
    });

    const start = (): void => {
      ctx.add(() => {
        const distance = this.distance();
        const duration = this.duration();
        const ease = this.ease();

        // Variantes de entrada: `from` (estado inicial) y `to` (estado final).
        // Todas comparten el fundido de opacidad; `opacity: 1` rehidrata el
        // valor final aunque el elemento viniera oculto por CSS.
        const direction = (axis: 'x' | 'y', sign: 1 | -1) => ({
          from: { [axis]: sign * distance } as Record<string, number>,
          to: { [axis]: 0 } as Record<string, number>,
        });

        const transitions: Record<RevealStaggerVariant, { from: Record<string, number>; to: Record<string, number> }> = {
          up: direction('y', 1),
          down: direction('y', -1),
          left: direction('x', -1),
          right: direction('x', 1),
          fade: { from: {}, to: {} },
          scale: { from: { scale: 0.96 }, to: { scale: 1 } },
          'slide-left': { from: { xPercent: -110 }, to: { xPercent: 0 } },
          'slide-right': { from: { xPercent: 110 }, to: { xPercent: 0 } },
        };

        // Recolecta y ordena los elementos a animar.
        const elementList = hostEl.querySelectorAll('[data-reveal]') as NodeListOf<HTMLElement>;
        const items = Array.from(elementList)
          .map((el, index) => ({
            el,
            index,
            order: this.readNumber(el.dataset['revealOrder'], index),
            variant: (el.dataset['reveal'] ?? 'up') as RevealStaggerVariant,
            duration: this.readNumber(el.dataset['revealDuration'], duration),
          }))
          .sort((a, b) => a.order - b.order || a.index - b.index);

        if (items.length === 0) return;

        const tl = gsap.timeline({
          defaults: { duration, ease },
          delay: this.startDelay(),
        });

        items.forEach((item, i) => {
          const { from, to } = transitions[item.variant] ?? transitions.up;
          tl.fromTo(
            item.el,
            { ...from, opacity: 0 },
            { ...to, opacity: 1, duration: item.duration },
            i * this.stagger(),
          );
        });

        // Flotación suave y continua (yoyo) para elementos decorativos.
        const floating = items.filter((item) => item.el.hasAttribute('data-reveal-float'));
        if (floating.length > 0) {
          tl.eventCallback('onComplete', () => {
            floating.forEach((item) => {
              gsap.to(item.el, { y: -10, duration: 3, ease: 'sine.inOut', yoyo: true, repeat: -1 });
            });
          });
        }
      });
    };

    // Solo se dispara cuando el bloque entra al viewport.
    if (this.trigger() === 'view' && typeof IntersectionObserver !== 'undefined') {
      const io = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) {
              io.disconnect();
              start();
              break;
            }
          }
        },
        { threshold: 0.25 },
      );
      io.observe(hostEl);
      this.destroyRef.onDestroy(() => io.disconnect());
      return;
    }

    start();
  }

  /** Lee `data-reveal-order`/`data-reveal-duration`; cae al fallback si no es un número finito. */
  private readNumber(value: string | undefined, fallback: number): number {
    if (value === undefined || value === '') return fallback;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
}
