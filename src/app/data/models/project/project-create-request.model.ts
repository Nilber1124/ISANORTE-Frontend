import { ProjectImageType } from './project-image-type.enum';

export interface ProjectImageCreateRequest {
  url: string;
  titulo?: string | null;
  descripcion?: string | null;
  alt?: string | null;
  tipo: ProjectImageType;
  esPrincipal?: boolean | null;
  orden?: number | null;
}

export interface ProjectCreateRequest {
  nombre: string;
  slug: string;
  cliente?: string | null;
  ubicacion?: string | null;
  fechaProyecto?: string | null;
  descripcion: string;
  destacado?: boolean | null;
  activo?: boolean | null;
  orden?: number | null;
  servicioIds?: string[] | null;
  imagenes?: ProjectImageCreateRequest[] | null;
}
