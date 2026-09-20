import { CompanySummary } from '../common/company-summary.model';
import { BusinessUnitResourceResponse } from './business-unit-resource.model';

export interface BusinessUnitResponse {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string | null;
  icono: string | null;
  imagenUrl: string | null;
  imagenAlt: string | null;
  activo: boolean | null;
  destacado: boolean | null;
  orden: number | null;
  empresa: CompanySummary;
  recursos: BusinessUnitResourceResponse[];
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
}
