/**
 * Encabezados de los bloques de la Home que se pueden editar desde el admin (tabla `textos_bloque`).
 * Si un bloque no tiene texto guardado, la Home muestra el texto por defecto de aquí; el admin lo usa
 * como valor de partida al editarlo.
 */
export type BlockKey =
  | 'garantias'
  | 'testimonios'
  | 'preguntas'
  | 'proceso'
  | 'equipo'
  | 'credenciales'
  | 'cobertura';
export type BlockTextField = 'etiqueta' | 'titulo' | 'subtitulo';

export const BLOCK_TEXT_LABELS: Readonly<Record<BlockTextField, string>> = {
  etiqueta: 'Frase pequeña sobre el título',
  titulo: 'Título',
  subtitulo: 'Subtítulo',
};

export const BLOCK_TEXT_DEFAULTS: Readonly<
  Record<BlockKey, Readonly<Partial<Record<BlockTextField, string>>>>
> = {
  garantias: {
    etiqueta: 'Nuestro compromiso',
    titulo: 'Por qué elegir a ISANORTE',
    subtitulo: 'Compromisos concretos, por escrito, para que construir sea tranquilo.',
  },
  testimonios: {
    etiqueta: 'Testimonios',
    titulo: 'Lo que dicen nuestros clientes',
  },
  preguntas: {
    etiqueta: 'Dudas comunes',
    titulo: 'Preguntas frecuentes',
    subtitulo: 'Respondemos lo que más nos preguntan antes de empezar una obra.',
  },
  proceso: {
    titulo: 'Del terreno a la llave en mano, con un solo equipo',
  },
  equipo: {
    titulo: 'El equipo detrás de cada obra',
  },
  credenciales: {
    etiqueta: 'Respaldo',
    titulo: 'Credenciales y respaldo',
    subtitulo: 'Registros, colegiaturas y licencias vigentes de la empresa y de su equipo técnico.',
  },
  cobertura: {
    etiqueta: 'Cobertura',
    titulo: 'Dónde trabajamos',
    subtitulo: 'Construimos en la ciudad y en las provincias de la región, con equipo propio en obra.',
  },
};

export function isBlockKey(value: string): value is BlockKey {
  return value in BLOCK_TEXT_DEFAULTS;
}
