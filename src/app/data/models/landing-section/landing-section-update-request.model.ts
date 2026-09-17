import { LandingSectionType } from './landing-section-type.enum';

export interface LandingSectionUpdateRequest {
  configuracionSitioId: string;
  tipo: LandingSectionType;
  titulo?: string | null;
  subtitulo?: string | null;
  contenido?: string | null;
  imagenUrl?: string | null;
  textoBoton?: string | null;
  enlaceBoton?: string | null;
  orden: number;
  visible: boolean;
}
