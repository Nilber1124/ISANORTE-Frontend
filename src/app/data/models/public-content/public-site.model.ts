export interface PublicSiteCompany {
  nombreComercial: string;
  direccion: string | null;
  ciudad: string | null;
  telefono: string | null;
  telefonoSecundario: string | null;
  email: string | null;
  emailVentas: string | null;
  whatsapp: string | null;
  horarioAtencion: string | null;
  resumenNosotros: string | null;
}

export interface PublicSiteSocialNetwork {
  nombre: string;
  url: string;
  icono: string | null;
  orden: number;
}

export interface PublicSiteBusinessUnit {
  nombre: string;
  slug: string;
  descripcion: string | null;
  icono: string | null;
  imagenUrl: string | null;
  imagenAlt: string | null;
  orden: number;
}

export interface PublicSiteResponse {
  clave: string;
  tituloSitio: string | null;
  descripcionSitio: string | null;
  logoUrl: string | null;
  logoBlancoUrl: string | null;
  faviconUrl: string | null;
  textoPiePagina: string | null;
  empresa: PublicSiteCompany;
  redes: PublicSiteSocialNetwork[];
  unidades: PublicSiteBusinessUnit[];
}
