import { NamedSlugSummary } from '../common/named-slug-summary.model';

export interface ProjectResponse {
  id: string;
  nombre: string;
  slug: string;
  cliente: string | null;
  ubicacion: string | null;
  fechaProyecto: string | null;
  descripcion: string;
  imagenUrl: string | null;
  imagenAlt: string | null;
  destacado: boolean | null;
  activo: boolean | null;
  orden: number | null;
  servicios: NamedSlugSummary[] | null;
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
}

