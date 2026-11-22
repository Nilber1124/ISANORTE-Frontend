import {
  PublicProject,
  PublicProjectImage,
} from '../../../../data/models/public-content/public-page.model';
import { coverImage, pickRelatedProjects } from './related-projects';

function project(
  slug: string,
  orden: number,
  services: string[],
  images: PublicProjectImage[] = [],
): PublicProject {
  return {
    id: slug,
    nombre: slug,
    slug,
    descripcion: null,
    ubicacion: null,
    fechaProyecto: null,
    orden,
    imagenes: images,
    servicios: services.map((service) => ({ id: 'p1', nombre: service, slug: service })) as never,
  };
}

describe('pickRelatedProjects', () => {
  const current = project('actual', 0, ['obra', 'planos']);

  it('excludes the current project and prefers shared services, then editorial order', () => {
    const all = [
      current,
      project('solo-orden', 1, ['interiores']),
      project('comparte-uno', 5, ['obra']),
      project('comparte-dos', 9, ['obra', 'planos']),
    ];

    expect(pickRelatedProjects(current, all).map((item) => item.slug)).toEqual([
      'comparte-dos',
      'comparte-uno',
      'solo-orden',
    ]);
  });

  it('respects the limit and returns an empty list when there are no other projects', () => {
    expect(pickRelatedProjects(current, [current])).toEqual([]);
    const many = Array.from({ length: 6 }, (_, i) => project(`p${i}`, i, []));
    expect(pickRelatedProjects(current, many, 2)).toHaveLength(2);
  });
});

describe('coverImage', () => {
  it('uses the main image or falls back to the first one', () => {
    const first: PublicProjectImage = { url: '/a.jpg', alt: null, esPrincipal: false, orden: 0 };
    const main: PublicProjectImage = { url: '/b.jpg', alt: null, esPrincipal: true, orden: 1 };

    expect(coverImage(project('x', 0, [], [first, main]))?.url).toBe('/b.jpg');
    expect(coverImage(project('x', 0, [], [first]))?.url).toBe('/a.jpg');
    expect(coverImage(project('x', 0, []))).toBeNull();
  });
});
