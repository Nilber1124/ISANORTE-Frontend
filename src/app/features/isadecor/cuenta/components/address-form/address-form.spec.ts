import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressResponse } from '../../../../../data/models/address/address.model';
import { AddressForm, AddressFormValue } from './address-form';

const existing: AddressResponse = {
  id: 'addr-1',
  alias: 'Casa',
  calle: 'Av. Siempre Viva 123',
  distrito: 'Miraflores',
  ciudad: 'Lima',
  referencia: 'Portón azul',
  telefonoContacto: '987654321',
  principal: true,
};

describe('AddressForm', () => {
  let fixture: ComponentFixture<AddressForm>;

  async function create(initialValue: AddressResponse | null = null): Promise<void> {
    await TestBed.configureTestingModule({ imports: [AddressForm] }).compileComponents();
    fixture = TestBed.createComponent(AddressForm);
    fixture.componentRef.setInput('initialValue', initialValue);
    fixture.detectChanges();
  }

  it('starts with empty fields when creating a new address', async () => {
    await create();
    const component = fixture.componentInstance;
    expect(component.calle()).toBe('');
    expect(component.principal()).toBe(false);
  });

  it('prefills the fields from the given address when editing', async () => {
    await create(existing);
    const component = fixture.componentInstance;
    expect(component.alias()).toBe('Casa');
    expect(component.calle()).toBe(existing.calle);
    expect(component.distrito()).toBe(existing.distrito);
    expect(component.ciudad()).toBe(existing.ciudad);
    expect(component.referencia()).toBe(existing.referencia);
    expect(component.telefonoContacto()).toBe(existing.telefonoContacto);
    expect(component.principal()).toBe(true);
  });

  it('requires calle, distrito, ciudad and telefonoContacto', async () => {
    await create();
    const component = fixture.componentInstance as unknown as { submit(event: Event): void } & AddressForm;
    component.submit(new Event('submit'));
    expect(component.fieldErrors().calle).toBeTruthy();
    expect(component.fieldErrors().distrito).toBeTruthy();
    expect(component.fieldErrors().ciudad).toBeTruthy();
    expect(component.fieldErrors().telefonoContacto).toBeTruthy();
  });

  it('emits the trimmed form value on a valid submit', async () => {
    await create();
    const component = fixture.componentInstance as unknown as { submit(event: Event): void } & AddressForm;
    const emitted: AddressFormValue[] = [];
    component.saved.subscribe((value) => emitted.push(value));

    component.calle.set(' Calle Nueva 1 ');
    component.distrito.set(' Surco ');
    component.ciudad.set(' Lima ');
    component.telefonoContacto.set(' 999999999 ');
    component.submit(new Event('submit'));

    expect(emitted).toEqual([
      {
        alias: null,
        calle: 'Calle Nueva 1',
        distrito: 'Surco',
        ciudad: 'Lima',
        referencia: null,
        telefonoContacto: '999999999',
        principal: false,
      },
    ]);
  });

  it('emits canceled when the cancel button is used', async () => {
    await create();
    const component = fixture.componentInstance;
    let canceled = false;
    component.canceled.subscribe(() => (canceled = true));

    (fixture.nativeElement as HTMLElement)
      .querySelectorAll('button')
      .forEach((button) => {
        if (button.type === 'button' && button.textContent?.includes('Cancelar')) button.click();
      });

    expect(canceled).toBe(true);
  });
});
