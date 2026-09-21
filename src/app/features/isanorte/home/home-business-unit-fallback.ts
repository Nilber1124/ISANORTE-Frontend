import {
  PublicBusinessUnitResource,
  PublicBusinessUnitResourceType,
} from '../../../data/models/public-content/public-home.model';
import { HomeBusinessUnitActionView } from './home-view.model';

/**
 * TRANSITORIO — Fase 3C.
 * Sólo se usa cuando el GET único de Home falla completamente. Una respuesta
 * correcta sin unidad o sin recursos nunca restaura estos valores locales.
 */
export const HOME_BUSINESS_UNIT_FALLBACK: {
  readonly header: { eyebrow: string; title: string };
  readonly unit: { nombre: string; descripcion: string };
  readonly background: PublicBusinessUnitResource;
  readonly editorials: readonly PublicBusinessUnitResource[];
  readonly actions: readonly HomeBusinessUnitActionView[];
} = {
  header: {
    eyebrow: 'NUEVA LÍNEA DE MOBILIARIO A MEDIDA',
    title: 'ISADECOR: Espacios que\ninspiran.',
  },
  unit: {
    nombre: 'ISADECOR',
    descripcion:
      'Diseño interior y mobiliario a medida. Creamos atmósferas únicas que reflejan la esencia de quienes las habitan, uniendo materiales premium con estética atemporal.',
  },
  background: {
    tipo: PublicBusinessUnitResourceType.IMAGEN_FONDO,
    url: '/images/isadecor-fondo.jpg',
    alt: null,
    etiqueta: null,
    orden: 0,
  },
  editorials: [
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
  actions: [
    { label: 'CONOCE ISADECOR', url: '#isadecor', order: 0 },
    { label: 'DESCARGAR CATÁLOGO (PDF)', url: '#catalogo', order: 1 },
  ],
};
