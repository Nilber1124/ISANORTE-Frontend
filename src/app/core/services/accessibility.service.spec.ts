import { PLATFORM_ID } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ACCESSIBILITY_STORAGE_KEY, AccessibilityService, TEXT_SCALES } from './accessibility.service';
import { ThemeService } from './theme.service';

const HTML_ATTRIBUTES = ['data-contrast', 'data-text-size', 'data-motion', 'data-links'];

/** Simula `window.matchMedia` devolviendo `true` solo para las consultas indicadas. */
function stubMatchMedia(matching: string[]): void {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    value: (query: string) => ({ matches: matching.includes(query), media: query }),
  });
}

function stored(): Record<string, unknown> | null {
  const raw = localStorage.getItem(ACCESSIBILITY_STORAGE_KEY);
  return raw ? (JSON.parse(raw) as Record<string, unknown>) : null;
}

function createService(platform: 'browser' | 'server' = 'browser'): AccessibilityService {
  TestBed.configureTestingModule({ providers: [{ provide: PLATFORM_ID, useValue: platform }] });
  return TestBed.inject(AccessibilityService);
}

describe('AccessibilityService', () => {
  const root = document.documentElement;

  beforeEach(() => {
    localStorage.clear();
    root.setAttribute('data-theme', 'light');
    HTML_ATTRIBUTES.forEach((name) => root.removeAttribute(name));
    stubMatchMedia([]);
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
    // `matchMedia` no existe en jsdom: se elimina el stub para no afectar a otras pruebas.
    Reflect.deleteProperty(window, 'matchMedia');
  });

  describe('valores iniciales', () => {
    it('usa tema claro y todo desactivado cuando no hay preferencias ni guardado', () => {
      const service = createService();

      expect(service.darkMode()).toBe(false);
      expect(service.highContrast()).toBe(false);
      expect(service.reduceMotion()).toBe(false);
      expect(service.highlightLinks()).toBe(false);
      expect(service.textLevel()).toBe(0);
      expect(service.textScale()).toBe(100);
      expect(service.isCustomized()).toBe(false);
      expect(root.getAttribute('data-text-size')).toBe('0');
      expect(root.hasAttribute('data-contrast')).toBe(false);
      expect(root.hasAttribute('data-motion')).toBe(false);
      expect(root.hasAttribute('data-links')).toBe(false);
    });

    it('toma las preferencias del sistema y no las guarda mientras la persona no cambie nada', () => {
      stubMatchMedia([
        '(prefers-color-scheme: dark)',
        '(prefers-contrast: more)',
        '(prefers-reduced-motion: reduce)',
      ]);

      const service = createService();

      expect(service.darkMode()).toBe(true);
      expect(service.highContrast()).toBe(true);
      expect(service.reduceMotion()).toBe(true);
      expect(root.getAttribute('data-theme')).toBe('dark');
      expect(root.getAttribute('data-contrast')).toBe('high');
      expect(root.getAttribute('data-motion')).toBe('reduce');
      expect(service.isCustomized()).toBe(false);
      expect(localStorage.getItem(ACCESSIBILITY_STORAGE_KEY)).toBeNull();
    });

    it('prioriza lo guardado sobre las preferencias del sistema', () => {
      stubMatchMedia(['(prefers-color-scheme: dark)', '(prefers-reduced-motion: reduce)']);
      localStorage.setItem(
        ACCESSIBILITY_STORAGE_KEY,
        JSON.stringify({ theme: 'light', reduceMotion: false, highContrast: true, textLevel: 2, highlightLinks: true }),
      );

      const service = createService();

      expect(service.darkMode()).toBe(false);
      expect(service.reduceMotion()).toBe(false);
      expect(service.highContrast()).toBe(true);
      expect(service.textLevel()).toBe(2);
      expect(service.textScale()).toBe(130);
      expect(service.highlightLinks()).toBe(true);
      expect(root.getAttribute('data-links')).toBe('highlight');
      expect(root.getAttribute('data-text-size')).toBe('2');
    });

    it('ignora un guardado dañado o con valores inválidos', () => {
      localStorage.setItem(ACCESSIBILITY_STORAGE_KEY, '{no es json');
      expect(createService().textLevel()).toBe(0);

      TestBed.resetTestingModule();
      localStorage.setItem(
        ACCESSIBILITY_STORAGE_KEY,
        JSON.stringify({ theme: 'azul', highContrast: 'sí', textLevel: 9, reduceMotion: 1, highlightLinks: null }),
      );
      const service = createService();

      expect(service.darkMode()).toBe(false);
      expect(service.highContrast()).toBe(false);
      expect(service.textLevel()).toBe(0);
      expect(service.reduceMotion()).toBe(false);
      expect(service.highlightLinks()).toBe(false);
    });
  });

  describe('opciones', () => {
    it('activa el alto contraste, lo aplica en <html> y lo guarda', () => {
      const service = createService();

      service.setHighContrast(true);
      TestBed.tick();

      expect(service.highContrast()).toBe(true);
      expect(root.getAttribute('data-contrast')).toBe('high');
      expect(stored()?.['highContrast']).toBe(true);
      expect(service.isCustomized()).toBe(true);

      service.setHighContrast(false);
      TestBed.tick();
      expect(root.hasAttribute('data-contrast')).toBe(false);
    });

    it('reduce las animaciones y resalta los enlaces', () => {
      const service = createService();

      service.setReduceMotion(true);
      service.setHighlightLinks(true);
      TestBed.tick();

      expect(root.getAttribute('data-motion')).toBe('reduce');
      expect(root.getAttribute('data-links')).toBe('highlight');
      expect(stored()).toMatchObject({ reduceMotion: true, highlightLinks: true });
    });

    it('cambia entre modo claro y oscuro a través de ThemeService y lo guarda', () => {
      const service = createService();
      const theme = TestBed.inject(ThemeService);

      service.setDarkMode(true);
      TestBed.tick();

      expect(theme.theme()).toBe('dark');
      expect(root.getAttribute('data-theme')).toBe('dark');
      expect(stored()?.['theme']).toBe('dark');

      service.toggleDarkMode();
      TestBed.tick();
      expect(theme.theme()).toBe('light');
      expect(stored()?.['theme']).toBe('light');
    });

    it('guarda el tema también cuando se cambia desde fuera (botón del panel de administración)', () => {
      const service = createService();
      const theme = TestBed.inject(ThemeService);
      TestBed.tick();

      theme.toggleTheme();
      TestBed.tick();

      expect(service.darkMode()).toBe(true);
      expect(stored()?.['theme']).toBe('dark');
    });

    it('recorre los cuatro pasos de texto y respeta los límites', () => {
      const service = createService();
      expect(service.canDecreaseText()).toBe(false);

      TEXT_SCALES.slice(1).forEach((scale, index) => {
        service.increaseText();
        expect(service.textLevel()).toBe(index + 1);
        expect(service.textScale()).toBe(scale);
      });
      expect(service.canIncreaseText()).toBe(false);

      service.increaseText();
      expect(service.textLevel()).toBe(3);
      TestBed.tick();
      expect(root.getAttribute('data-text-size')).toBe('3');

      service.setTextLevel(-4);
      expect(service.textLevel()).toBe(0);
      service.setTextLevel(99);
      expect(service.textLevel()).toBe(3);
      service.decreaseText();
      expect(service.textLevel()).toBe(2);
    });

    it('anuncia cada cambio para lectores de pantalla', () => {
      const service = createService();

      service.setHighContrast(true);
      expect(service.announcement()).toBe('Alto contraste activado');
      service.setTextLevel(1);
      expect(service.announcement()).toBe('Tamaño del texto: 115 %');
      service.setReduceMotion(false);
      expect(service.announcement()).toBe('Animaciones activadas');
    });
  });

  describe('restablecer', () => {
    it('vuelve a lo que daría el sistema, limpia <html> y borra lo guardado', () => {
      stubMatchMedia(['(prefers-color-scheme: dark)']);
      const service = createService();

      service.setDarkMode(false);
      service.setHighContrast(true);
      service.setTextLevel(3);
      service.setReduceMotion(true);
      service.setHighlightLinks(true);
      TestBed.tick();
      expect(stored()).not.toBeNull();

      service.reset();
      TestBed.tick();

      expect(service.darkMode()).toBe(true);
      expect(service.highContrast()).toBe(false);
      expect(service.textLevel()).toBe(0);
      expect(service.reduceMotion()).toBe(false);
      expect(service.highlightLinks()).toBe(false);
      expect(service.isCustomized()).toBe(false);
      expect(localStorage.getItem(ACCESSIBILITY_STORAGE_KEY)).toBeNull();
      expect(root.hasAttribute('data-contrast')).toBe(false);
      expect(root.hasAttribute('data-links')).toBe(false);
      expect(service.announcement()).toBe('Preferencias de accesibilidad restablecidas');
    });
  });

  describe('robustez', () => {
    it('no falla si el almacenamiento no está disponible', () => {
      vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
        throw new Error('SecurityError');
      });
      const service = createService();

      expect(() => service.setHighContrast(true)).not.toThrow();
      expect(service.highContrast()).toBe(true);
    });

    it('funciona sin matchMedia (entornos antiguos)', () => {
      Reflect.deleteProperty(window, 'matchMedia');

      expect(() => createService()).not.toThrow();
    });

    it('en el servidor no toca el DOM ni el almacenamiento', () => {
      const getItem = vi.spyOn(Storage.prototype, 'getItem');
      const setItem = vi.spyOn(Storage.prototype, 'setItem');

      const service = createService('server');
      service.setHighContrast(true);
      TestBed.tick();

      expect(getItem).not.toHaveBeenCalled();
      expect(setItem).not.toHaveBeenCalled();
      expect(root.hasAttribute('data-text-size')).toBe(false);
      expect(root.hasAttribute('data-contrast')).toBe(false);
    });
  });
});
