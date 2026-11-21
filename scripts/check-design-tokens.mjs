#!/usr/bin/env node
/**
 * Comprueba que el admin use los tokens del sistema de diseño (Showroom) y no valores fijos:
 * radios y tamaños de texto de Tailwind por defecto, tamaños en px/rem arbitrarios y paletas
 * de color fijas. Uso: `npm run lint:tokens`.
 *
 * Excepciones: una línea con `design-tokens-ignore` se salta (p. ej. maquetas que imitan la web).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOTS = ['src/app/features/admin', 'src/app/layouts/admin-layout'];
const EXT = /\.(html|ts)$/;
const SKIP = /\.spec\.ts$/;

const RULES = [
  { re: /\brounded-(xl|2xl|3xl|lg|md|sm)\b/, hint: 'usa rounded-control / rounded-card / rounded-panel' },
  { re: /\brounded-[trbl]{1,2}-(xl|2xl|3xl|lg|md|sm)\b/, hint: 'usa un radio con token' },
  { re: /\btext-\[[0-9.]+(px|rem|em)\]/, hint: 'usa text-caption / text-body-sm / text-body / text-heading-*' },
  { re: /\btext-(xs|sm|base|lg|xl|2xl|3xl|4xl)\b/, hint: 'usa los tamaños con nombre (text-caption, text-body-sm…)' },
  { re: /\b(bg|text|border|ring|fill|stroke)-(red|amber|orange|yellow|green|emerald|blue|sky|indigo|violet|purple|pink|rose|gray|slate|zinc|neutral|stone)-[0-9]+/, hint: 'usa colores con token (error, warning, success, info, accent…)' },
  { re: /\b(bg|text|border)-\[#[0-9a-fA-F]{3,8}\]/, hint: 'usa colores con token' },
];

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) yield* walk(path);
    else if (EXT.test(name) && !SKIP.test(name)) yield path;
  }
}

const problems = [];
for (const root of ROOTS) {
  for (const file of walk(root)) {
    readFileSync(file, 'utf8')
      .split('\n')
      .forEach((line, index) => {
        if (line.includes('design-tokens-ignore')) return;
        for (const { re, hint } of RULES) {
          const match = line.match(re);
          if (match) problems.push(`${relative('.', file)}:${index + 1}  ${match[0]}  → ${hint}`);
        }
      });
  }
}

if (problems.length > 0) {
  console.error(`Valores fijos en el admin (${problems.length}):\n` + problems.join('\n'));
  process.exit(1);
}
console.log('Admin sin valores fijos: todo usa tokens.');
