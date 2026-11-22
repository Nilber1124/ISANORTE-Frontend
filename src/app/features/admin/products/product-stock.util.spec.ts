import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { ProductResponse } from '../../../data/models/product/product-response.model';
import { stockLevel, totalStock } from './product-stock.util';

const product = (patch: Partial<ProductResponse>): ProductResponse =>
  ({ disponibilidad: ProductAvailability.DISPONIBLE, variantes: [], stockActual: null, stockMinimo: null, ...patch }) as ProductResponse;

describe('product stock', () => {
  it('sums the stock of the finishes that are controlled, or uses the product stock', () => {
    expect(totalStock(product({ variantes: [{ stockActual: 3 }, { stockActual: 4 }, { stockActual: null }] as never }))).toBe(7);
    expect(totalStock(product({ stockActual: 5 }))).toBe(5);
    expect(totalStock(product({}))).toBeNull();
  });

  it('classifies sold out, low, ok and uncontrolled products', () => {
    expect(stockLevel(product({ disponibilidad: ProductAvailability.AGOTADO, stockActual: 9 }))).toBe('agotado');
    expect(stockLevel(product({ stockActual: 0 }))).toBe('agotado');
    expect(stockLevel(product({ stockActual: 4, stockMinimo: 5 }))).toBe('bajo');
    expect(stockLevel(product({ stockActual: 4, stockMinimo: 0 }))).toBe('ok');
    expect(stockLevel(product({ stockActual: 40, stockMinimo: 5 }))).toBe('ok');
    expect(stockLevel(product({}))).toBe('sin-control');
  });
});
