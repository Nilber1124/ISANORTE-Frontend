import { OrderStatus } from '../order/order-status.enum';

export interface PublicOrderDetailRequest {
  productoSlug: string;
  varianteSku?: string | null;
  cantidad: number;
}

export interface PublicOrderRequest {
  direccionId?: string | null;
  direccionAlias?: string | null;
  direccionCalle?: string | null;
  direccionDistrito?: string | null;
  direccionCiudad?: string | null;
  direccionReferencia?: string | null;
  direccionTelefonoContacto?: string | null;
  ruc?: string | null;
  razonSocial?: string | null;
  detalles: PublicOrderDetailRequest[];
}

export interface PublicOrderDetailResponse {
  productoSlug: string;
  nombreProducto: string;
  sku: string | null;
  varianteSku: string | null;
  cantidad: number;
  precioUnitario: number | null;
  subtotal: number | null;
}

export interface PublicOrderResponse {
  codigo: string;
  direccionCalle: string;
  direccionDistrito: string;
  direccionCiudad: string;
  estado: OrderStatus;
  totalPedido: number | null;
  detalles: PublicOrderDetailResponse[];
  fechaCreacion: string;
}
