import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldEditor } from './field-editor';

describe('FieldEditor', () => {
  let fixture: ComponentFixture<FieldEditor>;
  let component: FieldEditor;
  const el = () => fixture.nativeElement as HTMLElement;
  const save = () =>
    Array.from(el().querySelectorAll('button')).find((b) => b.textContent?.trim() === 'Guardar') as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [FieldEditor] }).compileComponents();
    fixture = TestBed.createComponent(FieldEditor);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('heading', 'Servicios · Título');
    fixture.componentRef.setInput('label', 'Título');
    fixture.componentRef.setInput('value', 'Todo lo que necesitas\npara construir');
    fixture.componentRef.setInput('rows', 2);
    fixture.detectChanges();
  });

  it('shows only one field, with the saved value and its line break', () => {
    expect(el().querySelectorAll('textarea, input')).toHaveLength(1);
    expect((el().querySelector('textarea') as HTMLTextAreaElement).value).toBe('Todo lo que necesitas\npara construir');
    expect(save().disabled).toBe(true);
  });

  it('emits a live draft while typing and null when it matches the saved value again', () => {
    const drafts: (string | null)[] = [];
    component.draftChanged.subscribe((d) => drafts.push(d));
    const c = component as unknown as { text: { set(v: string): void } };
    fixture.detectChanges();
    c.text.set('Otro');
    fixture.detectChanges();
    expect(drafts.at(-1)).toBe('Otro');
    expect(save().disabled).toBe(false);
    c.text.set('Todo lo que necesitas\npara construir');
    fixture.detectChanges();
    expect(drafts.at(-1)).toBeNull();
  });

  it('saves trimmed text, keeping inner line breaks, and refuses an empty required value', () => {
    const saved: string[] = [];
    component.saved.subscribe((v) => saved.push(v));
    const c = component as unknown as { text: { set(v: string): void } };
    c.text.set('  Línea 1\nLínea 2  ');
    fixture.detectChanges();
    save().click();
    expect(saved).toEqual(['Línea 1\nLínea 2']);

    fixture.componentRef.setInput('required', true);
    c.text.set('   ');
    fixture.detectChanges();
    expect(save().disabled).toBe(true);
  });
});
