/** Contenido público que construye confianza: GET /api/publico/sitios/{clave}/confianza. */
export interface PublicFaq {
  id: string;
  pregunta: string;
  respuesta: string;
  ambito: 'HOME' | 'SERVICIOS' | 'CONTACTO' | 'GENERAL';
}

export interface PublicTeamMember {
  nombre: string;
  cargo: string;
  especialidad: string | null;
  biografia: string | null;
  fotoUrl: string | null;
  fotoAlt: string | null;
}

export interface PublicCredential {
  nombre: string;
  entidad: string | null;
  tipo: 'LICENCIA' | 'COLEGIATURA' | 'CERTIFICACION' | 'REGISTRO';
  codigo: string | null;
  anio: number | null;
  imagenUrl: string | null;
  imagenAlt: string | null;
}

export interface PublicTestimonial {
  id: string;
  autor: string;
  cargo: string | null;
  texto: string;
  proyectoSlug: string | null;
  fotoUrl: string | null;
  fotoAlt: string | null;
}

export interface PublicGuarantee {
  id: string;
  titulo: string;
  texto: string;
  enHero: boolean;
}

export interface PublicProcessStep {
  id: string;
  titulo: string;
  texto: string;
}

export interface PublicProjectGalleryImage {
  proyectoSlug: string;
  url: string;
  alt: string | null;
  etiqueta: 'ANTES' | 'PROCESO' | 'FINAL' | 'DETALLE';
}

export interface PublicPolicy {
  slug: string;
  titulo: string;
  contenido: string;
}

export interface PublicBlockText {
  clave: string;
  etiqueta: string | null;
  titulo: string | null;
  subtitulo: string | null;
}

export interface PublicTrustResponse {
  faqs: PublicFaq[];
  equipo: PublicTeamMember[];
  credenciales: PublicCredential[];
  testimonios: PublicTestimonial[];
  garantias: PublicGuarantee[];
  pasos: PublicProcessStep[];
  galeria: PublicProjectGalleryImage[];
  politicas: PublicPolicy[];
  textos?: PublicBlockText[];
}
