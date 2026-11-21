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

  it('lists the photos in order, swaps neighbours and has no button management', () => {
    const photos = Array.from(el().querySelectorAll('img')).map((i) => i.getAttribute('src'));
    expect(photos).toEqual(['a.jpg', 'b.jpg']);

    const swaps: { first: { id: string }; second: { id: string } }[] = [];
    component.swapped.subscribe((e) => swaps.push(e as never));
    (el().querySelector('button[aria-label="Bajar foto 1"]') as HTMLButtonElement).click();
    expect(swaps).toEqual([
      expect.objectContaining({ first: expect.objectContaining({ id: 's1' }), second: expect.objectContaining({ id: 's2' }) }),
    ]);

    // Los botones de la portada son fijos: no se listan ni se editan aquí.
    expect(el().querySelector('#hero-botones')).toBeNull();
    expect(el().textContent).not.toContain('Añadir botón');
    expect(el().textContent).not.toContain('Solicitar cotización');
  });

  it('asks before removing a photo', () => {
    const removed: string[] = [];
    component.sceneDeleted.subscribe((id) => removed.push(id));
    button('Quitar').click();
    fixture.detectChanges();
    expect(removed).toEqual([]);
    button('Sí, quitar').click();
    expect(removed).toEqual(['s1']);
  });

  it('emits what is being typed as a live draft and null when nothing changed', () => {
    const drafts: unknown[] = [];
    component.draftChanged.subscribe((d) => drafts.push(d));
    const c = component as unknown as { titulo: { set(v: string): void } };
    fixture.detectChanges();
    c.titulo.set('Otro título');
    fixture.detectChanges();
    expect(drafts.at(-1)).toEqual({
      etiqueta: 'Constructora en Cajamarca',
      titulo: 'Otro título',
      subtitulo: 'Del terreno a la llave en mano',
    });
    c.titulo.set(hero.titulo as string);
    fixture.detectChanges();
    expect(drafts.at(-1)).toBeNull();
  });

  it('focuses the field that was tapped in the preview', async () => {
    document.body.appendChild(el());
    fixture.componentRef.setInput('focusRequest', { field: 'subtitulo', n: 1 });
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 80));
    expect(document.activeElement?.id).toBe('hero-subtitulo');
    el().remove();
  });

  it('shows only the tapped field, or only the photos, and can switch to the full form', () => {
    fixture.componentRef.setInput('only', 'subtitulo');
    fixture.detectChanges();
    expect(el().querySelector('#hero-subtitulo')).toBeTruthy();
    expect(el().querySelector('#hero-titulo')).toBeNull();
    expect(el().querySelector('#hero-etiqueta')).toBeNull();
    expect(el().querySelector('[role="switch"]')).toBeNull();
    expect(el().querySelector('h2')?.textContent).toContain('Subtítulo');

    fixture.componentRef.setInput('only', 'fotos');
    fixture.detectChanges();
    expect(el().querySelector('#hero-fotos')).toBeTruthy();
    expect(el().querySelectorAll('img')).toHaveLength(2);
    expect(el().querySelector('#hero-subtitulo')).toBeNull();

    let all = 0;
    component.showAll.subscribe(() => all++);
    button('Ver todos los campos').click();
    expect(all).toBe(1);

    fixture.componentRef.setInput('only', null);
    fixture.detectChanges();
    expect(el().querySelector('#hero-titulo')).toBeTruthy();
    expect(el().querySelector('#hero-fotos')).toBeTruthy();
    expect(el().querySelector('[role="switch"]')).toBeTruthy();
  });
});
