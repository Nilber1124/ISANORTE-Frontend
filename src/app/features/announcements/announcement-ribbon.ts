import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  afterNextRender,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';

import {
  AnnouncementDestination,
  AnnouncementResponse,
} from '../../data/models/announcement/announcement.model';
import { Button } from '../../shared/components/button/button';
import { Modal } from '../../shared/components/modal/modal';
import { AnnouncementRibbonFacade } from './announcement-ribbon.facade';

@Component({
  selector: 'app-announcement-ribbon',
  imports: [Button, Modal],
  providers: [AnnouncementRibbonFacade],
  templateUrl: './announcement-ribbon.html',
  styleUrl: './announcement-ribbon.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AnnouncementRibbon {
  readonly destination = input.required<Exclude<AnnouncementDestination, 'AMBOS'>>();
  readonly facade = inject(AnnouncementRibbonFacade);

  readonly open = signal(false);
  readonly currentIndex = signal(0);
  readonly detail = signal<AnnouncementResponse | null>(null);
  readonly progressRunning = signal(false);
  readonly current = computed(() => this.facade.announcements()[this.currentIndex()] ?? null);

  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private timer?: ReturnType<typeof setTimeout>;
  private reducedMotion = false;
  private interacting = false;
  private touchStartX: number | null = null;
  private previousBodyOverflow = '';
  private pageScrollLocked = false;

  constructor() {
    afterNextRender(() => {
      this.reducedMotion =
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      this.facade.load(this.destination());
    });
    this.destroyRef.onDestroy(() => {
      this.stopAutoplay();
      this.unlockPageScroll();
    });
  }

  protected toggle(): void {
    this.open.update((value) => !value);
    if (this.open()) this.startAutoplay();
    else this.stopAutoplay();
  }

  protected close(): void {
    this.open.set(false);
    this.stopAutoplay();
  }

  protected previous(): void {
    this.goTo(this.currentIndex() - 1);
  }

  protected next(): void {
    this.goTo(this.currentIndex() + 1);
  }

  protected goTo(index: number): void {
    const total = this.facade.announcements().length;
    if (total === 0) return;
    this.currentIndex.set((index + total) % total);
    this.startAutoplay();
  }

  protected pause(): void {
    this.interacting = true;
    this.stopAutoplay();
  }

  protected resume(): void {
    this.interacting = false;
    this.startAutoplay();
  }

  protected handleFocusOut(event: FocusEvent): void {
    const panel = event.currentTarget as HTMLElement;
    const next = event.relatedTarget;
    if (!(next instanceof Node) || !panel.contains(next)) this.resume();
  }

  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key === 'Escape') {
      if (this.detail()) this.closeDetail();
      else if (this.open()) this.close();
    } else if (this.open() && event.key === 'ArrowLeft') {
      event.preventDefault();
      this.previous();
    } else if (this.open() && event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    }
  }

  protected handleTouchStart(event: TouchEvent): void {
    this.touchStartX = event.touches[0]?.clientX ?? null;
    this.pause();
  }

  protected handleTouchEnd(event: TouchEvent): void {
    if (this.touchStartX === null) return;
    const delta = (event.changedTouches[0]?.clientX ?? this.touchStartX) - this.touchStartX;
    if (Math.abs(delta) > 40) this.goTo(this.currentIndex() + (delta < 0 ? 1 : -1));
    this.touchStartX = null;
    this.resume();
  }

  protected openDetail(announcement: AnnouncementResponse): void {
    this.detail.set(announcement);
    this.stopAutoplay();
    this.lockPageScroll();
  }

  protected closeDetail(): void {
    this.detail.set(null);
    this.unlockPageScroll();
    this.startAutoplay();
  }

  protected async executeAction(announcement: AnnouncementResponse): Promise<void> {
    const target = announcement.destinoAccion.trim();
    if (announcement.tipoAccion === 'URL_EXTERNA') {
      const safeUrl = this.safeExternalUrl(target);
      if (safeUrl !== null) window.open(safeUrl, '_blank', 'noopener,noreferrer');
      return;
    }

    this.closeDetail();
    if (announcement.tipoAccion === 'SECCION') {
      if (target.startsWith('#')) {
        this.scrollToSection(target.slice(1));
        return;
      }
      if (!target.startsWith('/') || target.startsWith('//')) return;
      await this.router.navigateByUrl(target);
      const fragment = target.split('#', 2)[1];
      if (fragment) requestAnimationFrame(() => this.scrollToSection(fragment));
      return;
    }
    if (!target.startsWith('/') || target.startsWith('//')) return;
    await this.router.navigateByUrl(target);
  }

  protected validityText(announcement: AnnouncementResponse): string | null {
    if (!announcement.fechaInicio && !announcement.fechaFin) return null;
    const format = (value: string) =>
      new Intl.DateTimeFormat('es-PE', { dateStyle: 'medium' }).format(new Date(value));
    if (announcement.fechaInicio && announcement.fechaFin) {
      return `Vigente del ${format(announcement.fechaInicio)} al ${format(announcement.fechaFin)}`;
    }
    return announcement.fechaFin
      ? `Vigente hasta el ${format(announcement.fechaFin)}`
      : `Vigente desde el ${format(announcement.fechaInicio!)}`;
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    if (
      !this.open() ||
      this.interacting ||
      this.reducedMotion ||
      this.facade.announcements().length < 2
    )
      return;
    this.progressRunning.set(false);
    requestAnimationFrame(() => {
      this.progressRunning.set(true);
      this.timer = setTimeout(() => this.goTo(this.currentIndex() + 1), 5000);
    });
  }

  private stopAutoplay(): void {
    if (this.timer !== undefined) clearTimeout(this.timer);
    this.timer = undefined;
    this.progressRunning.set(false);
  }

  private safeExternalUrl(value: string): string | null {
    try {
      const url = new URL(value);
      return url.protocol === 'https:' || url.protocol === 'http:' ? url.toString() : null;
    } catch {
      return null;
    }
  }

  private scrollToSection(fragment: string): void {
    let id = fragment;
    try {
      id = decodeURIComponent(fragment);
    } catch {
      // Conserva el fragmento original si no tiene una codificación URL válida.
    }
    document
      .getElementById(id)
      ?.scrollIntoView({ behavior: this.reducedMotion ? 'auto' : 'smooth' });
  }

  private lockPageScroll(): void {
    if (this.pageScrollLocked) return;
    this.previousBodyOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    this.pageScrollLocked = true;
  }

  private unlockPageScroll(): void {
    if (typeof document === 'undefined' || !this.pageScrollLocked) return;
    document.body.style.overflow = this.previousBodyOverflow;
    this.pageScrollLocked = false;
  }
}
