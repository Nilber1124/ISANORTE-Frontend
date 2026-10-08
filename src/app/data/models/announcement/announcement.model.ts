export type AnnouncementDestination = 'ISANORTE' | 'ISADECOR' | 'AMBOS';

export type AnnouncementActionType =
  'RUTA_INTERNA' | 'URL_EXTERNA' | 'SECCION' | 'PRODUCTO' | 'CATEGORIA' | 'PROYECTO' | 'SERVICIO';

export interface AnnouncementRequest {
  titulo: string;
  descripcionResumida: string;
  contenidoDetallado: string;
  condiciones: string | null;
  imagenUrl: string;
  etiqueta: string;
  destino: AnnouncementDestination;
  tipoAccion: AnnouncementActionType;
  destinoAccion: string;
  textoBoton: string;
  fechaInicio: string | null;
  fechaFin: string | null;
  activo: boolean;
  orden: number;
}

export interface AnnouncementResponse extends AnnouncementRequest {
  id: string;
  fechaCreacion: string;
  fechaActualizacion: string;
}
