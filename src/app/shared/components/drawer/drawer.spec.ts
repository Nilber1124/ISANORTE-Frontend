import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { Drawer } from './drawer';

@Component({
  imports: [Drawer],
  template: `
    <app-drawer #drawer drawerId="t" title="Panel" [guardUnsaved]="guard()" (closed)="closes.set(closes() + 1)">
      <form><input id="campo" /></form>
      <div id="fuera"><input id="suelto" /></div>
      <button id="cancelar" type="button" (click)="drawer.requestClose()">Cancelar</button>
    </app-drawer>
  `,
})
class Host {
  readonly guard = signal(true);
  readonly closes = signal(0);
}

describe('Drawer', () => {
  function setup(guard = true) {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.guard.set(guard);
    (fixture.componentInstance as Host & { open?: boolean }).closes.set(0);
    fixture.detectChanges();
    // El drawer se abre con el modelo `open`.
    const drawer = fixture.debugElement.children[0].componentInstance as Drawer;
    drawer.open.set(true);
    fixture.detectChanges();
    return { fixture, host: fixture.componentInstance, el: fixture.nativeElement as HTMLElement };
  }
  const type = (el: HTMLElement, selector: string) => {
    const input = el.querySelector(selector) as HTMLInputElement;
    input.value = 'x';
    input.dispatchEvent(new Event('input', { bubbles: true }));
  };
  const clickClose = (el: HTMLElement) =>
    (el.querySelector('button[aria-label="Cerrar panel"]') as HTMLButtonElement).click();

  it('closes straight away when nothing was typed', () => {
    const { fixture, host, el } = setup();
    clickClose(el);
    fixture.detectChanges();
    expect(host.closes()).toBe(1);
    expect(el.textContent).not.toContain('¿Salir sin guardar?');
  });

  it('asks before closing after typing in a form, and keeps editing on "Seguir editando"', () => {
    const { fixture, host, el } = setup();
    type(el, '#campo');
    clickClose(el);
    fixture.detectChanges();
    expect(host.closes()).toBe(0);
    expect(el.textContent).toContain('¿Salir sin guardar?');

    (Array.from(el.querySelectorAll('button')).find((b) => /Seguir editando/.test(b.textContent ?? '')) as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.textContent).not.toContain('¿Salir sin guardar?');
    expect(host.closes()).toBe(0);
  });

  it('discards and closes on "Descartar cambios", also from the form Cancel button', () => {
    const { fixture, host, el } = setup();
    type(el, '#campo');
    (el.querySelector('#cancelar') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(el.textContent).toContain('¿Salir sin guardar?');
    (Array.from(el.querySelectorAll('button')).find((b) => /Descartar cambios/.test(b.textContent ?? '')) as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(host.closes()).toBe(1);
  });

  it('ignores typing outside a form and does nothing when the guard is off', () => {
    const outside = setup();
    type(outside.el, '#suelto');
    clickClose(outside.el);
    outside.fixture.detectChanges();
    expect(outside.host.closes()).toBe(1);

    const off = setup(false);
    type(off.el, '#campo');
    clickClose(off.el);
    off.fixture.detectChanges();
    expect(off.host.closes()).toBe(1);
  });
});
