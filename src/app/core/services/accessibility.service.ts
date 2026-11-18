import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, computed, effect, inject, signal } from '@angular/core';

import { AppTheme, ThemeService } from './theme.service';

/** Clave versionada de las preferencias de accesibilidad en `localStorage`. */
export const ACCESSIBILITY_STORAGE_KEY = 'isanorte:a11y:v1';

/** Pasos de tamaño de texto (porcentaje del `font-size` raíz). */
export const TEXT_SCALES = [100, 115, 130, 150] as const;
export type TextLevel = 0 | 1 | 2 | 3;

const MAX_TEXT_LEVEL: TextLevel = 3;

/** Preferencias que se guardan. El tema claro/oscuro sigue perteneciendo a `ThemeService`. */
interface StoredPreferences {
  theme?: AppTheme;
  highContrast?: boolean;
  textLevel?: TextLevel;
  reduceMotion?: boolean;
  highlightLinks?: boolean;
}

/** Preferencias del sistema operativo, usadas como valores iniciales y al restablecer. */
interface SystemPreferences {
  theme: AppTheme;
  highContrast: boolean;
  reduceMotion: boolean;
}

/**
 * Preferencias de accesibilidad de la persona usuaria: modo oscuro, alto contraste, tamaño de
 * texto, reducción de animaciones y resaltado de enlaces.
 *
 * - El modo oscuro delega en {@link ThemeService}: es la única fuente de verdad del tema.
 * - El estado se refleja como atributos `data-*` en `<html>` (`data-contrast`, `data-text-size`,
 *   `data-motion`, `data-links`); los estilos viven en `src/styles/accessibility.css`.
 * - Valores iniciales: lo guardado y, si no hay nada guardado, `prefers-color-scheme`,
 *   `prefers-contrast` y `prefers-reduced-motion`. Solo se guarda cuando la persona cambia algo.
 * - Seguro con SSR/prerender: en el servidor no toca `window`, `localStorage` ni el DOM.
 *
 * El script de `index.html` aplica los mismos atributos antes del primer pintado para evitar
 * parpadeos; debe mantenerse alineado con la clave y los campos de este servicio.
 */
@Injectable({ providedIn: 'root' })
export class AccessibilityService {
  private readonly document = inject(DOCUMENT);
  private readonly browser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly themeService = inject(ThemeService);

  private systemDefaults: SystemPreferences = { theme: 'light', highContrast: false, reduceMotion: false };
  private lastTheme: AppTheme = this.themeService.theme();

  private readonly _highContrast = signal(false);
  private readonly _textLevel = signal<TextLevel>(0);
  private readonly _reduceMotion = signal(false);
  private readonly _highlightLinks = signal(false);

  readonly darkMode = computed(() => this.themeService.theme() === 'dark');
  readonly highContrast = this._highContrast.asReadonly();
  readonly textLevel = this._textLevel.asReadonly();
  readonly reduceMotion = this._reduceMotion.asReadonly();
  readonly highlightLinks = this._highlightLinks.asReadonly();

  /** Porcentaje de texto actual (100, 115, 130 o 150). */
  readonly textScale = computed(() => TEXT_SCALES[this._textLevel()]);
  readonly canIncreaseText = computed(() => this._textLevel() < MAX_TEXT_LEVEL);
  readonly canDecreaseText = computed(() => this._textLevel() > 0);

  /** Verdadero si alguna opción difiere de lo que daría el sistema por defecto. */
  readonly isCustomized = computed(
    () =>
      this.darkMode() !== (this.systemDefaults.theme === 'dark') ||
      this._highContrast() !== this.systemDefaults.highContrast ||
      this._reduceMotion() !== this.systemDefaults.reduceMotion ||
      this._textLevel() !== 0 ||
      this._highlightLinks(),
  );

  /** Mensaje para la región `aria-live` del panel. */
  readonly announcement = signal('');

  constructor() {
    if (!this.browser) return;

    this.systemDefaults = this.readSystemPreferences();
    const stored = this.readStored();

    const theme = stored.theme ?? this.systemDefaults.theme;
    this.lastTheme = theme;
    this.themeService.setTheme(theme);
    this._highContrast.set(stored.highContrast ?? this.systemDefaults.highContrast);
    this._reduceMotion.set(stored.reduceMotion ?? this.systemDefaults.reduceMotion);
    this._textLevel.set(stored.textLevel ?? 0);
    this._highlightLinks.set(stored.highlightLinks ?? false);
    this.applyAttributes();

    // Refleja los cambios en <html>.
    effect(() => {
      this._highContrast();
      this._reduceMotion();
      this._textLevel();
      this._highlightLinks();
      this.applyAttributes();
    });

    // El tema también puede cambiarse desde fuera (p. ej. el botón del panel de administración):
    // se guarda igual, pero no se persiste el valor inicial ni al restablecer.
    effect(() => {
      const theme = this.themeService.theme();
      if (theme === this.lastTheme) return;
      this.lastTheme = theme;
      this.persist();
    });
  }

  setDarkMode(enabled: boolean): void {
    this.themeService.setTheme(enabled ? 'dark' : 'light');
    this.announce(enabled ? 'Modo oscuro activado' : 'Modo claro activado');
  }

  toggleDarkMode(): void {
    this.setDarkMode(!this.darkMode());
  }

  setHighContrast(enabled: boolean): void {
    this._highContrast.set(enabled);
    this.persist();
    this.announce(enabled ? 'Alto contraste activado' : 'Alto contraste desactivado');
  }

  setTextLevel(level: number): void {
    const next = Math.min(MAX_TEXT_LEVEL, Math.max(0, Math.round(level))) as TextLevel;
    this._textLevel.set(next);
    this.persist();
    this.announce(`Tamaño del texto: ${TEXT_SCALES[next]} %`);
  }

  increaseText(): void {
    this.setTextLevel(this._textLevel() + 1);
  }

  decreaseText(): void {
    this.setTextLevel(this._textLevel() - 1);
  }

  setReduceMotion(enabled: boolean): void {
    this._reduceMotion.set(enabled);
    this.persist();
    this.announce(enabled ? 'Animaciones reducidas' : 'Animaciones activadas');
  }

  setHighlightLinks(enabled: boolean): void {
    this._highlightLinks.set(enabled);
    this.persist();
    this.announce(enabled ? 'Enlaces resaltados' : 'Resaltado de enlaces desactivado');
  }

  /** Vuelve a los valores que daría el sistema y borra lo guardado. */
  reset(): void {
    this.lastTheme = this.systemDefaults.theme;
    this.themeService.setTheme(this.systemDefaults.theme);
    this._highContrast.set(this.systemDefaults.highContrast);
    this._reduceMotion.set(this.systemDefaults.reduceMotion);
    this._textLevel.set(0);
    this._highlightLinks.set(false);
    this.clearStored();
    this.announce('Preferencias de accesibilidad restablecidas');
  }

  private announce(message: string): void {
    this.announcement.set(message);
  }

  private applyAttributes(): void {
    const root = this.document.documentElement;
    this.setAttribute(root, 'data-contrast', this._highContrast() ? 'high' : null);
    this.setAttribute(root, 'data-text-size', String(this._textLevel()));
    this.setAttribute(root, 'data-motion', this._reduceMotion() ? 'reduce' : null);
    this.setAttribute(root, 'data-links', this._highlightLinks() ? 'highlight' : null);
  }

  private setAttribute(element: HTMLElement, name: string, value: string | null): void {
    if (value === null) element.removeAttribute(name);
    else element.setAttribute(name, value);
  }

  private readSystemPreferences(): SystemPreferences {
    const matches = (query: string): boolean => {
      const view = this.document.defaultView;
      return typeof view?.matchMedia === 'function' && view.matchMedia(query).matches;
    };
    return {
      theme: matches('(prefers-color-scheme: dark)') ? 'dark' : 'light',
      highContrast: matches('(prefers-contrast: more)'),
      reduceMotion: matches('(prefers-reduced-motion: reduce)'),
    };
  }

  private readStored(): StoredPreferences {
    try {
      const raw = this.document.defaultView?.localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
      if (!raw) return {};
      const data: unknown = JSON.parse(raw);
      if (typeof data !== 'object' || data === null) return {};
      const value = data as Record<string, unknown>;
      const level = value['textLevel'];
      return {
        theme: value['theme'] === 'dark' || value['theme'] === 'light' ? value['theme'] : undefined,
        highContrast: typeof value['highContrast'] === 'boolean' ? value['highContrast'] : undefined,
        reduceMotion: typeof value['reduceMotion'] === 'boolean' ? value['reduceMotion'] : undefined,
        highlightLinks: typeof value['highlightLinks'] === 'boolean' ? value['highlightLinks'] : undefined,
        textLevel:
          typeof level === 'number' && Number.isInteger(level) && level >= 0 && level <= MAX_TEXT_LEVEL
            ? (level as TextLevel)
            : undefined,
      };
    } catch {
      return {};
    }
  }

  private persist(): void {
    if (!this.browser) return;
    const preferences: StoredPreferences = {
      theme: this.themeService.theme(),
      highContrast: this._highContrast(),
      textLevel: this._textLevel(),
      reduceMotion: this._reduceMotion(),
      highlightLinks: this._highlightLinks(),
    };
    try {
      this.document.defaultView?.localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, JSON.stringify(preferences));
    } catch {
      // Almacenamiento no disponible (modo privado, cuota): las preferencias valen solo en esta sesión.
    }
  }

  private clearStored(): void {
    try {
      this.document.defaultView?.localStorage.removeItem(ACCESSIBILITY_STORAGE_KEY);
    } catch {
      // Sin almacenamiento no hay nada que borrar.
    }
  }
}
