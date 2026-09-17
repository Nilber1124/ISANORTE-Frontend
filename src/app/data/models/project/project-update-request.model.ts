export interface ProjectUpdateRequest {
  nombre: string;
  slug: string;
  cliente?: string | null;
  ubicacion?: string | null;
  fechaProyecto?: string | null;
  descripcion: string;
  destacado: boolean;
  activo: boolean;
  servicioIds: string[];
}
