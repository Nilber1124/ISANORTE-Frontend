export enum BusinessUnitResourceType {
  IMAGEN_FONDO = 'IMAGEN_FONDO',
  IMAGEN_EDITORIAL = 'IMAGEN_EDITORIAL',
  CATALOGO = 'CATALOGO',
}

export interface BusinessUnitResourceRequest {
  tipo: BusinessUnitResourceType;
  url: string;
  alt?: string | null;
  etiqueta?: string | null;
  orden: number;
  activo: boolean;
}

export interface BusinessUnitResourceResponse extends BusinessUnitResourceRequest {
  id: string;
}
