export type ProductPriceComparisonStatus =
  | 'SUCCESS'
  | 'INVALID_URL'
  | 'BLOCKED_URL'
  | 'SITE_UNREACHABLE'
  | 'UNSUPPORTED_CONTENT'
  | 'PRICE_NOT_FOUND'
  | 'CURRENCY_UNKNOWN'
  | 'CURRENCY_MISMATCH'
  | 'NOT_COMPARABLE';

export interface ProductPriceComparisonResponse {
  producto: string;
  urlExterna: string | null;
  dominioExterno: string | null;
  nombreProductoExterno: string | null;
  precioInterno: number | null;
  precioExterno: number | null;
  monedaInterna: string;
  monedaExterna: string | null;
  diferencia: number | null;
  porcentajeDiferencia: number | null;
  comparable: boolean;
  estado: ProductPriceComparisonStatus;
  mensaje: string;
  fechaConsulta: string;
}
