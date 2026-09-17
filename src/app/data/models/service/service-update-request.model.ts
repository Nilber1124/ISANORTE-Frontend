export interface ServiceUpdateRequest {
  nombre: string;
  slug: string;
  resumen?: string | null;
  descripcion: string;
  icono?: string | null;
  imagenUrl?: string | null;
  activo: boolean;
  destacado: boolean;
  orden: number;
}
