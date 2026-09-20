import { LandingSectionType } from './landing-section-type.enum';
import { LandingActionResponse } from './landing-action.model';
import { HeroSceneResponse } from './hero-scene.model';

export interface LandingSectionResponse {
  id: string;
  tipo: LandingSectionType;
  etiqueta: string | null;
  titulo: string | null;
  subtitulo: string | null;
  contenido: string | null;
  imagenUrl: string | null;
  imagenAlt: string | null;
  textoBoton: string | null;
  enlaceBoton: string | null;
  orden: number | null;
  visible: boolean | null;
  configuracionSitioId: string;
  escenas: HeroSceneResponse[];
  acciones: LandingActionResponse[];
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
}
