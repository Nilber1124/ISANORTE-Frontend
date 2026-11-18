import { describe, expect, it } from 'vitest';
import { slugify } from './slugify';

describe('slugify', () => {
  it('convierte a minúsculas', () => {
    expect(slugify('CONSTRUCCIÓN')).toBe('construccion');
  });

  it('elimina tildes', () => {
    expect(slugify('Construcción residencial')).toBe('construccion-residencial');
  });

  it('convierte ñ en n', () => {
    expect(slugify('Diseño y planificación')).toBe('diseno-y-planificacion');
  });

  it('reemplaza espacios con guiones', () => {
    expect(slugify('obras civiles')).toBe('obras-civiles');
  });

  it('colapsa guiones múltiples', () => {
    expect(slugify('obras  civiles')).toBe('obras-civiles');
  });

  it('elimina guiones del inicio y del final', () => {
    expect(slugify('-obras civiles-')).toBe('obras-civiles');
  });

  it('elimina símbolos especiales', () => {
    expect(slugify('Construcción & Diseño!')).toBe('construccion-diseno');
  });

  it('maneja cadena vacía', () => {
    expect(slugify('')).toBe('');
  });

  it('preserva números', () => {
    expect(slugify('Proyecto 2024')).toBe('proyecto-2024');
  });

  it('ejemplo del spec: nombre completo', () => {
    expect(slugify('Construcción residencial y comercial')).toBe(
      'construccion-residencial-y-comercial',
    );
  });
});
