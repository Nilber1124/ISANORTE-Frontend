import { ServiceBenefitResponse } from './service-benefit.model';

export interface ServiceResponse {
  id: string;
  nombre: string;
  slug: string;
  resumen: string | null;
  descripcion: string;
  icono: string | null;
  imagenUrl: string | null;
  etiqueta: string | null;
  imagenAlt: string | null;
  activo: boolean | null;
  destacado: boolean | null;
  orden: number | null;
  beneficios: ServiceBenefitResponse[];
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
}
