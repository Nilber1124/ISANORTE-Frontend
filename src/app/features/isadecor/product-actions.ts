/** Vías para adquirir un producto: por defecto se puede comprar y cotizar; las otras dos lo restringen. */
export type SaleMode = 'COMPRAR' | 'COTIZAR' | 'AMBAS';

/** Se compra en línea si la modalidad lo permite, tiene precio y hay existencias. */
export function canBuy(
  mode: SaleMode | null | undefined,
  price: number | null | undefined,
  soldOut: boolean,
): boolean {
  return mode !== 'COTIZAR' && price != null && !soldOut;
}

/** Se puede cotizar salvo que el producto esté restringido a la compra directa. */
export function canQuote(mode: SaleMode | null | undefined): boolean {
  return mode !== 'COMPRAR';
}

/** Producto que solo se vende por cotización (el precio es una referencia: «Desde»). */
export function isQuoteOnly(mode: SaleMode | null | undefined): boolean {
  return mode === 'COTIZAR';
}
