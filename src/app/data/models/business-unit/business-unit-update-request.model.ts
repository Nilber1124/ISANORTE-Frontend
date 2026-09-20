export interface BusinessUnitUpdateRequest {
  nombre: string;
  slug: string;
  descripcion?: string | null;
  icono?: string | null;
  imagenUrl?: string | null;
  imagenAlt?: string | null;
  activo: boolean;
  destacado: boolean;
  orden: number;
  empresaId: string;
}
