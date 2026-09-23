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
  retiroEnTienda: boolean | null;
  imagen: PublicProductImageResponse | null;
  categorias: PublicProductCategoryResponse[];
}

export interface PublicProductCatalogUnitResponse {
  nombre: string;
  slug: string;
}

export interface PublicProductCatalogResponse {
  unidad: PublicProductCatalogUnitResponse;
  categorias: PublicProductCategoryResponse[];
  productos: PublicProductCardResponse[];
}
