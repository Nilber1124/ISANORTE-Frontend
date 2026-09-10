import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import {
  Injectable,
  PLATFORM_ID,
  Renderer2,
  RendererFactory2,
  inject,
  signal,
} from '@angular/core';

export type AppTheme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly renderer: Renderer2 = inject(RendererFactory2).createRenderer(null, null);
  private readonly currentTheme = signal<AppTheme>('light');

  readonly theme = this.currentTheme.asReadonly();

  constructor() {
    if (!isPlatformBrowser(this.platformId)) return;
    const initialTheme = this.document.documentElement.getAttribute('data-theme');
    this.currentTheme.set(initialTheme === 'dark' ? 'dark' : 'light');
  }

  setTheme(theme: AppTheme): void {
    this.currentTheme.set(theme);
    if (isPlatformBrowser(this.platformId)) {
      this.renderer.setAttribute(this.document.documentElement, 'data-theme', theme);
    }
  }

  useLightTheme(): void {
    this.setTheme('light');
  }

  useDarkTheme(): void {
    this.setTheme('dark');
  }

  toggleTheme(): void {
    this.setTheme(this.currentTheme() === 'light' ? 'dark' : 'light');
  }
}
