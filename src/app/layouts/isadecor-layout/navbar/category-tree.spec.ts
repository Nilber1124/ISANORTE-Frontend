import { describe, expect, it } from 'vitest';

import { buildCategoryTree } from './navbar';

const cat = (slug: string, padreSlug: string | null = null) => ({
  nombre: slug.toUpperCase(),
  slug,
  cantidad: 1,
  padreSlug,
});

describe('buildCategoryTree', () => {
  it('cuelga cada subcategoría de su categoría y conserva el orden', () => {
    const tree = buildCategoryTree([
      cat('paredes'),
      cat('interior', 'paredes'),
      cat('piedra', 'paredes'),
      cat('techos'),
    ]);

    expect(tree.map((node) => node.label)).toEqual(['PAREDES', 'TECHOS']);
    expect(tree[0].children?.map((node) => node.queryParams['categoria'])).toEqual([
      'interior',
      'piedra',
    ]);
    expect(tree[1].children).toBeUndefined();
  });

  it('muestra como categoría suelta una subcategoría cuyo padre no está visible', () => {
    const tree = buildCategoryTree([cat('huerfana', 'no-visible')]);

    expect(tree.map((node) => node.label)).toEqual(['HUERFANA']);
  });
});
