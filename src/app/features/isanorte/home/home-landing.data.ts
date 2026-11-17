/**
 * TRANSITORIO. Contenido y utilidades que el nuevo diseño necesita y que la API
 * aún no entrega. Ver `docs/landing/BACKEND-PENDIENTE.md`. Al integrarse con el
 * backend, cada bloque se reemplaza por contenido administrable.
 */

export interface HomeProcessStep {
  readonly id: string;
  readonly title: string;
  readonly text: string;
}

export const HOME_PROCESS: {
  readonly eyebrow: string;
  readonly title: string;
  readonly steps: readonly HomeProcessStep[];
} = {
  eyebrow: 'Cómo trabajamos',
  title: 'Del terreno a la llave en mano, con un solo equipo',
  steps: [
    {
      id: 'consulta',
      title: 'Consulta y terreno',
      text: 'Visitamos el lugar, revisamos la situación legal y el levantamiento topográfico, y definimos qué es posible construir.',
    },
    {
      id: 'diseno',
      title: 'Diseño y planos',
      text: 'Elaboramos los planos de arquitectura y especialidades, y gestionamos los permisos y las habilitaciones necesarias.',
    },
    {
      id: 'ejecucion',
      title: 'Ejecución y supervisión',
      text: 'Construimos con supervisión técnica en cada etapa, para cuidar plazos, calidad y presupuesto.',
    },
    {
      id: 'entrega',
      title: 'Entrega',
      text: 'Revisamos acabados y detalles contigo y te entregamos la obra lista para habitarla.',
    },
  ],
};

export const HOME_TRUST_POINTS: readonly string[] = [
  'Planos, permisos y obra con un solo equipo',
  'Saneamiento físico legal y habilitaciones urbanas',
  'Supervisión técnica en cada etapa',
];

export const HOME_ISADECOR_OFFER: readonly string[] = [
  'Mobiliario a medida',
  'Cocinas y closets',
  'Diseño de interiores',
  'Acabados y revestimientos',
];

/** Etapas del riel lateral; coinciden con los `id` de las secciones del Home. */
export const HOME_RAIL: readonly { readonly id: string; readonly label: string }[] = [
  { id: 'servicios', label: 'Servicios' },
  { id: 'proceso', label: 'Proceso' },
  { id: 'proyectos', label: 'Proyectos' },
  { id: 'isadecor', label: 'ISADECOR' },
  { id: 'cotizar', label: 'Cotizar' },
];

/** Iconos outline (trazos de 24x24) elegidos por palabras del nombre del servicio. */
const SERVICE_ICONS: readonly { readonly match: RegExp; readonly path: string }[] = [
  { match: /plano|dise[ñn]o y elab|arquitect/i, path: 'M4 4h16v16H4zM4 9h16M9 9v11' },
  { match: /ejecuci|supervis|construcc/i, path: 'M3 21h18M5 21V9l7-5 7 5v12M10 21v-6h4v6' },
  { match: /topogr|levantam/i, path: 'M12 3v18M3 12h18M7 7l10 10M17 7 7 17' },
  { match: /saneam|legal/i, path: 'M6 3h9l3 3v15H6zM9 11h6M9 15h6M9 7h3' },
  { match: /habilit|urban|lote/i, path: 'M3 20V10l6-4 6 4v10M15 20V8l6 3v9M3 20h18' },
  { match: /remodel|acabad|revest/i, path: 'M4 20l9-9 3 3-9 9H4zM13 7l2-2 4 4-2 2z' },
  {
    match: /interior|decor|mobil/i,
    path: 'M5 11V7a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v4M3 11h18v6H3zM6 17v3M18 17v3',
  },
  { match: /met[aá]lic|estructur|acero/i, path: 'M3 6h18M3 12h18M3 18h18M7 3v18M17 3v18' },
];

const GENERIC_ICON = 'M3 21h18M6 21V8l6-4 6 4v13M10 12h4M10 16h4';

export function serviceIconPath(name: string): string {
  return SERVICE_ICONS.find((icon) => icon.match.test(name))?.path ?? GENERIC_ICON;
}

/** Enlaces estructurales de acciones que la API aún entrega como anclas sueltas (`#`, `#cotizar`). */
export function resolveHomeUrl(url: string, fallback: string): string {
  if (url === '#cotizar' || url === '#contacto') return '/contacto';
  if (url === '#' || url === '') return fallback;
  if (url === '#isadecor') return '/isadecor';
  return url;
}
