import { ProductAvailability } from './product-availability.enum';
import { ProductDocumentType } from './product-document-type.enum';
import { ProductPublicationStatus } from './product-publication-status.enum';

export interface ProductVariantCreateRequest {
  sku: string;
  nombre: string;
  descripcion?: string | null;
  precio?: number | null;
  disponible?: boolean | null;
  imagenUrl?: string | null;
  orden?: number | null;
}

export interface ProductImageCreateRequest {
  url: string;
  altText?: string | null;
  esPrincipal?: boolean | null;
  orden?: number | null;
}

export interface ProductSpecificationCreateRequest {
  clave: string;
  valor: string;
  grupo?: string | null;
  orden?: number | null;
}

export interface ProductDocumentCreateRequest {
  titulo: string;
  url: string;
  tipo: ProductDocumentType;
  formato?: string | null;
  tamanoBytes?: number | null;
}

export interface CalculationConfigCreateRequest {
  habilitada?: boolean | null;
  etiquetaEntrada?: string | null;
  unidadEntrada?: string | null;
  coberturaPorUnidad: number;
  unidadVenta?: string | null;
  textoAyuda?: string | null;
}

export interface ProductCreateRequest {
  sku: string;
  nombre: string;
  slug: string;
  resumen?: string | null;
  descripcion: string;
  precioBase?: number | null;
  precioAnterior?: number | null;
  descuentoPorcentaje?: number | null;
  disponibilidad: ProductAvailability;
  destacado?: boolean | null;
  estado: ProductPublicationStatus;
  tituloSeo?: string | null;
  descripcionSeo?: string | null;
  unidadNegocioId: string;
  categoriaIds?: string[] | null;
  variantes?: ProductVariantCreateRequest[] | null;
  imagenes?: ProductImageCreateRequest[] | null;
  especificaciones?: ProductSpecificationCreateRequest[] | null;
  documentos?: ProductDocumentCreateRequest[] | null;
  configuracionCalculo?: CalculationConfigCreateRequest | null;
}
