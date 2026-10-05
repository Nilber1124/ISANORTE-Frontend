import { NamedSlugSummary } from '../common/named-slug-summary.model';

export interface CategoryResponse {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  imagenUrl: string | null;
  activo: boolean | null;
  orden: number | null;
  unidadNegocio: NamedSlugSummary | null;
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
}
