/** Bloque de la descripción: un párrafo o una lista de viñetas. */
export type DescriptionBlock =
  | { readonly type: 'p'; readonly text: string }
  | { readonly type: 'ul'; readonly items: readonly string[] };

const BULLET_MARKS = '-•*';

/** Texto de una viñeta («- texto», «• texto», «* texto») o `null`; sin expresión regular con backtracking. */
function bulletText(raw: string): string | null {
  const line = raw.trimStart();
  if (line.length < 2 || !BULLET_MARKS.includes(line[0]) || line[1].trim() !== '') return null;
  return line.slice(1).trim();
}

/**
 * Convierte la descripción del administrador en bloques: las líneas que empiezan con «- » son
 * viñetas, y el resto se agrupa en párrafos separados por líneas en blanco.
 */
export function parseDescription(text: string): DescriptionBlock[] {
  const blocks: DescriptionBlock[] = [];
  let paragraph: string[] = [];
  let bullets: string[] = [];

  const flushParagraph = (): void => {
    if (paragraph.length) blocks.push({ type: 'p', text: paragraph.join(' ') });
    paragraph = [];
  };
  const flushBullets = (): void => {
    if (bullets.length) blocks.push({ type: 'ul', items: bullets });
    bullets = [];
  };

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    const bullet = bulletText(raw);
    if (!line) {
      flushParagraph();
      flushBullets();
    } else if (bullet !== null) {
      flushParagraph();
      bullets.push(bullet);
    } else {
      flushBullets();
      paragraph.push(line);
    }
  }
  flushParagraph();
  flushBullets();
  return blocks;
}

/** Cantidad de caracteres a partir de la cual la descripción se ofrece con «Mostrar más». */
export const LONG_DESCRIPTION_CHARS = 700;
