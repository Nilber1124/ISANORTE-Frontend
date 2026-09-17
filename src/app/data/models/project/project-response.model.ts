import { NamedSlugSummary } from '../common/named-slug-summary.model';
import { ProjectImageType } from './project-image-type.enum';

export interface ProjectImageResponse {
  id: string;
  url: string;
  titulo: string | null;
  descripcion: string | null;
  tipo: ProjectImageType;
  esPrincipal: boolean | null;
  orden: number | null;
}

export interface ProjectResponse {
  id: string;
  nombre: string;
  slug: string;
  cliente: string | null;
  ubicacion: string | null;
  fechaProyecto: string | null;
  descripcion: string;
  destacado: boolean | null;
  activo: boolean | null;
  servicios: NamedSlugSummary[] | null;
  imagenes: ProjectImageResponse[] | null;
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
}
