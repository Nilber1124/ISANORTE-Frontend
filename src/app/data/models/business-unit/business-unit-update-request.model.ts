export interface BusinessUnitUpdateRequest {
  nombre: string;
  slug: string;
  descripcion?: string | null;
  icono?: string | null;
  imagenUrl?: string | null;
  activo: boolean;
  orden: number;
  empresaId: string;
}
