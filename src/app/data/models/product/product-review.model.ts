import {
  PublicProductCategoryResponse,
  PublicProductImageResponse,
} from '../public-content/public-product-catalog.model';

export interface RecommendedProductResponse {
  nombre: string;
  slug: string;
  precioBase: number | null;
  imagen: PublicProductImageResponse | null;
  categoria: PublicProductCategoryResponse | null;
  calificacionPromedio: number | null;
  cantidadResenas: number;
}

export interface ProductReviewResponse {
  id: string;
  nombreCliente: string;
  calificacion: number;
  titulo: string | null;
  comentario: string;
  fechaCreacion: string;
  compraVerificada: boolean;
  cantidadUtil: number;
}

export interface ReviewDistributionResponse {
  calificacion: number;
  cantidad: number;
  porcentaje: number;
}

export interface ReviewSummaryResponse {
  promedio: number;
  total: number;
  distribucion: ReviewDistributionResponse[];
}

export interface CreateProductReviewRequest {
  calificacion: number;
  titulo: string | null;
  comentario: string;
}

export type ProductReviewOrder =
  | 'RECIENTES'
  | 'MAYOR_CALIFICACION'
  | 'MENOR_CALIFICACION'
  | 'MAS_UTILES';
