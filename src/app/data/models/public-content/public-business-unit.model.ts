import { PublicPageSeo } from './public-page.model';

export interface PublicCatalogo {
  titulo: string;
  imagenPortadaUrl: string;
  archivoUrl: string;
  orden: number;
}

export interface PublicBusinessUnitResponse {
  nombre: string;
  slug: string;
  descripcion: string | null;
  icono: string | null;
  imagenUrl: string | null;
  imagenAlt: string | null;
  catalogos: PublicCatalogo[];
  seo: PublicPageSeo | null;
}
