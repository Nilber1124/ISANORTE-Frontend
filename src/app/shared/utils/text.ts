/**
 * Utilidades de texto sin expresiones regulares con backtracking.
 * Reemplazan patrones como `/\/+$/` o `/^-+|-+$/g`, que SonarCloud
 * marca por rendimiento super-lineal (typescript:S8786).
 */

/** Elimina todas las apariciones consecutivas de `char` al final del texto. */
export function trimTrailingChar(value: string, char: string): string {
  let end = value.length;
  while (end > 0 && value[end - 1] === char) end--;
  return value.slice(0, end);
}

/** Elimina todas las apariciones consecutivas de `char` al inicio y al final del texto. */
export function trimChar(value: string, char: string): string {
  let start = 0;
  while (start < value.length && value[start] === char) start++;
  return trimTrailingChar(value.slice(start), char);
}

/** Quita las barras finales de una URL base: `https://api.x/` → `https://api.x`. */
export function trimTrailingSlashes(url: string): string {
  return trimTrailingChar(url, '/');
}

/**
 * Validación básica de email equivalente a `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`:
 * sin espacios, un único `@` con texto a ambos lados y un punto interior en el dominio.
 */
export function isValidEmail(value: string): boolean {
  if (/\s/.test(value)) return false;
  const at = value.indexOf('@');
  if (at <= 0 || at !== value.lastIndexOf('@')) return false;
  const domain = value.slice(at + 1);
  return domain.length >= 3 && domain.slice(1, -1).includes('.');
}
