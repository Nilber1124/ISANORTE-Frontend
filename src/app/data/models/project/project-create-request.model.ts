export interface ProjectCreateRequest {
  nombre: string;
  slug: string;
  cliente?: string | null;
  ubicacion?: string | null;
  fechaProyecto?: string | null;
  descripcion: string;
  imagenUrl?: string | null;
  imagenAlt?: string | null;
  destacado?: boolean | null;
  activo?: boolean | null;
  orden?: number | null;
  servicioIds?: string[] | null;
}

