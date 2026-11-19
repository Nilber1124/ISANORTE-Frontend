/** Contrato de `GET /api/publico/sitios/{clave}/unidades/{unidad}/home` (ver docs/openapi.yaml del backend). */
export type HomeSaleMode = 'COMPRAR' | 'COTIZAR';
export type HomeSaleUnit = 'M2' | 'UNIDAD' | 'CAJA' | 'ML';
export type HomeStockState = 'DISPONIBLE' | 'QUEDAN' | 'AGOTADO' | 'SIN_CONTROL';

export interface IsadecorHomeProductCardResponse {
  slug: string;
  nombre: string;
  categorias: { nombre: string; slug: string }[];
  imagen: { url: string; alt: string | null } | null;
  precioBase: number | null;
  precioAnterior: number | null;
  descuentoPorcentaje: number | null;
  unidadVenta: HomeSaleUnit;
  modalidad: HomeSaleMode;
  plazoEntrega: string | null;
  valoracion: number | null;
  resenasCantidad: number;
  acabados: { nombre: string; colorHex: string | null; agotado: boolean }[];
  estadoStock: HomeStockState;
  quedan: number | null;
}

export interface IsadecorHomeSectionResponse {
  titulo: string;
  textoEnlace: string;
  categoriaEnlace: string | null;
  productos: IsadecorHomeProductCardResponse[];
}

export interface IsadecorHomeResponse {
  hero: { titulo: string; subtitulo: string } | null;
  cinta: { texto: string; enlace: string | null }[];
  promociones: {
    tipo: 'DESCUENTO' | 'NUEVO';
    titulo: string;
    imagenUrl: string;
    fechaFin: string | null;
    producto: IsadecorHomeProductCardResponse;
  }[];
  campana: {
    etiqueta: string;
    titulo: string;
    descripcion: string;
    textoBoton: string;
    enlace: string;
    imagenUrl: string;
  } | null;
  tienda: IsadecorHomeSectionResponse | null;
  facil: IsadecorHomeSectionResponse | null;
  servicios: {
    etiqueta: string;
    titulo: string;
    descripcion: string;
    puntos: string[];
    textoBoton: string;
    enlace: string;
  } | null;
  resenas: {
    nombreCliente: string;
    calificacion: number;
    comentario: string;
    compraVerificada: boolean;
    productoNombre: string;
    productoSlug: string;
  }[];
}
