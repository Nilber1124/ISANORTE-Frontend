import { CompanySummary } from '../common/company-summary.model';

export interface BusinessUnitResponse {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  icono: string | null;
  imagenUrl: string | null;
  activo: boolean | null;
  orden: number | null;
  empresa: CompanySummary;
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
}
