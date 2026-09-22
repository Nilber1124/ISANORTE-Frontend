export enum PublicHomeSectionType {
  HERO = 'HERO',
  SERVICIOS = 'SERVICIOS',
  PROYECTOS = 'PROYECTOS',
  EMPRESA = 'EMPRESA',
  CONTACTO = 'CONTACTO',
  CTA = 'CTA',
  UNIDAD_NEGOCIO = 'UNIDAD_NEGOCIO',
  PERSONALIZADA = 'PERSONALIZADA',
}

export enum PublicBusinessUnitResourceType {
  IMAGEN_FONDO = 'IMAGEN_FONDO',
  IMAGEN_EDITORIAL = 'IMAGEN_EDITORIAL',
  CATALOGO = 'CATALOGO',
}

export interface PublicHomeScene {
  imagenUrl: string;
  alt: string | null;
  orden: number;
}

export interface PublicHomeAction {
  texto: string;
  enlace: string;
  orden: number;
}

export interface PublicHomeSection {
  tipo: PublicHomeSectionType;
  etiqueta: string | null;
  titulo: string | null;
  subtitulo: string | null;
  contenido: string | null;
  imagenUrl: string | null;
  imagenAlt: string | null;
  textoBoton: string | null;
  enlaceBoton: string | null;
  orden: number;
  escenas: PublicHomeScene[];
  acciones: PublicHomeAction[];
}

export interface PublicHomeService {
  nombre: string;
  slug: string;
  resumen: string | null;
  descripcion: string;
  imagenUrl: string | null;
  imagenAlt: string | null;
  etiqueta: string | null;
  orden: number;
  beneficios: string[];
}

export interface PublicHomeProjectImage {
  url: string;
  alt: string | null;
  esPrincipal: boolean;
  orden: number;
}

export interface PublicHomeProject {
  nombre: string;
  slug: string;
  ubicacion: string | null;
  fechaProyecto: string | null;
  descripcion: string;
  orden: number;
  imagenes: PublicHomeProjectImage[];
}

export interface PublicBusinessUnitResource {
  tipo: PublicBusinessUnitResourceType;
  url: string;
  alt: string | null;
  etiqueta: string | null;
  orden: number;
}

export interface PublicHomeBusinessUnit {
  nombre: string;
  slug: string;
  descripcion: string | null;
  icono: string | null;
  imagenUrl: string | null;
  imagenAlt: string | null;
  orden: number;
  recursos: PublicBusinessUnitResource[];
}

export interface PublicHomeResponse {
  secciones: PublicHomeSection[];
  servicios: PublicHomeService[];
  proyectos: PublicHomeProject[];
  unidadDestacada: PublicHomeBusinessUnit | null;
}
