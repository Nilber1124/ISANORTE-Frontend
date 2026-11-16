import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ACCESSIBILITY_STORAGE_KEY } from '../../../core/services/accessibility.service';
import { ThemeService } from '../../../core/services/theme.service';
import { AccessibilityWidget } from './accessibility-widget';

const HTML_ATTRIBUTES = ['data-contrast', 'data-text-size', 'data-motion', 'data-links'];

describe('AccessibilityWidget', () => {
  let fixture: ComponentFixture<AccessibilityWidget>;
  let element: HTMLElement;

  const root = document.documentElement;
  const trigger = (): HTMLButtonElement =>
    element.querySelector<HTMLButtonElement>('button[aria-controls="a11y-panel"]')!;
  const panel = (): HTMLElement | null => element.querySelector<HTMLElement>('#a11y-panel');
  const switches = (): HTMLButtonElement[] =>
    Array.from(element.querySelectorAll<HTMLButtonElement>('[role="switch"]'));
  const switchByName = (name: string): HTMLButtonElement =>
    switches().find((item) => item.textContent?.includes(name))!;
  const buttonByLabel = (label: string): HTMLButtonElement =>
    element.querySelector<HTMLButtonElement>(`button[aria-label="${label}"]`)!;
  const status = (): string => element.querySelector('[role="status"]')!.textContent!.trim();

  async function setup(placement?: 'floating' | 'inline'): Promise<void> {
    await TestBed.configureTestingModule({ imports: [AccessibilityWidget] }).compileComponents();
    fixture = TestBed.createComponent(AccessibilityWidget);
    if (placement) fixture.componentRef.setInput('placement', placement);
    element = fixture.nativeElement as HTMLElement;
    fixture.detectChanges();
  }

  async function open(): Promise<void> {
    trigger().click();
    fixture.detectChanges();
    await fixture.whenStable();
  }

  beforeEach(() => {
    localStorage.clear();
    root.setAttribute('data-theme', 'light');
    HTML_ATTRIBUTES.forEach((name) => root.removeAttribute(name));
  });

  afterEach(() => {
    localStorage.clear();
  });

  it('empieza cerrado, con un botón accesible y una región aria-live', async () => {
    await setup();

    expect(trigger().getAttribute('aria-label')).toBe('Opciones de accesibilidad');
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(panel()).toBeNull();
    expect(element.querySelector('[role="status"][aria-live="polite"]')).not.toBeNull();
  });

  it('abre un panel no modal con las cinco opciones y el botón de restablecer', async () => {
    await setup();
    await open();

    expect(trigger().getAttribute('aria-expanded')).toBe('true');
    expect(panel()?.getAttribute('role')).toBe('dialog');
    expect(panel()?.getAttribute('aria-modal')).toBe('false');
    expect(element.querySelector('#a11y-panel-title')?.textContent).toContain('Accesibilidad');
    expect(switches().map((item) => item.textContent?.replace(/\s+/g, ' ').trim())).toEqual([
      expect.stringContaining('Modo oscuro'),
      expect.stringContaining('Alto contraste'),
      expect.stringContaining('Reducir animaciones'),
      expect.stringContaining('Resaltar enlaces'),
    ]);
    expect(element.querySelector('[role="group"]')?.textContent).toContain('Tamaño del texto');
    expect(element.textContent).toContain('Restablecer todo');
    expect(document.activeElement).toBe(panel());
  });

  it('refleja el estado de cada interruptor con aria-checked y con texto visible', async () => {
    await setup();
    await open();

    expect(switches().every((item) => item.getAttribute('aria-checked') === 'false')).toBe(true);
    expect(switchByName('Alto contraste').textContent).toContain('Apagado');

    switchByName('Alto contraste').click();
    fixture.detectChanges();

    expect(switchByName('Alto contraste').getAttribute('aria-checked')).toBe('true');
    expect(switchByName('Alto contraste').textContent).toContain('Activado');
    expect(root.getAttribute('data-contrast')).toBe('high');
    expect(status()).toBe('Alto contraste activado');
  });

  it('cambia entre modo claro y oscuro con ThemeService', async () => {
    await setup();
    await open();
    const theme = TestBed.inject(ThemeService);

    switchByName('Modo oscuro').click();
    fixture.detectChanges();

    expect(theme.theme()).toBe('dark');
    expect(root.getAttribute('data-theme')).toBe('dark');
    expect(switchByName('Modo oscuro').getAttribute('aria-checked')).toBe('true');
  });

  it('reduce animaciones y resalta enlaces', async () => {
    await setup();
    await open();

    switchByName('Reducir animaciones').click();
    switchByName('Resaltar enlaces').click();
    fixture.detectChanges();

    expect(root.getAttribute('data-motion')).toBe('reduce');
    expect(root.getAttribute('data-links')).toBe('highlight');
    expect(JSON.parse(localStorage.getItem(ACCESSIBILITY_STORAGE_KEY)!)).toMatchObject({
      reduceMotion: true,
      highlightLinks: true,
    });
  });

  it('aumenta y reduce el texto con botones A− y A+ y bloquea los extremos', async () => {
    await setup();
    await open();
    const group = (): string => element.querySelector('[role="group"]')!.textContent!.replace(/\s+/g, ' ');

    expect(buttonByLabel('Reducir tamaño del texto').disabled).toBe(true);
    expect(group()).toContain('100 %');

    buttonByLabel('Aumentar tamaño del texto').click();
    fixture.detectChanges();
    expect(group()).toContain('115 %');
    expect(root.getAttribute('data-text-size')).toBe('1');
    expect(buttonByLabel('Reducir tamaño del texto').disabled).toBe(false);

    buttonByLabel('Aumentar tamaño del texto').click();
    buttonByLabel('Aumentar tamaño del texto').click();
    fixture.detectChanges();
    expect(group()).toContain('150 %');
    expect(buttonByLabel('Aumentar tamaño del texto').disabled).toBe(true);
    expect(status()).toBe('Tamaño del texto: 150 %');
  });

  it('se cierra con Escape y devuelve el foco al botón', async () => {
    await setup();
    await open();

    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();

    expect(panel()).toBeNull();
    expect(trigger().getAttribute('aria-expanded')).toBe('false');
    expect(document.activeElement).toBe(trigger());
  });

  it('se cierra con su botón de cerrar y devuelve el foco', async () => {
    await setup();
    await open();

    buttonByLabel('Cerrar opciones de accesibilidad').click();
    fixture.detectChanges();

    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(trigger());
  });

  it('se cierra al hacer clic fuera, pero no al hacer clic dentro', async () => {
    await setup();
    await open();

    panel()!.click();
    fixture.detectChanges();
    expect(panel()).not.toBeNull();

    document.body.click();
    fixture.detectChanges();
    expect(panel()).toBeNull();
  });

  it('restablece todo y lo anuncia', async () => {
    await setup();
    await open();
    switchByName('Alto contraste').click();
    switchByName('Resaltar enlaces').click();
    buttonByLabel('Aumentar tamaño del texto').click();
    fixture.detectChanges();

    element.querySelector<HTMLButtonElement>('button.mt-4')!.click();
    fixture.detectChanges();

    expect(switches().every((item) => item.getAttribute('aria-checked') === 'false')).toBe(true);
    expect(root.hasAttribute('data-contrast')).toBe(false);
    expect(root.hasAttribute('data-links')).toBe(false);
    expect(root.getAttribute('data-text-size')).toBe('0');
    expect(localStorage.getItem(ACCESSIBILITY_STORAGE_KEY)).toBeNull();
    expect(status()).toBe('Preferencias de accesibilidad restablecidas');
  });

  it('en modo inline se integra en la barra (sin posición fija)', async () => {
    await setup('inline');

    const container = element.querySelector('[data-a11y-widget]')!;
    expect(container.className).toContain('relative');
    expect(container.className).not.toContain('fixed');
    await open();
    expect(panel()!.className).toContain('top-full');
  });

  it('en modo flotante queda fijo abajo a la izquierda, sin chocar con WhatsApp (derecha)', async () => {
    await setup();

    const container = element.querySelector('[data-a11y-widget]')!;
    expect(container.className).toContain('fixed');
    expect(container.className).toContain('left-');
    expect(container.className).not.toContain('right-');
  });
});
