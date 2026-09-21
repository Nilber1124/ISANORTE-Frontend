import { SeoRobots } from '../content/page-seo.model';

/** Tipos de página disponibles en el agregado editorial público. */
export enum PublicPageType {
  NOSOTROS = 'NOSOTROS',
  SERVICIOS = 'SERVICIOS',
  PROYECTOS = 'PROYECTOS',
  CONTACTO = 'CONTACTO',
}

export interface PublicPageContent {
  pagina: PublicPageType;
  eyebrow: string | null;
  titulo: string | null;
  introduccion: string | null;
  descripcion: string | null;
  imagenUrl: string | null;
  imagenAlt: string | null;
  imagenFondoUrl: string | null;
  tags: string[];
}

export interface PublicPageSeo {
  title: string;
  description: string;
  ogImageUrl: string | null;
  robots: SeoRobots;
}

/** Estadística corporativa pública: no expone identidad ni estado administrativo. */
export interface PublicCompanyStatistic {
  valor: number;
  prefijo: string | null;
  sufijo: string | null;
  etiqueta: string;
  orden: number;
}

/** Agregado corporativo exclusivo de la página pública NOSOTROS. */
export interface PublicCompanyAbout {
  mision: string | null;
  vision: string | null;
  valores: string | null;
  estadisticas: PublicCompanyStatistic[];
}

export interface PublicPageResponse {
  contenido: PublicPageContent;
  seo: PublicPageSeo | null;
  empresa: PublicCompanyAbout | null;
}
