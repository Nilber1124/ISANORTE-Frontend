import { ProjectImageType } from './project-image-type.enum';

export interface ProjectImageRequest {
  url: string;
  titulo?: string | null;
  descripcion?: string | null;
  alt?: string | null;
  tipo: ProjectImageType;
  esPrincipal: boolean;
  orden: number;
}
