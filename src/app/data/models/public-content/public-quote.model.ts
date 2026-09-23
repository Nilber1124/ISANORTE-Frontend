import { QuoteChannel } from '../quote/quote-channel.enum';
import { QuoteStatus } from '../quote/quote-status.enum';

export interface PublicQuoteDetailRequest {
  productoSlug: string;
  varianteSku?: string | null;
  cantidad: number;
  notas?: string | null;
}

export interface PublicQuoteRequest {
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  empresaCliente?: string | null;
  ciudad?: string | null;
  mensaje?: string | null;
  canal?: QuoteChannel | null;
  productoSlug?: string | null;
  varianteSku?: string | null;
  cantidad?: number | null;
  notas?: string | null;
  detalles?: PublicQuoteDetailRequest[] | null;
}

export interface PublicQuoteDetailResponse {
  productoSlug: string;
  nombreProducto: string;
  sku: string;
  varianteSku: string | null;
  cantidad: number;
  precioUnitario: number | null;
  subtotal: number | null;
  notas: string | null;
}

export interface PublicQuoteResponse {
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
  detalles: PublicQuoteDetailResponse[];
  fechaCreacion: string;
}
