import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LandingSectionResponse } from '../../../../../data/models/landing-section/landing-section-response.model';
import { LandingSectionType } from '../../../../../data/models/landing-section/landing-section-type.enum';
import { HeroEditor } from './hero-editor';

const hero = {
  id: 'hero-1',
  tipo: LandingSectionType.HERO,
  etiqueta: 'Constructora en Cajamarca',
  titulo: 'Construimos tu casa\nen Cajamarca',
  subtitulo: 'Del terreno a la llave en mano',
  contenido: null,
  imagenUrl: null,
  imagenAlt: null,
  textoBoton: null,
  enlaceBoton: null,
  orden: 0,
  visible: true,
  configuracionSitioId: 'site-1',
  escenas: [
    { id: 's2', imagenUrl: 'b.jpg', alt: null, orden: 1, activo: true },
    { id: 's1', imagenUrl: 'a.jpg', alt: 'Casa', orden: 0, activo: true },
  ],
  acciones: [
    { id: 'a1', texto: 'Solicitar cotización', enlace: '/contacto', orden: 0, activo: true },
    { id: 'a2', texto: 'Ver proyectos', enlace: '/proyectos', orden: 1, activo: true },
  ],
  fechaCreacion: null,
  fechaActualizacion: null,
} as unknown as LandingSectionResponse;

describe('HeroEditor', () => {
  let fixture: ComponentFixture<HeroEditor>;
  let component: HeroEditor;
  const el = () => fixture.nativeElement as HTMLElement;
  const button = (text: string) =>
    Array.from(el().querySelectorAll('button')).find((b) => b.textContent?.trim() === text) as HTMLButtonElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HeroEditor] }).compileComponents();
    fixture = TestBed.createComponent(HeroEditor);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('section', hero);
    fixture.detectChanges();
  });

  it('keeps the title line break in a multi-line field and saves it untouched', () => {
    const title = el().querySelector('#hero-titulo') as HTMLTextAreaElement;
    expect(title.tagName).toBe('TEXTAREA');
    expect(title.value).toBe('Construimos tu casa\nen Cajamarca');

    const saved: unknown[] = [];
    component.textsSaved.subscribe((e) => saved.push(e));
    (component as unknown as { etiqueta: { set(v: string): void } }).etiqueta.set('Constructora');
    fixture.detectChanges();
    button('Guardar textos').click();
    expect((saved[0] as { request: { titulo: string; etiqueta: string } }).request.titulo).toBe(
      'Construimos tu casa\nen Cajamarca',
    );
    expect((saved[0] as { request: { etiqueta: string } }).request.etiqueta).toBe('Constructora');
  });

  it('only enables saving the texts when something changed', () => {
    expect(button('Guardar textos').disabled).toBe(true);
  });

  it('lists buttons and photos in order and swaps neighbours', () => {
    const photos = Array.from(el().querySelectorAll('img')).map((i) => i.getAttribute('src'));
    expect(photos).toEqual(['a.jpg', 'b.jpg']);

    const swaps: { kind: string; first: { id: string }; second: { id: string } }[] = [];
    component.swapped.subscribe((e) => swaps.push(e as never));
    (el().querySelector('button[aria-label="Bajar Solicitar cotización"]') as HTMLButtonElement).click();
    expect(swaps).toEqual([
      expect.objectContaining({ kind: 'action', first: expect.objectContaining({ id: 'a1' }), second: expect.objectContaining({ id: 'a2' }) }),
    ]);
  });

  it('adds a button with the next order and asks before removing one', () => {
    const saved: { id: string | null; request: { orden: number; texto: string } }[] = [];
    component.actionSaved.subscribe((e) => saved.push(e as never));
    button('+ Añadir botón').click();
    fixture.detectChanges();
    (component as unknown as { draftText: { set(v: string): void }; draftLink: { set(v: string): void } }).draftText.set('Contáctanos');
    (component as unknown as { draftLink: { set(v: string): void } }).draftLink.set('/contacto');
    fixture.detectChanges();
    button('Guardar botón').click();
    expect(saved[0]).toEqual({ id: null, request: { texto: 'Contáctanos', enlace: '/contacto', orden: 2, activo: true } });

    const removed: string[] = [];
    component.actionDeleted.subscribe((id) => removed.push(id));
    button('Quitar').click();
    fixture.detectChanges();
    expect(removed).toEqual([]);
    button('Sí, quitar').click();
    expect(removed).toEqual(['a1']);
  });
});
