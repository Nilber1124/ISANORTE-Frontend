export interface BusinessUnitCreateRequest {
  nombre: string;
  slug: string;
  descripcion?: string | null;
  icono?: string | null;
  imagenUrl?: string | null;
  activo?: boolean | null;
  orden?: number | null;
  empresaId: string;
}
