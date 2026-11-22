import { Component, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { SelectField, SelectOption } from './select-field';

@Component({
  imports: [SelectField],
  template: `<app-select-field inputId="s" label="Pago" [options]="options" [(value)]="value" />`,
})
class Host {
  readonly options: readonly SelectOption[] = [
    { value: 'EFECTIVO', label: 'Efectivo' },
    { value: 'TRANSFERENCIA', label: 'Transferencia' },
    { value: 'YAPE', label: 'Yape' },
  ];
  readonly value = signal('YAPE');
}

describe('SelectField', () => {
  it('shows the initial value even when it is not the first option', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;
    expect(select.value).toBe('YAPE');
    expect(select.selectedOptions[0].textContent?.trim()).toBe('Yape');
  });

  it('follows the value when it changes from outside and reports what the user picks', () => {
    const fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
    const select = fixture.nativeElement.querySelector('select') as HTMLSelectElement;

    fixture.componentInstance.value.set('TRANSFERENCIA');
    fixture.detectChanges();
    expect(select.value).toBe('TRANSFERENCIA');

    select.value = 'EFECTIVO';
    select.dispatchEvent(new Event('change'));
    expect(fixture.componentInstance.value()).toBe('EFECTIVO');
  });
});
