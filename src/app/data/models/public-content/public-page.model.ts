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

/** Beneficio editorial público de un servicio, sin identidad ni estado administrativo. */
export interface PublicServiceBenefit {
  texto: string;
  orden: number;
}

/** Servicio editorial público usado exclusivamente por la página Servicios. */
export interface PublicService {
  nombre: string;
  slug: string;
  etiqueta: string | null;
  resumen: string | null;
  descripcion: string | null;
  imagenUrl: string | null;
  imagenAlt: string | null;
  orden: number;
  beneficios: PublicServiceBenefit[];
}

/** Servicio mínimo asociado a un proyecto, usado para filtros públicos. */
export interface PublicProjectService {
  nombre: string;
  slug: string;
}

/** Imagen editorial pública de un proyecto, sin identidad administrativa. */
export interface PublicProjectImage {
  url: string;
  alt: string | null;
  esPrincipal: boolean;
  orden: number;
}

/** Proyecto editorial público usado exclusivamente por la página Proyectos. */
export interface PublicProject {
  nombre: string;
  slug: string;
  descripcion: string | null;
  ubicacion: string | null;
  fechaProyecto: string | null;
  orden: number;
  imagenes: PublicProjectImage[];
  servicios: PublicProjectService[];
}

export interface PublicPageResponse {
  contenido: PublicPageContent;
  seo: PublicPageSeo | null;
  empresa: PublicCompanyAbout | null;
  servicios: PublicService[] | null;
  proyectos: PublicProject[] | null;
}
