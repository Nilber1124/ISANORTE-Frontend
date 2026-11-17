import {
  DestroyRef,
  Directive,
  ElementRef,
  PLATFORM_ID,
  afterNextRender,
  effect,
  inject,
  input,
  untracked,
} from '@angular/core';

import { AccessibilityService } from '../../../core/services/accessibility.service';
import { ChromaKeyRenderer } from './home-chroma-key';

type GsapModule = (typeof import('gsap'))['default'];
type GsapContext = ReturnType<GsapModule['context']>;

/**
 * Movimiento y estado de scroll del Home (solo navegador).
 *
 * - Riel de etapas: siempre activo (IntersectionObserver, sin animación) y marca
 *   `aria-current` en el enlace de la sección visible.
 * - Hero: el plano técnico se traza al cargar y sus capas se separan con el scroll.
 * - Proceso: el dibujo del plano se construye con el scroll (ScrollTrigger scrub)
 *   y cada tramo ilumina un paso del proceso.
 * - Revelados: `[data-rise]` entra una vez al aparecer.
 *
 * Con «Reducir animaciones» / `prefers-reduced-motion` no se crea ninguna
 * animación: el dibujo queda completo y todo el contenido visible. Los estados
 * iniciales ocultos los pone GSAP; sin JS (SSR, prerender) todo se ve final.
 */
@Directive({ selector: '[appHomeMotion]' })
export class HomeMotion {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly a11y = inject(AccessibilityService);
  private readonly isBrowser = inject(PLATFORM_ID) === 'browser';

  /**
   * Cambia cuando llega contenido que el movimiento debe conocer (pasos del proceso, tarjetas):
   * el movimiento se reinicia para volver a leer el DOM.
   */
  readonly motionKey = input('', { alias: 'homeMotionKey' });

  private ctx?: GsapContext;
  private observer?: IntersectionObserver;
  private started = false;
  private destroyed = false;
  private videoObserver?: IntersectionObserver;
  private video?: HTMLVideoElement;
  private videoDuration = 0;
  private videoTarget = 0;
  private videoLoop = 0;
  private resizeObserver?: ResizeObserver;
  private refreshTimer = 0;

  constructor() {
    this.destroyRef.onDestroy(() => {
      this.destroyed = true;
      this.stopMotion();
      this.observer?.disconnect();
      this.videoObserver?.disconnect();
      cancelAnimationFrame(this.videoLoop);
      this.resizeObserver?.disconnect();
      clearTimeout(this.refreshTimer);
    });

    effect(() => {
      const reduce = this.a11y.reduceMotion();
      this.motionKey();
      untracked(() => {
        if (!this.started || this.destroyed) return;
        if (reduce) {
          this.stopMotion();
          return;
        }
        this.stopMotion();
        void this.startMotion();
      });
    });

    afterNextRender(() => {
      if (!this.isBrowser) return;
      this.started = true;
      this.trackRail();
      if (this.motionBlocked()) this.showVideoPoster();
      else void this.startMotion();
    });
  }

  private motionBlocked(): boolean {
    // Sin `matchMedia` (entornos sin layout, como las pruebas) no hay movimiento posible.
    if (typeof window.matchMedia !== 'function') return true;
    return (
      this.a11y.reduceMotion() || window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  private trackRail(): void {
    const root = this.host.nativeElement;
    const links = Array.from(root.querySelectorAll<HTMLAnchorElement>('[data-rail-link]'));
    const sections = links
      .map((link) => root.querySelector<HTMLElement>(`#${link.dataset['railLink']}`))
      .filter((section): section is HTMLElement => section !== null);
    if (sections.length === 0 || typeof IntersectionObserver === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          for (const link of links) {
            if (link.dataset['railLink'] === entry.target.id)
              link.setAttribute('aria-current', 'true');
            else link.removeAttribute('aria-current');
          }
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    sections.forEach((section) => this.observer?.observe(section));
  }

  private processFigure(): HTMLElement | null {
    return this.host.nativeElement.querySelector<HTMLElement>('.plan-stage');
  }

  /** Sin movimiento: se muestra el póster (casa terminada) en lugar del video. */
  private showVideoPoster(): void {
    const figure = this.processFigure();
    if (figure) figure.dataset['videoState'] = 'poster';
  }

  /** Carga el video solo al acercarse a la sección y avisa cuando puede usarse. */
  private prepareVideo(): void {
    const root = this.host.nativeElement;
    const video = root.querySelector<HTMLVideoElement>('[data-process-video]');
    const figure = this.processFigure();
    const section = root.querySelector<HTMLElement>('[data-process]');
    if (!video || !figure || !section || this.video) return;

    const canvas = figure.querySelector<HTMLCanvasElement>('[data-process-canvas]');
    const load = (): void => {
      if (this.video || !canvas) return;
      const renderer = ChromaKeyRenderer.create(canvas);
      // Sin WebGL se mantiene el dibujo técnico de respaldo.
      if (!renderer) return;
      const sources = { lg: video.dataset['srcLg'], sm: video.dataset['srcSm'] };
      if (!sources.lg && !sources.sm) return;
      this.video = video;
      const small = window.matchMedia('(max-width: 767px)').matches;
      video.src = (small ? video.dataset['srcSm'] : video.dataset['srcLg']) ?? '';
      video.addEventListener('loadedmetadata', () => (this.videoDuration = video.duration), {
        once: true,
      });
      // El primer fotograma tras cargar puede salir en negro: se pide el fotograma inicial por
      // `seeked` y solo entonces se muestra el canvas.
      video.addEventListener(
        'loadeddata',
        () => {
          video.addEventListener(
            'seeked',
            () => {
              renderer.draw(video);
              figure.dataset['videoState'] = 'ready';
            },
            { once: true },
          );
          video.currentTime = this.videoTime(0);
          // Algunos navegadores móviles solo pintan fotogramas tras un primer play/pause.
          video
            .play()
            .then(() => video.pause())
            .catch(() => undefined);
        },
        { once: true },
      );
      video.addEventListener('seeked', () => renderer.draw(video));
      video.addEventListener('error', () => delete figure.dataset['videoState'], { once: true });
      video.load();
    };

    if (typeof IntersectionObserver === 'undefined') {
      load();
      return;
    }
    this.videoObserver = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          this.videoObserver?.disconnect();
          load();
        }
      },
      { rootMargin: '900px 0px' },
    );
    this.videoObserver.observe(section);
  }

  /**
   * Puntos de control (avance del scroll → segundo del video): inicio de cada paso: losa base,
   * planta baja, segundo piso, ventanales y fachada, casa terminada. Entre ellos se interpola de forma lineal.
   */
  private static readonly VIDEO_KEYS: readonly (readonly [number, number])[] = [
    [0, 0.3],
    [0.25, 2.6],
    [0.5, 4.8],
    [0.75, 6.9],
    [1, 7.85],
  ];

  private videoTime(progress: number): number {
    const keys = HomeMotion.VIDEO_KEYS;
    const p = Math.min(Math.max(progress, 0), 1);
    for (let i = 1; i < keys.length; i++) {
      const [p1, t1] = keys[i];
      if (p <= p1) {
        const [p0, t0] = keys[i - 1];
        return t0 + ((p - p0) / (p1 - p0)) * (t1 - t0);
      }
    }
    return keys[keys.length - 1][1];
  }

  /** Fija el segundo objetivo; un bucle suave lo persigue para que el avance no sea brusco. */
  private setVideoProgress(progress: number): void {
    if (!this.video || this.videoDuration <= 0) return;
    this.videoTarget = Math.min(this.videoTime(progress), this.videoDuration - 0.05);
    if (this.videoLoop) return;
    const step = (): void => {
      const video = this.video;
      if (!video || this.destroyed) {
        this.videoLoop = 0;
        return;
      }
      const diff = this.videoTarget - video.currentTime;
      if (Math.abs(diff) < 0.015) {
        this.videoLoop = 0;
        return;
      }
      video.currentTime += diff * 0.12;
      this.videoLoop = requestAnimationFrame(step);
    };
    this.videoLoop = requestAnimationFrame(step);
  }

  private stopMotion(): void {
    this.ctx?.revert();
    this.ctx = undefined;
    this.resizeObserver?.disconnect();
    this.resizeObserver = undefined;
    this.showVideoPoster();
    const root = this.host.nativeElement;
    root.querySelectorAll('[data-step-item]').forEach((item) => {
      item.classList.remove('is-active', 'is-dim');
      item.removeAttribute('aria-current');
    });
  }

  private async startMotion(): Promise<void> {
    if (this.ctx || this.destroyed) return;
    const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);
    if (this.ctx || this.destroyed || this.motionBlocked()) return;
    gsap.registerPlugin(ScrollTrigger);
    const figure = this.processFigure();
    if (figure && figure.dataset['videoState'] === 'poster') delete figure.dataset['videoState'];
    this.prepareVideo();
    if (figure && this.video && this.videoDuration > 0) figure.dataset['videoState'] = 'ready';

    const root = this.host.nativeElement;
    const desktop = window.matchMedia('(min-width: 768px)').matches;

    this.ctx = gsap.context(() => {
      // Hero: el plano se traza y las capas se separan con el scroll.
      const hero = root.querySelector<HTMLElement>('[data-home-hero]');
      if (hero) {
        const strokes = hero.querySelectorAll<SVGGeometryElement>('[data-hero-draw]');
        if (strokes.length > 0) {
          gsap.fromTo(
            strokes,
            { strokeDashoffset: 1 },
            { strokeDashoffset: 0, duration: 1.6, ease: 'power2.out', stagger: 0.08, delay: 0.3 },
          );
        }
        hero.querySelectorAll<HTMLElement>('[data-hero-layer]').forEach((layer) => {
          const speed = Number(layer.dataset['heroLayer']) || 0;
          gsap.to(layer, {
            yPercent: -speed * (desktop ? 40 : 18),
            ease: 'none',
            scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: 0.4 },
          });
        });
      }

      // Proceso: el plano se construye al avanzar; cada tramo ilumina un paso.
      const process = root.querySelector<HTMLElement>('[data-process]');
      const track = root.querySelector<HTMLElement>('[data-process-track]');
      if (process && track) {
        const steps = Array.from(process.querySelectorAll<HTMLElement>('[data-step-item]'));
        const count = Math.max(steps.length, 1);
        const tl = gsap.timeline({ defaults: { ease: 'none' } });
        process.querySelectorAll<SVGGeometryElement>('[data-draw]').forEach((el) => {
          const seg = Number(el.dataset['seg'] ?? 0);
          const at = Number(el.dataset['at'] ?? 0);
          tl.fromTo(el, { strokeDashoffset: 1 }, { strokeDashoffset: 0, duration: 0.55 }, seg + at);
        });
        process.querySelectorAll<SVGElement>('[data-fade]').forEach((el) => {
          const seg = Number(el.dataset['seg'] ?? 0);
          const at = Number(el.dataset['at'] ?? 0);
          tl.fromTo(el, { opacity: 0 }, { opacity: 1, duration: 0.4 }, seg + at);
        });
        process.querySelectorAll<SVGElement>('[data-grow]').forEach((el) => {
          const seg = Number(el.dataset['seg'] ?? 0);
          const at = Number(el.dataset['at'] ?? 0);
          tl.fromTo(el, { scaleY: 0 }, { scaleY: 1, duration: 0.6 }, seg + at);
        });
        tl.set({}, {}, count); // fija la duración total en `count` tramos

        const setActive = (progress: number): void => {
          const index = Math.min(count - 1, Math.max(0, Math.floor(progress * count)));
          steps.forEach((step, i) => {
            step.classList.toggle('is-active', i === index);
            step.classList.toggle('is-dim', i !== index);
            if (i === index) step.setAttribute('aria-current', 'step');
            else step.removeAttribute('aria-current');
          });
        };
        setActive(0);

        // El bloque queda fijo (sticky) mientras el contenedor se recorre; el avance va de 0 a 1.
        ScrollTrigger.create({
          trigger: track,
          start: 'top 64px',
          end: 'bottom bottom',
          scrub: 1,
          invalidateOnRefresh: true,
          animation: tl,
          onUpdate: (self) => {
            setActive(self.progress);
            this.setVideoProgress(self.progress);
          },
        });
      }

      // Revelados únicos.
      root.querySelectorAll<HTMLElement>('[data-rise]').forEach((el) => {
        gsap.from(el, {
          autoAlpha: 0,
          y: 24,
          duration: 0.7,
          ease: 'power2.out',
          delay: Number(el.dataset['rise']) || 0,
          scrollTrigger: { trigger: el, start: 'top 88%', once: true },
        });
      });
    }, root);

    // Las imágenes de secciones anteriores cargan después y desplazan el contenido: sin
    // recalcular, los puntos de inicio y fin del scroll quedan desfasados.
    if (typeof ResizeObserver !== 'undefined') {
      this.resizeObserver = new ResizeObserver(() => {
        clearTimeout(this.refreshTimer);
        this.refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
      });
      this.resizeObserver.observe(root);
    }
  }
}
