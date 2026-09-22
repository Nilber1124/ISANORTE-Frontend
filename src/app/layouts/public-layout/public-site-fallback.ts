import { PublicSiteResponse } from '../../data/models/public-content/public-site.model';
import { PUBLIC_SITE_KEY } from '../../core/config/public-site.config';

/** TRANSITORIO: branding mínimo, sin unidades ni datos demo, sólo ante error total de GET sitio. */
export const PUBLIC_SITE_ERROR_FALLBACK: PublicSiteResponse = {
  clave: PUBLIC_SITE_KEY,
  tituloSitio: 'ISANORTE',
  descripcionSitio: null,
  logoUrl: '/images/isanorte-isotipo.svg',
  logoBlancoUrl: '/images/isanorte-isotipo-white.svg',
  faviconUrl: '/favicon.svg',
  textoPiePagina: null,
  empresa: {
    nombreComercial: 'ISANORTE',
    direccion: null,
    ciudad: null,
    telefono: null,
    telefonoSecundario: null,
    email: null,
    emailVentas: null,
    whatsapp: null,
    horarioAtencion: null,
    resumenNosotros: null,
  },
  redes: [],
  unidades: [],
};
