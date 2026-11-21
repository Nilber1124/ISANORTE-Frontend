import { parseDescription } from './product-description';

describe('parseDescription', () => {
  it('splits a paragraph and its bullet list', () => {
    expect(parseDescription('Piso SPC click.\n\n- Sin pegamento\n- Resistente al agua')).toEqual([
      { type: 'p', text: 'Piso SPC click.' },
      { type: 'ul', items: ['Sin pegamento', 'Resistente al agua'] },
    ]);
  });

  it('joins consecutive lines into one paragraph and separates paragraphs by blank lines', () => {
    expect(parseDescription('Línea uno\nlínea dos\n\nOtro párrafo')).toEqual([
      { type: 'p', text: 'Línea uno línea dos' },
      { type: 'p', text: 'Otro párrafo' },
    ]);
  });

  it('accepts different bullet markers and bullets right after a paragraph', () => {
    expect(parseDescription('Intro\n• Uno\n* Dos')).toEqual([
      { type: 'p', text: 'Intro' },
      { type: 'ul', items: ['Uno', 'Dos'] },
    ]);
  });

  it('returns nothing for an empty description and never emits empty blocks', () => {
    expect(parseDescription('')).toEqual([]);
    expect(parseDescription('\n \n\n')).toEqual([]);
  });
});
