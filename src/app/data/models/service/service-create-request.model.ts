export interface ServiceCreateRequest {
  nombre: string;
  slug: string;
  resumen?: string | null;
  descripcion: string;
  icono?: string | null;
  imagenUrl?: string | null;
  activo?: boolean | null;
  destacado?: boolean | null;
  orden?: number | null;
}
