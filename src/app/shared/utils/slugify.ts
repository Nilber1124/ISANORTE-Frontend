import { trimChar } from './text';
/**
 * Utility to generate URL-safe slugs automatically from human-readable text.
 */
export function slugify(value: string): string {
  const dashed = value
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-');
  return trimChar(dashed, '-');
}
