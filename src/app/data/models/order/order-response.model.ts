import { OrderStatus } from './order-status.enum';

export interface OrderDetailResponse {
  id: string;
  productoId: string;
  varianteId: string | null;
  nombreProducto: string;
  sku: string | null;
  cantidad: number;
  precioUnitario: number | null;
  subtotal: number | null;
  notas: string | null;
}

export interface OrderTrackingResponse {
  id: string;
  administradorId: string | null;
  administradorNombre: string | null;
  estadoAnterior: OrderStatus | null;
  estadoNuevo: OrderStatus;
  comentario: string;
  fecha: string | null;
}

export interface OrderResponse {
  id: string;
  codigo: string;
  clienteId: string;
  direccionAlias: string | null;
  direccionCalle: string;
  direccionDistrito: string;
  direccionCiudad: string;
  direccionReferencia: string | null;
  direccionTelefonoContacto: string;
  ruc: string | null;
  razonSocial: string | null;
  estado: OrderStatus;
  totalPedido: number | null;
  stockDescontado: boolean;
  detalles: OrderDetailResponse[] | null;
  seguimientos: OrderTrackingResponse[] | null;
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
}
