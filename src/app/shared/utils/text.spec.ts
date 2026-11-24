import { trimTrailingAny } from './text';

describe('trimTrailingAny', () => {
  it('removes trailing whitespace and the given characters, keeping the rest', () => {
    expect(trimTrailingAny('Obras llave en mano, ;: –-  ', ',.;:–-')).toBe('Obras llave en mano');
    expect(trimTrailingAny('a-b.c', ',.;:–-')).toBe('a-b.c');
  });

  it('handles empty and fully trimmable text', () => {
    expect(trimTrailingAny('', ',.')).toBe('');
    expect(trimTrailingAny(' ,. ', ',.')).toBe('');
  });

  it('runs in linear time on long runs that are not at the end', () => {
    const adversarial = `${','.repeat(200_000)}x`;
    const start = performance.now();
    expect(trimTrailingAny(adversarial, ',')).toBe(adversarial);
    expect(performance.now() - start).toBeLessThan(200);
  });
});
