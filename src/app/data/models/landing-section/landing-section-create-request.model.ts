import { LandingSectionType } from './landing-section-type.enum';

export interface LandingSectionCreateRequest {
  configuracionSitioId: string;
  tipo: LandingSectionType;
  titulo?: string | null;
  subtitulo?: string | null;
  contenido?: string | null;
  imagenUrl?: string | null;
  textoBoton?: string | null;
  enlaceBoton?: string | null;
  orden?: number | null;
  visible?: boolean | null;
}
