/**
 * Mensaje inicial de WhatsApp según la página que mira el visitante, para que quien responde sepa
 * de inmediato qué le interesa. Función pura: no toca el DOM ni el router.
 */
export function whatsappMessageFor(url: string, siteName: string): string {
  const name = siteName.trim() || 'su empresa';
  const path = url.split(/[?#]/)[0].replace(/\/+$/, '') || '/';

  if (path === '/servicios') return `Hola, quisiera cotizar un servicio de ${name}.`;
  if (path === '/proyectos') {
    return 'Hola, vi sus proyectos en la web y quisiera cotizar una obra similar.';
  }
  if (path.startsWith('/proyectos/')) {
    const slug = path.slice('/proyectos/'.length);
    const title = decodeURIComponent(slug).replace(/-/g, ' ').trim();
    return title
      ? `Hola, vi el proyecto «${title}» en su web y quisiera cotizar algo similar.`
      : 'Hola, vi uno de sus proyectos y quisiera cotizar algo similar.';
  }
  if (path === '/nosotros') return `Hola, quisiera conocer más de ${name}.`;
  if (path === '/contacto') return 'Hola, quisiera cotizar mi proyecto.';
  return `Hola, quisiera cotizar un proyecto con ${name}.`;
}
