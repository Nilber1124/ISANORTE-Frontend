export type SaleChannel = 'WHATSAPP' | 'TIENDA' | 'OTRO';
export type SalePaymentMethod = 'EFECTIVO' | 'TRANSFERENCIA' | 'YAPE' | 'PLIN' | 'TARJETA' | 'OTRO';
export type SaleDocumentType = 'DNI' | 'RUC';

export const SALE_CHANNEL_LABELS: Record<SaleChannel, string> = {
  WHATSAPP: 'WhatsApp',
  TIENDA: 'Tienda',
  OTRO: 'Otro',
};

export const SALE_PAYMENT_LABELS: Record<SalePaymentMethod, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  YAPE: 'Yape',
  PLIN: 'Plin',
  TARJETA: 'Tarjeta',
  OTRO: 'Otro',
};

/** Línea de una venta. Sin `productoId` es un artículo libre que no mueve stock. */
export interface SaleLineRequest {
  productoId: string | null;
  varianteId: string | null;
  nombre: string;
  sku: string | null;
  cantidad: number;
  precioUnitario: number;
}

/** Venta registrada a mano (WhatsApp, tienda u otro canal). El total lo calcula el servidor. */
export interface SaleRequest {
  canal: SaleChannel;
  fechaVenta: string;
  clienteNombre: string | null;
  clienteTelefono: string | null;
  tipoDocumento: SaleDocumentType | null;
  documento: string | null;
  razonSocial: string | null;
  metodoPago: SalePaymentMethod;
  pagado: boolean;
  notas: string | null;
  detalles: SaleLineRequest[];
}

export interface SaleLineResponse {
  id: string;
  productoId: string | null;
  varianteId: string | null;
  nombre: string;
  sku: string | null;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface SaleResponse {
  id: string;
  codigo: string;
  canal: SaleChannel;
  fechaVenta: string;
  clienteNombre: string | null;
  clienteTelefono: string | null;
  tipoDocumento: SaleDocumentType | null;
  documento: string | null;
  razonSocial: string | null;
  metodoPago: SalePaymentMethod;
  pagado: boolean;
  total: number;
  notas: string | null;
  anulada: boolean;
  stockDescontado: boolean;
  detalles: SaleLineResponse[];
  fechaCreacion: string | null;
}
