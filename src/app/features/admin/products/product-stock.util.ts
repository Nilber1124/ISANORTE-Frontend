import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { ProductResponse } from '../../../data/models/product/product-response.model';

export type ProductStockLevel = 'agotado' | 'bajo' | 'ok' | 'sin-control';

/** Stock total: suma de los acabados con control o, si no los hay, el stock del propio producto. */
export function totalStock(product: ProductResponse): number | null {
  const controlled = (product.variantes ?? []).filter((v) => v.stockActual != null);
  if (controlled.length > 0) return controlled.reduce((sum, v) => sum + (v.stockActual ?? 0), 0);
  return product.stockActual ?? null;
}

/** Estado de stock de un producto: agotado, bajo (≤ su mínimo configurado), normal o sin control. */
export function stockLevel(product: ProductResponse): ProductStockLevel {
  const total = totalStock(product);
  if (product.disponibilidad === ProductAvailability.AGOTADO) return 'agotado';
  if (total === null) return 'sin-control';
  if (total <= 0) return 'agotado';
  if ((product.stockMinimo ?? 0) > 0 && total <= (product.stockMinimo ?? 0)) return 'bajo';
  return 'ok';
}
