import { NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  contentChild,
  DestroyRef,
  ElementRef,
  inject,
  input,
  signal,
  TemplateRef,
  viewChild,
  viewChildren,
} from '@angular/core';

type GsapType = typeof import('gsap')['default'];
type GsapTween = ReturnType<GsapType['to']>;

export type CarouselVariant = 'coverflow' | 'marquee';

/**
 * Contrato mínimo que debe cumplir cada ítem del carrusel.
 * El resto de propiedades pertenecen al contenido (ServiceCard, ProjectCard, etc.)
 * y se resuelven dentro de la plantilla de card que expone cada consumidor.
 */
export interface CarouselItem {
  id: string;
}

export interface CarouselCardContext {
  $implicit: CarouselItem;
  index: number;
  total: number;
}

/**
 * Carrusel reutilizable y desacoplado de cualquier modelo de datos.
 *
 * - `coverflow`: disposición 3D tipo Coverflow con la card central destacada.
 * - `marquee`: desplazamiento horizontal continuo e infinito.
 *
 * El contenedor recibe las cards mediante una plantilla de contenido
 * (`<ng-template #cardTemplate let-item>`), por lo que sirve para
 * servicios, proyectos, productos o cualquier contenido futuro del admin.
 *
 * GSAP se carga de forma diferida y solo se ejecuta en el navegador,
 * nunca durante SSR/prerender. Se respeta `prefers-reduced-motion`.
 */
@Component({
  selector: 'app-carousel',
  imports: [NgTemplateOutlet],
  templateUrl: './carousel.html',
  styleUrl: './carousel.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class Carousel {
  readonly items = input<readonly CarouselItem[]>([]);
  readonly variant = input<CarouselVariant>('coverflow');
  readonly autoPlayInterval = input(4000);
  readonly pauseOnHover = input(true);
  readonly ariaLabel = input('Carrusel de contenido');

  protected readonly cardTemplate = contentChild.required<TemplateRef<CarouselCardContext>>('cardTemplate');
  protected readonly marqueeCopies = [0, 1, 2, 3];

  private readonly cards = viewChildren<ElementRef<HTMLElement>>('card');
  private readonly track = viewChild<ElementRef<HTMLElement>>('track');

  private readonly current = signal(0);

  private gsap?: GsapType;
  private marqueeTween?: GsapTween;
  private timer?: ReturnType<typeof setInterval>;
  private reducedMotion = false;
  private canHover = true;
  private hovered = false;
  private dragging = false;
  private xStart = 0;
  private xEnd = 0;

  private readonly destroyRef = inject(DestroyRef);

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.stopAutoPlay();
      this.marqueeTween?.kill();
    });
    afterNextRender(() => {
      void this.init();
    });
  }

  private async init(): Promise<void> {
    const { default: gsap } = await import('gsap');
    this.gsap = gsap;
    this.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    this.canHover = window.matchMedia('(hover: hover)').matches;

    if (this.variant() === 'coverflow') {
      this.initCoverflow();
    } else {
      this.initMarquee();
    }
  }

  /* ------------------------------------------------------------------ *
   * Coverflow 3D
   * ------------------------------------------------------------------ */

  private initCoverflow(): void {
    this.arrange(false);
    if (!this.reducedMotion && this.autoPlayInterval() > 0 && this.cards().length > 1) {
      this.startAutoPlay();
    }
  }

  private startAutoPlay(): void {
    this.stopAutoPlay();
    if (this.reducedMotion || this.autoPlayInterval() <= 0 || this.cards().length < 2) return;
    this.timer = setInterval(() => this.advance(1), this.autoPlayInterval());
  }

  private stopAutoPlay(): void {
    if (this.timer !== undefined) {
      clearInterval(this.timer);
      this.timer = undefined;
    }
  }

  private advance(delta: number): void {
    const total = this.cards().length;
    if (total < 2) return;
    this.current.update((index) => (index + delta + total) % total);
    this.arrange(true);
  }

  private arrange(animated: boolean): void {
    const gsap = this.gsap;
    const elements = this.cards().map((ref) => ref.nativeElement);
    const total = elements.length;
    if (!gsap || total === 0) return;

    const current = this.current();
    elements.forEach((element, index) => {
      let offset = index - current;
      if (offset > total / 2) offset -= total;
      if (offset < -total / 2) offset += total;

      const distance = Math.min(1, Math.abs(offset));
      const target = {
        xPercent: offset * 50,
        rotationY: offset * 25,
        scale: 1 - distance * 0.18,
        opacity: 1 - distance * 0.35,
        zIndex: 100 - Math.abs(offset),
      };

      if (animated) {
        gsap.to(element, { ...target, duration: 0.8, ease: 'power2.out' });
      } else {
        gsap.set(element, target);
      }
    });
  }

  /* ------------------------------------------------------------------ *
   * Marquee infinito
   * ------------------------------------------------------------------ */

  private initMarquee(): void {
    const track = this.track()?.nativeElement;
    if (!track || !this.gsap || this.reducedMotion) return;

    this.marqueeTween = this.gsap.to(track, {
      xPercent: -100 / this.marqueeCopies.length,
      duration: Math.max(16, this.items().length * 6),
      ease: 'none',
      repeat: -1,
    });
  }

  /* ------------------------------------------------------------------ *
   * Interacción (pausa al hacer hover + arrastre en coverflow)
   * ------------------------------------------------------------------ */

  protected onMouseEnter(): void {
    if (!this.canHover || !this.pauseOnHover()) return;
    this.hovered = true;
    this.stopAutoPlay();
  }

  protected onMouseLeave(): void {
    this.endDrag();
    this.hovered = false;
    this.startAutoPlay();
  }

  protected onPointerDown(event: PointerEvent): void {
    this.dragging = true;
    this.xStart = event.clientX;
    this.xEnd = event.clientX;
    this.stopAutoPlay();
  }

  protected onPointerMove(event: PointerEvent): void {
    this.xEnd = event.clientX;
  }

  protected onPointerEnd(): void {
    this.endDrag();
    if (!this.hovered) this.startAutoPlay();
  }

  private endDrag(): void {
    if (!this.dragging) return;
    this.dragging = false;
    const delta = this.xEnd - this.xStart;
    if (delta < -40) this.advance(1);
    else if (delta > 40) this.advance(-1);
  }

  protected pauseMarquee(): void {
    if (this.pauseOnHover()) this.marqueeTween?.pause();
  }

  protected resumeMarquee(): void {
    if (this.pauseOnHover()) this.marqueeTween?.play();
  }
}