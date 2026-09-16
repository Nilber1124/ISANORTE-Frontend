import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  inject,
  input,
  viewChildren,
} from '@angular/core';

/** Escena de un recorrido: una imagen que representa un ambiente de la vivienda. */
export interface CinematicScene {
  id: string;
  imageUrl: string;
}

/**
 * Recorrido cinematográfico arquitectónico construido con GSAP y capas HTML/CSS.
 *
 * Simula una cámara que recorre los distintos ambientes de una vivienda:
 * cada escena hace un zoom lento con deriva horizontal/vertical y una rotación
 * 3D muy sutil (profundidad de perspectiva), y entre escenas se ejecuta una
 * transición fluida en fundido con un ligero desenfoque, de modo que una
 * escena entra mientras la anterior termina su movimiento.
 *
 * - Reutilizable y desacoplada del Hero: recibe una lista dinámica de
 *   `CinematicScene[]` (imagenUrl) que podrá venir del backend.
 * - GSAP se carga diferido y se ejecuta solo en el navegador
 *   (`afterNextRender`), seguro con SSR/prerender e hidratación.
 * - Escritorio: movimiento de cámara completo y parallax sutil con el ratón
 *   (solo `hover` + `pointer: fine`). Móvil/tablet: sin parallax y con
 *   intensidad reducida.
 * - `prefers-reduced-motion`: se muestra una escena estática, Hero funcional.
 * - Todas las animaciones se crean dentro de `gsap.context()` y se revierten
 *   con `ctx.revert()`, eliminando listeners al destruir el componente.
 *
 * Uso:
 * `@for`/`<app-cinematic-tour [scenes]="escenas" />` dentro de un contenedor
 * `relative overflow-hidden`.
 * Opciones: `sceneDuration` (ms por escena), `crossFade` (ms del fundido),
 * `intensity` (0..1.5), `parallax` (activa/desactiva el parallax de ratón).
 */
@Component({
  selector: 'app-cinematic-tour',
  imports: [],
  templateUrl: './cinematic-tour.html',
  styleUrl: './cinematic-tour.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CinematicTour {
  readonly scenes = input<readonly CinematicScene[]>([]);
  readonly sceneDuration = input(6000);
  readonly crossFade = input(1400);
  readonly intensity = input(1);
  readonly parallax = input(true);

  private readonly host = inject(ElementRef<HTMLElement>);
  private readonly destroyRef = inject(DestroyRef);
  private readonly layerRefs = viewChildren<ElementRef<HTMLElement>>('layer');
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
    const layers = this.layerRefs().map((layer) => layer.nativeElement);
    if (this.destroyed || layers.length === 0) return;

    // Accesibilidad: sin movimientos 3D, imagen estática (la primera escena).
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const count = layers.length;
      const isDesktop = window.matchMedia('(min-width: 768px)').matches;
      // Móvil/tablet: intensidad reducida.
      const k = isDesktop ? this.intensity() : this.intensity() * 0.6;

      const sceneDur = this.sceneDuration() / 1000;
      const fade = this.crossFade() / 1000;
      const blurIn = 6;

      const startScale = 1.05 * k;
      const endScale = 1.16 * k;
      const exitScale = 1.2 * k;

      // Movimiento de cámara alternado para dar variedad entre ambientes.
      const move = (i: number) => {
        const right = i % 2 === 0;
        return {
          x0: (right ? -1.6 : 1.6) * k,
          y0: (right ? 1.4 : -1.4) * k,
          rx0: (right ? -0.8 : 0.8) * k,
          ry0: (right ? 1.0 : -1.0) * k,
          x1: (right ? 1.8 : -1.8) * k,
          y1: (right ? -1.6 : 1.6) * k,
          rx1: (right ? 1.0 : -1.0) * k,
          ry1: (right ? -1.2 : 1.2) * k,
        };
      };

      gsap.set(layers, { transformPerspective: 900 });

      const tl = gsap.timeline({ repeat: -1 });

      for (let i = 0; i < count; i++) {
        const layer = layers[i];
        const next = layers[(i + 1) % count];
        const m = move(i);
        const mn = move((i + 1) % count);
        const base = i * sceneDur;
        const exit = base + sceneDur - fade;

        // Avance de cámara durante toda la escena.
        tl.fromTo(
          layer,
          { scale: startScale, xPercent: m.x0, yPercent: m.y0, rotationX: m.rx0, rotationY: m.ry0 },
          { scale: endScale, xPercent: m.x1, yPercent: m.y1, rotationX: m.rx1, rotationY: m.ry1, duration: sceneDur, ease: 'sine.inOut' },
          base,
        );

        // Pequeño zoom adicional de cámara justo antes de terminar la escena.
        tl.to(layer, { scale: exitScale, duration: 0.9, ease: 'power1.in' }, base + sceneDur - 1.5);

        // Transición: ligero desenfoque y fundido de salida.
        tl.to(layer, { filter: `blur(${blurIn}px)`, duration: 0.7, ease: 'power1.in' }, base + sceneDur - 1.4);
        tl.to(layer, { opacity: 0, duration: fade, ease: 'power1.inOut' }, exit);

        // La siguiente escena entra durante el fundido, ya en movimiento.
        tl.set(next, { opacity: 0, filter: `blur(${blurIn}px)`, scale: startScale, xPercent: mn.x0, yPercent: mn.y0, rotationX: mn.rx0, rotationY: mn.ry0 }, exit);
        tl.to(next, { opacity: 1, duration: fade, ease: 'power1.inOut' }, exit);
        tl.to(next, { filter: 'blur(0px)', duration: fade, ease: 'power1.inOut' }, exit);
      }

      // Parallax de cámara con el ratón (solo escritorio con puntero fino).
      const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
      const stage = hostEl.parentElement;
      if (!this.parallax() || !canHover || !stage) return;

      const onPointerMove = (event: PointerEvent): void => {
        const rect = stage.getBoundingClientRect();
        const nx = (event.clientX - rect.left) / rect.width - 0.5;
        const ny = (event.clientY - rect.top) / rect.height - 0.5;
        gsap.to(layers, {
          x: nx * 26 * k,
          y: ny * 18 * k,
          duration: 0.9,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      };

      const onPointerLeave = (): void => {
        gsap.to(layers, { x: 0, y: 0, duration: 1.4, ease: 'power2.out' });
      };

      stage.addEventListener('pointermove', onPointerMove, { passive: true });
      stage.addEventListener('pointerleave', onPointerLeave);

      this.destroyRef.onDestroy(() => {
        stage.removeEventListener('pointermove', onPointerMove);
        stage.removeEventListener('pointerleave', onPointerLeave);
      });
    }, hostEl);

    this.destroyRef.onDestroy(() => {
      ctx.revert();
      gsap.killTweensOf(layers);
    });
  }
}