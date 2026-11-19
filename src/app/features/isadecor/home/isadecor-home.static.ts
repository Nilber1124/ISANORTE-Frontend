import { HomeBenefit, HomeScene } from './isadecor-home.model';

/**
 * Contenido FIJO del Home: no se edita desde el administrador porque depende de los archivos de
 * `public/media/isadecor` (video "Arma tu ambiente") o es una promesa comercial de la marca.
 * Todo lo demás llega del backend.
 */
export const HOME_HERO_VISUAL = {
  imagenUrl: '/media/isadecor/arma-ambiente-poster.webp',
  imagenAlt: 'Sala amoblada con paredes blancas sin acabados',
  placeholderBuscador: 'Busca "panel nogal", "piso SPC"…',
} as const;

export const HOME_SCENE: HomeScene = {
  titulo: 'Arma tu ambiente',
  descripcion: 'Mira cómo cambia una sala con cada acabado.',
  videoUrl: '/media/isadecor/arma-ambiente.mp4',
  videoLigeroUrl: '/media/isadecor/arma-ambiente-sm.mp4',
  posterUrl: '/media/isadecor/arma-ambiente-poster.webp',
  posterFinalUrl: '/media/isadecor/arma-ambiente-final.webp',
  pasos: [
    {
      etiqueta: 'Paredes',
      tiempo: 4.4,
      enfoque: { x: 30, y: 50 },
      categoria: {
        nombre: 'Paredes',
        slug: 'paredes',
        descripcion: 'Paneles WPC, planchas tipo mármol SPC, bambú y decorativos 3D',
        imagenUrl: '/media/isadecor/cat-paredes.webp',
      },
    },
    {
      etiqueta: 'Piso',
      tiempo: 6.0,
      enfoque: { x: 50, y: 100 },
      categoria: {
        nombre: 'Pisos',
        slug: 'pisos',
        descripcion: 'SPC de alto tránsito y autoadhesivos',
        imagenUrl: '/media/isadecor/cat-pisos.webp',
      },
    },
    {
      etiqueta: 'Cielo raso',
      tiempo: 7.8,
      enfoque: { x: 60, y: 0 },
      categoria: {
        nombre: 'Techos',
        slug: 'techos',
        descripcion: 'Cielos rasos PVC',
        imagenUrl: '/media/isadecor/cat-techos.webp',
      },
    },
    {
      etiqueta: 'Separador',
      tiempo: 9.3,
      enfoque: { x: 0, y: 50 },
      categoria: {
        nombre: 'Exterior y estructura',
        slug: 'exterior-estructura',
        descripcion: 'Listones WPC, wallpanel exterior y panel sándwich',
        imagenUrl: '/media/isadecor/cat-listones.webp',
      },
    },
  ],
};

export const HOME_BENEFITS: readonly HomeBenefit[] = [
  {
    titulo: 'Envíos a todo el Perú',
    descripcion: 'Lima y provincias por agencia; coordinamos el flete contigo.',
    icono: 'envio',
  },
  {
    titulo: 'Instalación con técnicos',
    descripcion: 'Equipo propio en Cajamarca. Pide visita y presupuesto.',
    icono: 'instalacion',
  },
  {
    titulo: 'Garantía de fábrica',
    descripcion: 'Respaldo escrito en cada producto.',
    icono: 'garantia',
  },
  { titulo: 'Pago flexible', descripcion: 'Transferencia, Yape o Plin, y tarjeta.', icono: 'pago' },
];
