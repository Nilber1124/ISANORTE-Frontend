import {
  IsadecorHomeProductCardResponse,
  IsadecorHomeResponse,
} from '../../../data/models/isadecor-home/isadecor-home-response.model';
import { toCatalogProductCard, toHomeContent, toProductCard } from './isadecor-home.mapper';

const card: IsadecorHomeProductCardResponse = {
  slug: 'piso-spc',
  nombre: 'Piso SPC',
  categorias: [{ nombre: 'Pisos', slug: 'pisos' }],
  imagen: { url: 'https://cdn/piso.webp', alt: null },
  precioBase: 96,
  precioAnterior: 120,
  descuentoPorcentaje: 20,
  unidadVenta: 'CAJA',
  modalidad: 'COTIZAR',
  plazoEntrega: 'Llega en 3 a 5 días',
  valoracion: 4.5,
  resenasCantidad: 3,
  acabados: [
    { nombre: 'Roble', colorHex: '#d4b184', agotado: false },
    { nombre: 'Nogal', colorHex: null, agotado: true },
  ],
  estadoStock: 'QUEDAN',
  quedan: 4,
};

const empty: IsadecorHomeResponse = {
  hero: null,
  cinta: [],
  promociones: [],
  campana: null,
  tienda: null,
  facil: null,
  servicios: null,
  resenas: [],
  comunidad: [],
};

describe('isadecor home mapper', () => {
  it('maps a backend card to the tile model keeping finishes, stock and delivery', () => {
    const product = toProductCard(card);

    expect(product.slug).toBe('piso-spc');
    expect(product.imagen?.alt).toBe('Piso SPC');
    expect(product.entrega).toBe('Llega en 3 a 5 días');
    expect(product.acabados).toEqual([
      { nombre: 'Roble', color: '#d4b184', agotado: false },
      { nombre: 'Nogal', color: null, agotado: true },
    ]);
    expect(product.estadoStock).toBe('QUEDAN');
    expect(product.quedan).toBe(4);
  });

  it('maps catalog color, sale mode, stock and delivery to the same tile', () => {
    const { acabados, ...base } = card;
    const result = toCatalogProductCard({ ...toProductCard(card), ...base, imagen: null, acabados });
    expect(result.modalidad).toBe('COTIZAR');
    expect(result.unidadVenta).toBe('CAJA');
    expect(result.entrega).toBe(card.plazoEntrega);
    expect(result.acabados?.[1]).toEqual({ nombre: 'Nogal', color: null, agotado: true });
  });

  it('builds store filters from the real categories of the chosen products', () => {
    const content = toHomeContent({
      ...empty,
      tienda: {
        titulo: 'Elige tu acabado',
        textoEnlace: 'Ver todo',
        categoriaEnlace: null,
        productos: [card, { ...card, slug: 'otro' }],
      },
    });

    expect(content.tienda.titulo).toBe('Elige tu acabado');
    expect(content.tienda.categorias).toEqual([{ slug: 'pisos', nombre: 'Pisos' }]);
    expect(content.tienda.productos.length).toBe(2);
  });

  it('keeps missing sections empty so the page can hide them', () => {
    const content = toHomeContent(empty);

    expect(content.hero).toBeNull();
    expect(content.campana).toBeNull();
    expect(content.servicios).toBeNull();
    expect(content.tienda.productos).toEqual([]);
    expect(content.facil.productos).toEqual([]);
    expect(content.escena).toBeTruthy();
    expect(content.beneficios.length).toBe(4);
    expect(content.comunidad).toEqual([]);
  });

  it('passes the community videos through', () => {
    const video = {
      red: 'INSTAGRAM' as const,
      url: 'https://www.instagram.com/p/A1/',
      titulo: null,
      miniaturaUrl: null,
    };

    expect(toHomeContent({ ...empty, comunidad: [video] }).comunidad).toEqual([video]);
  });
});
