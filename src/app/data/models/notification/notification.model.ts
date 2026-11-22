export type NotificationType = 'PEDIDO_NUEVO' | 'PAGO_APROBADO' | 'PAGO_RECHAZADO';

export interface NotificationResponse {
  id: string;
  tipo: NotificationType;
  titulo: string;
  mensaje: string;
  enlace: string | null;
  leida: boolean;
  fechaCreacion: string;
}

export interface NotificationInbox {
  noLeidas: number;
  items: NotificationResponse[];
}
