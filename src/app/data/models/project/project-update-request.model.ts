export interface ProjectUpdateRequest {
  nombre: string;
  slug: string;
  cliente?: string | null;
  ubicacion?: string | null;
  fechaProyecto?: string | null;
  descripcion: string;
  imagenUrl?: string | null;
  imagenAlt?: string | null;
  destacado: boolean;
  activo: boolean;
  orden: number;
  servicioIds: string[];
}

