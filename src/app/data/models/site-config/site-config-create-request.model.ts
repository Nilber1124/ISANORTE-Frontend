import { LandingSectionType } from '../landing-section/landing-section-type.enum';

export interface SiteConfigSectionCreateRequest {
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

export interface SiteConfigCreateRequest {
  empresaId: string;
  clave?: string | null;
  tituloSitio?: string | null;
  descripcionSitio?: string | null;
  logoUrl?: string | null;
  logoBlancoUrl?: string | null;
  faviconUrl?: string | null;
  colorPrimario?: string | null;
  colorSecundario?: string | null;
  textoPiePagina?: string | null;
  secciones?: SiteConfigSectionCreateRequest[] | null;
}
