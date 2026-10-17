export interface CatalogoRequest {
  titulo: string;
  imagenPortadaUrl: string;
  archivoUrl: string;
  orden: number;
  activo: boolean;
}

export interface CatalogoResponse extends CatalogoRequest {
  id: string;
}
