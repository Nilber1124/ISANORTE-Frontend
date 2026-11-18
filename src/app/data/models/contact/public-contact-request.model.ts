/** Solicitud mínima aceptada por POST /api/publico/contacto. */
export interface PublicContactRequest {
  nombre: string;
  email: string;
  telefono: string;
  empresa: string | null;
  mensaje: string;
}

/** Estado que devuelve la confirmación pública, sin exponer la solicitud administrativa. */
export enum PublicContactRequestStatus {
  NUEVA = 'NUEVA',
  EN_GESTION = 'EN_GESTION',
  RESPONDIDA = 'RESPONDIDA',
  DESCARTADA = 'DESCARTADA',
  SPAM = 'SPAM',
}

/** Confirmación mínima de una solicitud pública creada correctamente. */
export interface PublicContactResponse {
  id: string;
  estado: PublicContactRequestStatus;
  fechaCreacion: string;
}
