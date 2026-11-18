export enum PublicPageType {
  NOSOTROS = 'NOSOTROS',
  SERVICIOS = 'SERVICIOS',
  PROYECTOS = 'PROYECTOS',
  CONTACTO = 'CONTACTO',
}

export interface PageContentRequest {
  configuracionSitioId: string;
  pagina: PublicPageType;
  eyebrow?: string | null;
  titulo?: string | null;
  introduccion?: string | null;
  descripcion?: string | null;
  imagenUrl?: string | null;
  imagenAlt?: string | null;
  imagenFondoUrl?: string | null;
  activo: boolean;
  tags?: string[] | null;
}

export type PageContentUpdateRequest = Omit<PageContentRequest, 'configuracionSitioId' | 'pagina'>;

export interface PageContentResponse extends PageContentRequest {
  id: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}
