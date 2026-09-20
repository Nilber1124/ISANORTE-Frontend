import {
  PublicBusinessUnitResourceType,
  PublicHomeBusinessUnit,
  PublicHomeSection,
  PublicHomeSectionType,
} from '../../../data/models/public-content/public-home.model';

/** Etiqueta de presentación para el catálogo web, nunca para un PDF. */
export const BUSINESS_UNIT_WEB_CATALOG_LABEL = 'VER CATÁLOGO';

/**
 * Fallback transitorio de Fase 3C. Sólo se activa si falla el GET Home; una
 * respuesta válida sin unidad destacada siempre oculta el bloque.
 */
export const HOME_BUSINESS_UNIT_FALLBACK: {
  readonly section: PublicHomeSection;
  readonly unit: PublicHomeBusinessUnit;
} = {
  section: {
    tipo: PublicHomeSectionType.UNIDAD_NEGOCIO,
    etiqueta: 'NUEVA LÍNEA DE MOBILIARIO A MEDIDA',
    titulo: null,
    subtitulo: null,
    contenido: null,
    imagenUrl: null,
    imagenAlt: null,
    textoBoton: null,
    enlaceBoton: null,
    orden: 2,
    escenas: [],
    acciones: [
      { texto: 'CONOCE ISADECOR', enlace: '#isadecor', orden: 0 },
      { texto: 'DESCARGAR CATÁLOGO (PDF)', enlace: '#catalogo', orden: 1 },
    ],
  },
  unit: {
    nombre: 'ISADECOR',
    slug: 'isadecor',
    descripcion:
      'Diseño interior y mobiliario a medida. Creamos atmósferas únicas que reflejan la esencia de quienes las habitan, uniendo materiales premium con estética atemporal.',
    icono: null,
    imagenUrl: '/images/isadecor-fondo.jpg',
    imagenAlt: null,
    orden: 0,
    recursos: [
      {
        tipo: PublicBusinessUnitResourceType.IMAGEN_FONDO,
        url: '/images/isadecor-fondo.jpg',
        alt: null,
        etiqueta: null,
        orden: 0,
      },
      {
        tipo: PublicBusinessUnitResourceType.IMAGEN_EDITORIAL,
        url: '/images/isadecor-top.jpg',
        alt: null,
        etiqueta: null,
        orden: 1,
      },
      {
        tipo: PublicBusinessUnitResourceType.IMAGEN_EDITORIAL,
        url: '/images/isadecor-left-1.jpg',
        alt: null,
        etiqueta: null,
        orden: 2,
      },
      {
        tipo: PublicBusinessUnitResourceType.IMAGEN_EDITORIAL,
        url: '/images/isadecor-left-2.jpg',
        alt: null,
        etiqueta: null,
        orden: 3,
      },
    ],
  },
};
