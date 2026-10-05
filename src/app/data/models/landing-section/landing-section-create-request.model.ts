import { LandingSectionType } from './landing-section-type.enum';

export interface LandingSectionCreateRequest {
  configuracionSitioId: string;
  tipo: LandingSectionType;
  etiqueta?: string | null;
  titulo?: string | null;
  subtitulo?: string | null;
  contenido?: string | null;
  imagenUrl?: string | null;
  imagenAlt?: string | null;
  textoBoton?: string | null;
  enlaceBoton?: string | null;
  orden?: number | null;
  visible?: boolean | null;
}
