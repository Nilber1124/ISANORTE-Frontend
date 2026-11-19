export type StockMovementType = 'ENTRADA' | 'SALIDA' | 'AJUSTE' | 'PEDIDO' | 'CANCELACION';
export type StockState = 'DISPONIBLE' | 'QUEDAN' | 'AGOTADO' | 'SIN_CONTROL';

export interface StockAdjustmentRequest {
  tipo: 'ENTRADA' | 'SALIDA' | 'AJUSTE';
  cantidad: number;
  motivo?: string | null;
}

export interface StockResponse {
  productoId: string;
  varianteId: string | null;
  stockActual: number | null;
  stockMinimo: number | null;
  estado: StockState;
  quedan: number | null;
}

export interface StockMovementResponse {
  id: string;
  varianteId: string | null;
  tipo: StockMovementType;
  cantidad: number;
  stockResultante: number | null;
  motivo: string | null;
  pedidoId: string | null;
  usuario: string | null;
  fecha: string;
}
