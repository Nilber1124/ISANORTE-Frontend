export type PriceComparisonStatus =
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
  /** External minus ISADECOR. Monetary calculations belong to the backend. */
  diferencia: number | null;
  /** (external - ISADECOR) * 100 / ISADECOR; null if ISADECOR is zero. */
  porcentajeDiferencia: number | null;
  comparable: boolean;
  estado: PriceComparisonStatus;
  mensaje: string;
  fechaConsulta: string;
}
