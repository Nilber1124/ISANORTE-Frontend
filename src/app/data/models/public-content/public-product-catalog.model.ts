import type {
  HomeSaleMode,
  HomeSaleUnit,
  HomeStockState,
} from '../isadecor-home/isadecor-home-response.model';
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

export interface PublicProductSaleFields {
  modalidad?: HomeSaleMode | null;
  unidadVenta?: HomeSaleUnit | null;
  plazoEntrega?: string | null;
  valoracion?: number | null;
  resenasCantidad?: number | null;
  estadoStock?: HomeStockState | null;
  quedan?: number | null;
  facilInstalacion?: boolean | null;
}

export interface PublicProductCardResponse extends PublicProductSaleFields {
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
  acabados?: { nombre: string; colorHex: string | null; agotado: boolean }[] | null;
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
  precioMinimo?: number | null;
  precioMaximo?: number | null;
}

export type CatalogBackendOrder = 'DESTACADOS' | 'PRECIO_ASC' | 'PRECIO_DESC' | 'NOMBRE_ASC';

export interface CatalogExtraFilters {
  modalidad?: HomeSaleMode | null;
  facilInstalacion?: boolean | null;
  precioMin?: number | null;
  precioMax?: number | null;
  acabado?: string | null;
}
