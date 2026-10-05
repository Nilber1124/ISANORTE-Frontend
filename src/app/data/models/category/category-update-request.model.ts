export interface CategoryUpdateRequest {
  nombre: string;
  slug: string;
  descripcion?: string | null;
  imagenUrl?: string | null;
  activo: boolean;
  orden: number;
  unidadNegocioId?: string | null;
}
