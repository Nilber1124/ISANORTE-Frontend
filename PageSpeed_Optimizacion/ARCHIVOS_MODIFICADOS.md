# Archivos modificados — Fase 2

## Código y recursos de esta rama

### Rendimiento — commit `8f9fc1d`

- `src/app/app.routes.ts` — cambia importaciones de rutas secundarias por `loadComponent`; conserva guards y páginas.
- `src/app/app.spec.ts` — actualiza la expectativa de aislamiento de ISADECOR para comprobar la carga diferida.
- `src/app/features/isanorte/home/home-hero-fallback.ts` — apunta a WebP en el fallback local del hero.
- `src/app/shared/components/cinematic-tour/cinematic-tour.html` — deja solo la primera imagen en el HTML inicial.
- `src/app/shared/components/cinematic-tour/cinematic-tour.ts` — programa la carga de escenas y elimina animación `filter`.
- `public/images/recorrido-bano.webp` — generado desde el respaldo JPEG existente.
- `public/images/recorrido-cocina.webp` — generado desde el respaldo JPEG existente.
- `public/images/recorrido-dormitorio.webp` — generado desde el respaldo JPEG existente.
- `public/images/recorrido-exterior.webp` — generado desde el respaldo JPEG existente.
- `public/images/recorrido-sala.webp` — generado desde el respaldo JPEG existente.

### Accesibilidad — commit `8c6f4f4`

- `src/app/layouts/public-layout/navbar/navbar.html` — dimensiones del logo y alto mínimo de enlaces desktop.
- `src/app/layouts/public-layout/footer/footer.html` — tema oscuro semántico, dimensiones del logo, blancos táctiles de 44 px y títulos h2.

### Documentación de esta fase

- `PageSpeed_Optimizacion/REPORTE_CORRECCIONES.md`
- `PageSpeed_Optimizacion/MATRIZ_INCIDENCIAS.csv`
- `PageSpeed_Optimizacion/ARCHIVOS_MODIFICADOS.md`
- `PageSpeed_Optimizacion/RESULTADOS_VALIDACION.md`
- `PageSpeed_Optimizacion/PROMPT_UTILIZADO.md`

## Cambios preexistentes conservados y excluidos de los commits

Al iniciar había eliminaciones de `docs/DESIGN_SYSTEM.md` y `docs/ESTRUCTURA_ACTUAL.md`, cambios en `package.json` y `package-lock.json`, y elementos sin seguimiento en `PageSpeed_ISANORTE_Escritorio/`, `PageSpeed_ISANORTE_Movil/` y `tools/`. No los revertí ni los agregué a los commits de esta tarea. Los documentos `docs/DESIGN_SYSTEM.md` y `docs/ESTRUCTURA_ACTUAL.md` no estaban disponibles para lectura al comenzar.

No se modificó backend ni `vercel.json`; no se hizo push ni merge.
