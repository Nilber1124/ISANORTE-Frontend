import type { RecommendedProductResponse } from '../../../data/models/product/product-review.model';
import { ProductAvailability } from '../../../data/models/product/product-availability.enum';
import { toCatalogProductCard, toProductCard } from '../home/isadecor-home.mapper';
import type { HomeProductCard } from '../home/isadecor-home.model';

export function toHomeProductCard(product: RecommendedProductResponse): HomeProductCard {
  if (product.tarjeta) return toProductCard(product.tarjeta);

  return toCatalogProductCard({
    ...product,
    sku: product.slug,
    resumen: null,
    descripcion: '',
    precioAnterior: null,
    descuentoPorcentaje: null,
    disponibilidad: ProductAvailability.DISPONIBLE,
    destacado: false,
    ordenDestacado: null,
    retiroEnTienda: null,
    categorias: product.categoria ? [product.categoria] : [],
    valoracion: product.calificacionPromedio,
    resenasCantidad: product.cantidadResenas,
  });
}
