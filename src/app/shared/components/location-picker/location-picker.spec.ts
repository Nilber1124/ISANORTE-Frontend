import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { LocationPicker } from './location-picker';

@Component({
  imports: [LocationPicker],
  template: `<app-location-picker [(latitud)]="lat" [(longitud)]="lng" />`,
})
class Host {
  readonly lat = signal<number | null>(null);
  readonly lng = signal<number | null>(null);
}

describe('LocationPicker', () => {
  it('invites to click the map when there is no point yet', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();

    const text = (fixture.nativeElement as HTMLElement).textContent ?? '';
    expect(text).toContain('Haz clic en el mapa');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('shows the chosen point and clears it on request', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.lat.set(-7.1569);
    fixture.componentInstance.lng.set(-78.5148);
    fixture.detectChanges();

    const element = fixture.nativeElement as HTMLElement;
    expect(element.textContent).toContain('-7.156900, -78.514800');

    element.querySelector('button')?.click();
    fixture.detectChanges();

    expect(fixture.componentInstance.lat()).toBeNull();
    expect(fixture.componentInstance.lng()).toBeNull();
    expect(element.textContent).toContain('Haz clic en el mapa');
  });
});
