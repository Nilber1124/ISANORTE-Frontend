export enum ContactRequestStatus {
  NUEVA = 'NUEVA',
  EN_GESTION = 'EN_GESTION',
  RESPONDIDA = 'RESPONDIDA',
  DESCARTADA = 'DESCARTADA',
  SPAM = 'SPAM',
}

export interface ContactRequestResponse {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  empresa: string | null;
  mensaje: string;
  estado: ContactRequestStatus;
  fechaCreacion: string;
  fechaActualizacion: string;
}

export interface ContactRequestStatusRequest {
  estado: ContactRequestStatus;
}
