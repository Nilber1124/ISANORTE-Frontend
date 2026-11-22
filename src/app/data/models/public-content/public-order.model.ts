import { OrderStatus } from '../order/order-status.enum';

export type DeliveryMethod = 'DELIVERY' | 'RECOJO_TIENDA';

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
  metodoEntrega?: DeliveryMethod;
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
  metodoEntrega: DeliveryMethod;
  costoEnvio: number;
  metodoPago: string | null;
  referenciaPago: string | null;
  fechaPago: string | null;
  totalPedido: number | null;
  detalles: PublicOrderDetailResponse[];
  fechaCreacion: string;
}

/** Envío y modo de pago que el checkout necesita conocer. */
export interface StoreConfig {
  costoDelivery: number;
  recojoHabilitado: boolean;
  pasarela: string;
  pagoSimulado: boolean;
}

export interface OrderPaymentResponse {
  aprobado: boolean;
  mensaje: string;
  pedido: PublicOrderResponse;
}
