import {
  PublicProject,
  PublicProjectImage,
} from '../../../../data/models/public-content/public-page.model';

/**
 * Elige hasta `limit` proyectos para sugerir junto a `current`: nunca el mismo, primero los que
 * comparten más servicios y, a igualdad, el orden editorial. Función pura.
 */
export function pickRelatedProjects(
  current: PublicProject,
  all: readonly PublicProject[],
  limit = 3,
): PublicProject[] {
  const currentServices = new Set(current.servicios.map((service) => service.slug));
  const shared = (project: PublicProject): number =>
    project.servicios.filter((service) => currentServices.has(service.slug)).length;

  return all
    .filter((project) => project.slug !== current.slug)
    .map((project, index) => ({ project, index, shared: shared(project) }))
    .sort(
      (left, right) =>
        right.shared - left.shared ||
        left.project.orden - right.project.orden ||
        left.index - right.index,
    )
    .slice(0, limit)
    .map((entry) => entry.project);
}

/** Imagen de portada: la marcada como principal o, si no hay, la primera. */
export function coverImage(project: PublicProject): PublicProjectImage | null {
  return project.imagenes.find((image) => image.esPrincipal) ?? project.imagenes[0] ?? null;
}
