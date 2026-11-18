export interface ServiceUpdateRequest {
  nombre: string;
  slug: string;
  resumen?: string | null;
  descripcion: string;
  imagenUrl?: string | null;
  etiqueta?: string | null;
  imagenAlt?: string | null;
  activo: boolean;
  destacado: boolean;
  orden: number;
}
