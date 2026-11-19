import { ProductAvailability } from './product-availability.enum';
import { ProductSaleMode, ProductSaleUnit } from './product-response.model';
import { ProductPublicationStatus } from './product-publication-status.enum';

export interface ProductUpdateRequest {
  sku: string;
  nombre: string;
  slug: string;
  resumen?: string | null;
  descripcion: string;
  precioBase?: number | null;
  precioAnterior?: number | null;
  descuentoPorcentaje?: number | null;
  disponibilidad: ProductAvailability;
  destacado: boolean;
  ordenDestacado: number;
  retiroEnTienda?: boolean | null;
  modalidad?: ProductSaleMode | null;
  unidadVenta?: ProductSaleUnit | null;
  plazoEntrega?: string | null;
  facilInstalacion?: boolean | null;
  stockMinimo?: number | null;
  estado: ProductPublicationStatus;
  tituloSeo?: string | null;
  descripcionSeo?: string | null;
  unidadNegocioId: string;
  categoriaIds: string[];
}
