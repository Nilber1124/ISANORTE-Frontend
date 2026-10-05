import { QuoteChannel } from './quote-channel.enum';
import { QuoteStatus } from './quote-status.enum';

export interface QuoteDetailResponse {
  id: string;
  productoId: string;
  varianteId: string | null;
  nombreProducto: string;
  sku: string;
  cantidad: number;
  precioUnitario: number | null;
  subtotal: number | null;
  notas: string | null;
}

export interface QuoteTrackingResponse {
  id: string;
  administradorId: string | null;
  administradorNombre: string | null;
  estadoAnterior: QuoteStatus | null;
  estadoNuevo: QuoteStatus | null;
  comentario: string | null;
  fecha: string | null;
}

export interface QuoteResponse {
  id: string;
  codigo: string;
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  empresaCliente: string | null;
  ciudad: string | null;
  mensaje: string | null;
  canal: QuoteChannel;
  estado: QuoteStatus;
  totalEstimado: number | null;
  detalles: QuoteDetailResponse[] | null;
  seguimientos: QuoteTrackingResponse[] | null;
  fechaCreacion: string | null;
  fechaActualizacion: string | null;
}
