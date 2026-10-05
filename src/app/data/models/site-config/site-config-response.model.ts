import { CompanySummary } from '../common/company-summary.model';
import { LandingSectionType } from '../landing-section/landing-section-type.enum';

export interface SiteConfigSectionResponse {
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
}

export interface SiteConfigResponse {
  id: string;
  clave: string;
  tituloSitio: string | null;
  descripcionSitio: string | null;
  logoUrl: string | null;
  logoBlancoUrl: string | null;
  faviconUrl: string | null;
  colorPrimario: string | null;
  colorSecundario: string | null;
  textoPiePagina: string | null;
  empresa: CompanySummary;
  secciones: SiteConfigSectionResponse[] | null;
  fechaActualizacion: string | null;
}
