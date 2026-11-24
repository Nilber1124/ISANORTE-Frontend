import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';

import { AccessibilityService } from '../../../../core/services/accessibility.service';
import { Button } from '../../../../shared/components/button/button';
import { HomeHero, HomeScene } from '../isadecor-home.model';
import { HomeCategoryTile } from '../category-tile/category-tile';

/**
 * "Arma tu ambiente": un video fijo en pantalla que avanza con el scroll; cada paso muestra el
 * producto que se instala en ese momento. GSAP/ScrollTrigger se cargan solo en el navegador.
 * Sin JS o con movimiento reducido se muestra la sala terminada y los productos en cuadrícula.
 */
type ScrollTriggerInstance = ReturnType<typeof import('gsap/ScrollTrigger').ScrollTrigger.create>;

/** Fracción inicial del scroll en la que el hero se desvanece y el video aún no avanza. */
const HERO_FADE = 0.1;

@Component({
  selector: 'app-arma-ambiente',
  imports: [Button, HomeCategoryTile],
  templateUrl: './arma-ambiente.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ArmaAmbiente {
  readonly scene = input.required<HomeScene>();
  readonly hero = input.required<HomeHero>();
  /**
   * No se llama `search`: el `<input type="search">` dispara un evento nativo `search` que burbujea
   * hasta el host y el padre lo recibiría como si fuera esta salida (con un Event en vez del texto).
   */
  readonly searched = output<string>();

  private readonly a11y = inject(AccessibilityService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private trigger: ScrollTriggerInstance | null = null;
  private readonly video = viewChild<ElementRef<HTMLVideoElement>>('video');

  readonly animated = signal(false);
  readonly step = signal(0);
  /** Progreso del scroll (0 a 1) sobre toda la escena; el hero ocupa el primer tramo. */
  readonly progress = signal(0);
  readonly heroOpacity = computed(() => Math.max(0, 1 - this.progress() / HERO_FADE));
  readonly stepsOpacity = computed(() =>
    Math.min(1, Math.max(0, (this.progress() - HERO_FADE * 0.6) / (HERO_FADE * 0.8))),
  );
  readonly activeStep = computed(() => this.scene().pasos[this.step()]);

  constructor() {
    afterNextRender(() => void this.init());
  }

  /** Lleva el scroll al paso indicado (centro de su tramo). */
  goToStep(index: number): void {
    const trigger = this.trigger;
    if (!trigger) return;
    const count = this.scene().pasos.length;
    const progress = HERO_FADE + (1 - HERO_FADE) * ((index + 0.6) / count);
    window.scrollTo({
      top: trigger.start + (trigger.end - trigger.start) * progress,
      behavior: this.scrollBehavior(),
    });
  }

  goToStore(): void {
    document
      .getElementById('tienda')
      ?.scrollIntoView({ behavior: this.scrollBehavior(), block: 'start' });
  }

  private scrollBehavior(): ScrollBehavior {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth';
  }

  onSearch(event: Event, query: string): void {
    event.preventDefault();
    this.searched.emit(query);
  }

  private async init(): Promise<void> {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || this.a11y.reduceMotion())
      return;
    const [{ default: gsap }, { ScrollTrigger }] = await Promise.all([
      import('gsap'),
      import('gsap/ScrollTrigger'),
    ]);
    gsap.registerPlugin(ScrollTrigger);
    this.animated.set(true);
    // Espera a que Angular pinte la escena fija (el <video> solo existe en modo animado).
    let video = this.video()?.nativeElement;
    for (let i = 0; i < 20 && !video; i++) {
      await new Promise((resolve) => setTimeout(resolve, 16));
      video = this.video()?.nativeElement;
    }
    if (!video) {
      this.animated.set(false);
      return;
    }
    const stage = video;

    const pasos = this.scene().pasos;
    const times = [0, ...pasos.map((p) => p.tiempo)];
    const lightweight = window.matchMedia('(max-width: 767px)').matches;
    stage.src = lightweight ? this.scene().videoLigeroUrl : this.scene().videoUrl;
    stage.load();

    const proxy = { t: 0 };
    const vertical = window.matchMedia('(max-width: 767px)').matches;
    const foci = [{ x: 50, y: 50 }, ...pasos.map((p) => p.enfoque)];
    const ctx = gsap.context(() => {
      this.trigger = ScrollTrigger.create({
        trigger: this.host.nativeElement.querySelector('[data-stage-track]'),
        start: 'top top',
        end: 'bottom bottom',
        scrub: true,
        onUpdate: (self) => {
          this.progress.set(self.progress);
          const segments = times.length - 1;
          const pos = Math.max(0, (self.progress - HERO_FADE) / (1 - HERO_FADE)) * segments;
          const i = Math.min(Math.floor(pos), segments - 1);
          const t = times[i] + (times[i + 1] - times[i]) * (pos - i);
          this.step.set(Math.min(Math.floor(pos), pasos.length - 1));
          if (vertical) {
            const a = foci[i];
            const b = foci[i + 1];
            const k = Math.min(pos - i, 1);
            stage.style.objectPosition = `${a.x + (b.x - a.x) * k}% ${a.y + (b.y - a.y) * k}%`;
          }
          gsap.to(proxy, {
            t,
            duration: 0.25,
            ease: 'power1.out',
            overwrite: true,
            onUpdate: () => {
              if (stage.readyState >= 2) stage.currentTime = proxy.t;
            },
          });
        },
      });
    }, this.host.nativeElement);
    this.destroyRef.onDestroy(() => ctx.revert());
  }
}
