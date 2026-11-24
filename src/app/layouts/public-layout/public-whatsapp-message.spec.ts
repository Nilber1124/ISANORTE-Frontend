import { whatsappMessageFor } from './public-whatsapp-message';

describe('whatsappMessageFor', () => {
  it('adapts the message to the page the visitor is on', () => {
    expect(whatsappMessageFor('/', 'ISANORTE')).toBe(
      'Hola, quisiera cotizar un proyecto con ISANORTE.',
    );
    expect(whatsappMessageFor('/servicios', 'ISANORTE')).toContain('cotizar un servicio');
    expect(whatsappMessageFor('/proyectos', 'ISANORTE')).toContain('vi sus proyectos');
    expect(whatsappMessageFor('/nosotros?x=1', 'ISANORTE')).toContain('conocer más de ISANORTE');
    expect(whatsappMessageFor('/contacto#form', 'ISANORTE')).toBe(
      'Hola, quisiera cotizar mi proyecto.',
    );
  });

  it('mentions the project from its slug', () => {
    expect(whatsappMessageFor('/proyectos/villa-lomas-alta', 'ISANORTE')).toBe(
      'Hola, vi el proyecto «villa lomas alta» en su web y quisiera cotizar algo similar.',
    );
  });

  it('falls back to a generic company name', () => {
    expect(whatsappMessageFor('/', '')).toContain('su empresa');
  });

  it('ignores trailing slashes, including a long run of them', () => {
    expect(whatsappMessageFor('/servicios///', 'ISANORTE')).toBe(
      whatsappMessageFor('/servicios', 'ISANORTE'),
    );
    const start = performance.now();
    whatsappMessageFor(`/${'/'.repeat(100_000)}x`, 'ISANORTE');
    expect(performance.now() - start).toBeLessThan(200);
  });
});
