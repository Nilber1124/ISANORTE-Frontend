export interface ServiceResponse {
  id: string;
  nombre: string;
  slug: string;
  resumen: string | null;
  descripcion: string;
  icono: string | null;
  imagenUrl: string | null;
  activo: boolean | null;
  destacado: boolean | null;
  orden: number | null;
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
}
