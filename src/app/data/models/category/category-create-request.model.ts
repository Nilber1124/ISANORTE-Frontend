export interface CategoryCreateRequest {
  nombre: string;
  slug: string;
  descripcion?: string | null;
  imagenUrl?: string | null;
  activo?: boolean | null;
  orden?: number | null;
  unidadNegocioId?: string | null;
  /** Categoría de la que cuelga (solo dos niveles); null = categoría raíz. */
  categoriaPadreId?: string | null;
}
