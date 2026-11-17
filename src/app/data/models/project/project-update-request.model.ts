export interface ProjectUpdateRequest {
  nombre: string;
  slug: string;
  cliente?: string | null;
  ubicacion?: string | null;
  fechaProyecto?: string | null;
  areaM2?: number | null;
  plazoMeses?: number | null;
  alcance?: string | null;
  tipoObra?: string | null;
  descripcion: string;
  imagenUrl?: string | null;
  imagenAlt?: string | null;
  destacado: boolean;
  activo: boolean;
  orden: number;
  servicioIds: string[];
}
