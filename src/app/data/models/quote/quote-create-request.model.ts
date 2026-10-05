import { QuoteChannel } from './quote-channel.enum';

export interface QuoteDetailCreateRequest {
  productoId: string;
  varianteId?: string | null;
  cantidad: number;
  notas?: string | null;
}

export interface QuoteCreateRequest {
  nombreCliente: string;
  emailCliente: string;
  telefonoCliente: string;
  empresaCliente?: string | null;
  ciudad?: string | null;
  mensaje?: string | null;
  canal: QuoteChannel;
  detalles: QuoteDetailCreateRequest[];
}
