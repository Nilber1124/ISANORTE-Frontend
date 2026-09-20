export enum SeoPageType {
  HOME = 'HOME',
  NOSOTROS = 'NOSOTROS',
  SERVICIOS = 'SERVICIOS',
  PROYECTOS = 'PROYECTOS',
  CONTACTO = 'CONTACTO',
  UNIDAD_NEGOCIO = 'UNIDAD_NEGOCIO',
}

export enum SeoRobots {
  INDEX_FOLLOW = 'INDEX_FOLLOW',
  NOINDEX_FOLLOW = 'NOINDEX_FOLLOW',
  INDEX_NOFOLLOW = 'INDEX_NOFOLLOW',
  NOINDEX_NOFOLLOW = 'NOINDEX_NOFOLLOW',
}

export interface PageSeoRequest {
  configuracionSitioId: string;
  tipoPagina: SeoPageType;
  title: string;
  description: string;
  ogImageUrl?: string | null;
  robots: SeoRobots;
  unidadNegocioId?: string | null;
}

export interface PageSeoUpdateRequest {
  title: string;
  description: string;
  ogImageUrl?: string | null;
  robots: SeoRobots;
}

export interface PageSeoResponse extends PageSeoRequest {
  id: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}
