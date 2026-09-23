import { ProductAvailability } from '../product/product-availability.enum';
import { ProductDocumentType } from '../product/product-document-type.enum';
import {
  PublicProductCategoryResponse,
  PublicProductImageResponse,
} from './public-product-catalog.model';

export interface PublicProductVariantResponse {
  sku: string;
  nombre: string;
  descripcion: string | null;
  precio: number | null;
  disponible: boolean | null;
  imagenUrl: string | null;
  orden: number | null;
}

export interface PublicProductSpecificationResponse {
  clave: string;
  valor: string;
  grupo: string | null;
  orden: number | null;
}

export interface PublicProductDocumentResponse {
  titulo: string;
  url: string;
  tipo: ProductDocumentType;
  formato: string | null;
  tamanoBytes: number | null;
}

export interface PublicProductCalculationResponse {
  habilitada: boolean | null;
  etiquetaEntrada: string | null;
  unidadEntrada: string | null;
  coberturaPorUnidad: number | null;
  unidadVenta: string | null;
  textoAyuda: string | null;
}

export interface PublicProductDetailResponse {
  nombre: string;
  sku: string;
  slug: string;
  resumen: string | null;
  descripcion: string;
  tituloSeo: string | null;
  descripcionSeo: string | null;
  precioBase: number | null;
  precioAnterior: number | null;
  descuentoPorcentaje: number | null;
  disponibilidad: ProductAvailability;
  retiroEnTienda: boolean | null;
  categorias: PublicProductCategoryResponse[];
  imagenes: PublicProductImageResponse[];
  variantes: PublicProductVariantResponse[];
  especificaciones: PublicProductSpecificationResponse[];
  documentos: PublicProductDocumentResponse[];
  configuracionCalculo: PublicProductCalculationResponse | null;
}
