export type CompetitorComparisonStatus =
  | 'FOUND'
  | 'NO_SIMILAR_PRODUCT_FOUND'
  | 'STORE_UNAVAILABLE';

export interface ComparableCharacteristic {
  nombre: string;
  valor: string;
}

export interface IsadecorComparableProduct {
  nombre: string;
  precio: number | null;
  precioAnterior: number | null;
  moneda: string;
  unidadPrecio: string | null;
  caracteristicas: ComparableCharacteristic[];
}

export interface CompetitorProductResult {
  empresa: 'PISOPAK' | 'DECORPLAS';
  estado: CompetitorComparisonStatus;
  encontrado: boolean;
  nombreProducto: string | null;
  urlProducto: string | null;
  precio: number | null;
  precioAnterior: number | null;
  moneda: string | null;
  unidadPrecio: string | null;
  cantidadPorPresentacion: number | null;
  similitud: number | null;
  caracteristicas: ComparableCharacteristic[];
  comparablePrecio: boolean;
  diferenciaPrecio: number | null;
  mensaje: string;
}

export interface ProductCompetitorComparisonResponse {
  productoIsadecor: IsadecorComparableProduct;
  competidores: CompetitorProductResult[];
  diferenciasEncontradas: string[];
  fechaConsulta: string;
}
