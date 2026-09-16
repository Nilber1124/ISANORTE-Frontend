import { NamedSlugSummary } from '../common/named-slug-summary.model';
import { ProductAvailability } from './product-availability.enum';
import { ProductDocumentType } from './product-document-type.enum';
import { ProductPublicationStatus } from './product-publication-status.enum';

export interface ProductVariantResponse {
  id: string;
  sku: string;
  nombre: string;
  descripcion: string | null;
  precio: number | null;
  disponible: boolean | null;
  imagenUrl: string | null;
  orden: number | null;
}

export interface ProductImageResponse {
  id: string;
  url: string;
  altText: string | null;
  esPrincipal: boolean | null;
  orden: number | null;
}

export interface ProductSpecificationResponse {
  id: string;
  clave: string;
  valor: string;
  grupo: string | null;
  orden: number | null;
}

export interface ProductDocumentResponse {
  id: string;
  titulo: string;
  url: string;
  tipo: ProductDocumentType;
  formato: string | null;
  tamanoBytes: number | null;
}

export interface CalculationConfigResponse {
  id: string;
  habilitada: boolean | null;
  etiquetaEntrada: string | null;
  unidadEntrada: string | null;
  coberturaPorUnidad: number | null;
  unidadVenta: string | null;
  textoAyuda: string | null;
}

export interface ProductResponse {
  id: string;
  sku: string;
  nombre: string;
  slug: string;
  resumen: string | null;
  descripcion: string;
  precioBase: number | null;
  precioAnterior: number | null;
  descuentoPorcentaje: number | null;
  disponibilidad: ProductAvailability;
  destacado: boolean | null;
  estado: ProductPublicationStatus;
  tituloSeo: string | null;
  descripcionSeo: string | null;
  unidadNegocio: NamedSlugSummary;
  categorias: NamedSlugSummary[] | null;
  variantes: ProductVariantResponse[] | null;
  imagenes: ProductImageResponse[] | null;
  especificaciones: ProductSpecificationResponse[] | null;
  documentos: ProductDocumentResponse[] | null;
  configuracionCalculo: CalculationConfigResponse | null;
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
}
