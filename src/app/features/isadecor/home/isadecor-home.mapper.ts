import {
  IsadecorHomeProductCardResponse,
  IsadecorHomeResponse,
  IsadecorHomeSectionResponse,
} from '../../../data/models/isadecor-home/isadecor-home-response.model';
import {
  HomeProductCard,
  HomeProductRow,
  HomeStore,
  IsadecorHomeContent,
} from './isadecor-home.model';
import { HOME_BENEFITS, HOME_HERO_VISUAL, HOME_SCENE } from './isadecor-home.static';

/** Convierte una tarjeta del backend en la que dibujan los componentes del Home. */
export function toProductCard(card: IsadecorHomeProductCardResponse): HomeProductCard {
  return {
    nombre: card.nombre,
    sku: card.slug,
    slug: card.slug,
    resumen: null,
    descripcion: '',
    precioBase: card.precioBase,
    precioAnterior: card.precioAnterior,
    descuentoPorcentaje: card.descuentoPorcentaje,
    disponibilidad: card.estadoStock === 'AGOTADO' ? 'AGOTADO' : 'DISPONIBLE',
    destacado: false,
    ordenDestacado: 0,
    retiroEnTienda: false,
    imagen: card.imagen
      ? { url: card.imagen.url, alt: card.imagen.alt ?? card.nombre, esPrincipal: true, orden: 0 }
      : null,
    categorias: card.categorias,
    modalidad: card.modalidad,
    unidadVenta: card.unidadVenta,
    valoracion: card.valoracion,
    resenasCantidad: card.resenasCantidad,
    entrega: card.plazoEntrega,
    acabados: card.acabados.map((finish) => ({
      nombre: finish.nombre,
      color: finish.colorHex,
      agotado: finish.agotado,
    })),
    estadoStock: card.estadoStock,
    quedan: card.quedan,
  } as unknown as HomeProductCard;
}

function toStore(section: IsadecorHomeSectionResponse | null): HomeStore {
  const products = (section?.productos ?? []).map(toProductCard);
  // Los filtros salen de las categorías reales de los productos elegidos.
  const seen = new Map<string, string>();
  for (const product of products) {
    for (const category of product.categorias) seen.set(category.slug, category.nombre);
  }
  return {
    titulo: section?.titulo ?? '',
    categorias: [...seen].map(([slug, nombre]) => ({ slug, nombre })),
    productos: products,
  };
}

function toRow(section: IsadecorHomeSectionResponse | null): HomeProductRow {
  return {
    titulo: section?.titulo ?? '',
    enlaceTexto: section?.textoEnlace ?? '',
    enlaceCategoria: section?.categoriaEnlace ?? null,
    productos: (section?.productos ?? []).map(toProductCard),
  };
}

export function toHomeContent(response: IsadecorHomeResponse): IsadecorHomeContent {
  const store = toStore(response.tienda);
  store.titulo = response.tienda?.titulo ?? '';
  return {
    hero: response.hero ? { ...response.hero, ...HOME_HERO_VISUAL } : null,
    escena: HOME_SCENE,
    cinta: response.cinta,
    promociones: response.promociones.map((promo) => ({
      ...promo,
      producto: toProductCard(promo.producto),
    })),
    campana: response.campana,
    tienda: store,
    facil: toRow(response.facil),
    servicios: response.servicios,
    beneficios: [...HOME_BENEFITS],
    resenas: response.resenas,
  };
}
