import { IsadecorPublicationResponse } from '../../../data/models/isadecor-home/isadecor-home-response.model';
import { PublicProductCardResponse } from '../../../data/models/public-content/public-product-catalog.model';

/**
 * Modelo de vista del Home de ISADECOR. `IsadecorHomeApiMapper` lo arma con la respuesta del backend
 * (`GET .../unidades/isadecor/home`) y el contenido fijo de `isadecor-home.static.ts`.
 */
export type ModalidadVenta = 'COMPRAR' | 'COTIZAR' | 'AMBAS';
export type UnidadVenta = 'M2' | 'UNIDAD' | 'CAJA' | 'ML';

export interface HomeProductCard extends Omit<PublicProductCardResponse, 'acabados' | 'estadoStock'> {
  modalidad: ModalidadVenta;
  unidadVenta: UnidadVenta;
  /** Promedio de reseñas (1-5) y cantidad; null si aún no tiene. */
  valoracion?: number | null;
  resenasCantidad?: number | null;
  /** Plazo de entrega resumido, por ejemplo "Llega en 3 a 5 días". */
  entrega?: string | null;
  /** Acabados disponibles (variantes) como muestras: color hexadecimal o imagen. */
  acabados?:
    { nombre: string; color: string | null; imagenUrl?: string | null; agotado?: boolean }[] | null;
  /** Estado del inventario: con `QUEDAN` se muestra «Quedan N». */
  estadoStock?: 'DISPONIBLE' | 'QUEDAN' | 'AGOTADO' | 'SIN_CONTROL';
  quedan?: number | null;
}

export interface HomeHero {
  titulo: string;
  subtitulo: string;
  imagenUrl: string;
  imagenAlt: string;
  placeholderBuscador: string;
}

export interface HomeCategory {
  nombre: string;
  slug: string;
  descripcion: string;
  imagenUrl: string;
}

export interface HomeBenefit {
  titulo: string;
  descripcion: string;
  icono: 'envio' | 'instalacion' | 'garantia' | 'pago';
}

/** Un paso de "Arma tu ambiente": el instante del video y la categoría de acabado que se instala. */
export interface HomeSceneStep {
  etiqueta: string;
  tiempo: number;
  /** Punto del video (en %) que debe verse en pantallas verticales durante este paso. */
  enfoque: { x: number; y: number };
  categoria: HomeCategory;
}

export interface HomeScene {
  titulo: string;
  descripcion: string;
  videoUrl: string;
  videoLigeroUrl: string;
  posterUrl: string;
  posterFinalUrl: string;
  pasos: HomeSceneStep[];
}

export interface HomeReview {
  nombreCliente: string;
  calificacion: number;
  comentario: string;
  compraVerificada: boolean;
  productoNombre: string;
  productoSlug: string;
}

/** Promoción destacada: un descuento o un producto nuevo, siempre con producto concreto. */
export interface HomePromotion {
  tipo: 'DESCUENTO' | 'NUEVO';
  titulo: string;
  imagenUrl: string;
  /** Fecha ISO (AAAA-MM-DD) hasta la que se muestra; null = sin vencimiento. */
  fechaFin: string | null;
  producto: HomeProductCard;
}

/** Aviso corto de la cinta; `enlace` es una ruta interna opcional. */
export interface HomeRibbonItem {
  texto: string;
  enlace: string | null;
}

export interface HomeStoreChip {
  nombre: string;
  slug: string;
}

/** Tienda del Home: cuadrícula de productos filtrable por categoría. */
export interface HomeStore {
  titulo: string;
  categorias: HomeStoreChip[];
  productos: HomeProductCard[];
}

/** Banner de campaña editable por el equipo (temporada, lanzamiento). */
export interface HomeCampaign {
  etiqueta: string;
  titulo: string;
  descripcion: string;
  textoBoton: string;
  enlace: string;
  imagenUrl: string;
}

/** Fila corta de productos bajo la tienda (por ejemplo "Fáciles de instalar"). */
export interface HomeProductRow {
  titulo: string;
  enlaceTexto: string;
  enlaceCategoria: string | null;
  productos: HomeProductCard[];
}

/** Bloque de servicios para empresas, constructoras y arquitectos. */
export interface HomeServices {
  etiqueta: string;
  titulo: string;
  descripcion: string;
  puntos: string[];
  textoBoton: string;
  enlace: string;
}

export interface IsadecorHomeContent {
  hero: HomeHero | null;
  escena: HomeScene | null;
  cinta: HomeRibbonItem[];
  promociones: HomePromotion[];
  campana: HomeCampaign | null;
  tienda: HomeStore;
  facil: HomeProductRow;
  servicios: HomeServices | null;
  beneficios: HomeBenefit[];
  resenas: HomeReview[];
  comunidad: IsadecorPublicationResponse[];
}
