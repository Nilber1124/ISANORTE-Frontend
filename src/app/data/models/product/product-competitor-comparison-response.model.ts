export type ProductCompetitorCompany = 'PISOPAK' | 'DECORPLAS';

export type ProductCompetitorComparisonStatus =
  | 'FOUND'
  | 'NO_SIMILAR_PRODUCT_FOUND'
  | 'STORE_UNAVAILABLE';

export interface ProductComparableFeature {
  nombre: string;
  valor: string;
}

export interface ComparableProduct {
  nombre: string;
  precio: number | null;
  precioAnterior: number | null;
  moneda: string;
  unidadPrecio: string | null;
  caracteristicas: ProductComparableFeature[];
}

export interface ProductCompetitorResult {
  empresa: ProductCompetitorCompany;
  estado: ProductCompetitorComparisonStatus;
  encontrado: boolean;
  nombreProducto: string | null;
  urlProducto: string | null;
  precio: number | null;
  precioAnterior: number | null;
  moneda: string | null;
  unidadPrecio: string | null;
  cantidadPorPresentacion: number | null;
  similitud: number | null;
  caracteristicas: ProductComparableFeature[];
  comparablePrecio: boolean;
  diferenciaPrecio: number | null;
  mensaje: string;
}

export interface ProductCompetitorComparisonResponse {
  productoIsadecor: ComparableProduct;
  competidores: ProductCompetitorResult[];
  diferenciasEncontradas: string[];
  fechaConsulta: string;
}
