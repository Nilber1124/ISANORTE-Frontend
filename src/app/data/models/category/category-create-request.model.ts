export interface CategoryCreateRequest {
  nombre: string;
  slug: string;
  descripcion?: string | null;
  imagenUrl?: string | null;
  activo?: boolean | null;
  orden?: number | null;
  unidadNegocioId?: string | null;
}
