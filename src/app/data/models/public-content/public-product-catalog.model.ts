import { ProductAvailability } from '../product/product-availability.enum';

export interface PublicProductCategoryResponse {
  nombre: string;
  slug: string;
}

export interface PublicProductImageResponse {
  url: string;
  alt: string | null;
  esPrincipal: boolean | null;
  orden: number | null;
}

export interface PublicProductCardResponse {
  nombre: string;
  sku: string;
  slug: string;
  resumen: string | null;
  descripcion: string;
  precioBase: number | null;
  precioAnterior: number | null;
  descuentoPorcentaje: number | null;
  disponibilidad: ProductAvailability;
  destacado: boolean | null;
  ordenDestacado: number | null;
  retiroEnTienda: boolean | null;
  imagen: PublicProductImageResponse | null;
  categorias: PublicProductCategoryResponse[];
}

export interface PublicProductCatalogUnitResponse {
  nombre: string;
  slug: string;
}

export interface PublicProductCatalogCategoryResponse {
  nombre: string;
  slug: string;
  cantidad: number;
}

export interface PublicProductCatalogPageResponse {
  contenido: PublicProductCardResponse[];
  pagina: number;
  tamano: number;
  totalElementos: number;
  totalPaginas: number;
}

export interface PublicProductCatalogResponse {
  unidad: PublicProductCatalogUnitResponse;
  categorias: PublicProductCatalogCategoryResponse[];
  productos: PublicProductCatalogPageResponse;
}

export type CatalogBackendOrder = 'DESTACADOS' | 'PRECIO_ASC' | 'PRECIO_DESC' | 'NOMBRE_ASC';
