import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should render the design system heading', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain(
      'Ingeniería visual para construir el futuro.',
    );
  });

  it('should open and close the modal with the keyboard', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const trigger = Array.from(compiled.querySelectorAll('button')).find(
      (button) => button.textContent?.trim() === 'Abrir modal',
    );

    expect(trigger).toBeTruthy();
    trigger?.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const dialog = compiled.querySelector<HTMLElement>('[role="dialog"]');
    expect(dialog).toBeTruthy();
    expect(dialog?.getAttribute('aria-modal')).toBe('true');
    expect(dialog?.querySelector('footer')?.textContent).toContain('Cancelar');
    expect(dialog?.querySelector('footer')?.textContent).toContain('Continuar');

    dialog?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
    fixture.detectChanges();
    await fixture.whenStable();

    expect(compiled.querySelector('[role="dialog"]')).toBeNull();
  });

  it('should switch between light and dark themes', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    const themeButtons = Array.from(compiled.querySelectorAll('[aria-pressed]'));
    const lightButton = themeButtons.find((button) => button.textContent?.trim() === 'Light');
    const darkButton = themeButtons.find((button) => button.textContent?.trim() === 'Dark');

    expect(lightButton?.getAttribute('aria-pressed')).toBe('true');
    darkButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();

    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(darkButton?.getAttribute('aria-pressed')).toBe('true');

    lightButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    fixture.detectChanges();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');
  });
});
