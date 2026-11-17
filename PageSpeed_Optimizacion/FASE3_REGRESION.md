# Fase 3: seguimiento de regresión móvil

## Alcance y evidencia

La rama `fix/pagespeed-mobile-regression` parte de `origin/main` (`16dbbf0`). Antes de editar se creó el respaldo remoto `backup/main-before-pagespeed-mobile-regression-20261117`. Se consultaron los informes entregados (`ijuk5x7csd`) en el navegador, sin ejecutar PageSpeed Insights. En el informe móvil el rendimiento era 55 y CLS 0.908; en escritorio el rendimiento era 98. Las mediciones de informes distintos varían y por sí solas no prueban una regresión de código.

## Causas y correcciones retenidas

| ID | Causa identificada | Archivos | Corrección | Estado |
|---|---|---|---|---|
| REG-01 | El hero móvil ocupaba 121.162 bytes y Cloudinary no recibía variantes adaptadas en algunas escenas. | `public/images/recorrido-exterior-mobile.webp`, `src/index.html`, `src/app/shared/utils/cloudinary-image-url.util.ts`, `src/app/features/isanorte/home/public-home.facade.ts`, `src/app/features/isanorte/home/home-hero-fallback.ts`, `src/app/shared/components/cinematic-tour/cinematic-tour.html` | WebP recomprimido a 98.492 bytes (18,7 % menos); preload de la imagen móvil con prioridad alta; `srcset`/`sizes` para anchos adaptables. Se mantienen dimensiones y la imagen visual. | Corregida en código; la mejora publicada queda pendiente de medir. |
| REG-02 | Carruseles de servicios y proyectos participaban en el render inicial aunque están bajo el hero. | `src/app/features/isanorte/home/home.html` | `@defer(on viewport)` con placeholders de altura reservada; conserva contenido y controles al cargar. | Corregida en código; CLS posterior pendiente de medir en producción. |
| REG-03 | Transiciones de color, fondo y sombra provocaban repintados; el hero móvil aplicaba movimiento de cámara. | `src/app/shared/components/button/button.ts`, `src/app/shared/components/card/card.ts`, `src/app/features/isanorte/home/home.html`, `src/app/shared/components/cinematic-tour/cinematic-tour.ts` | Limita transiciones a propiedades transform/opacity en los componentes afectados. En móvil se conserva el fundido del recorrido y se elimina el movimiento de cámara; escritorio mantiene su movimiento. | Corregida en código; evaluación de animaciones posterior pendiente. |
| REG-04 | El informe móvil señaló CLS 0.908 en el contenedor del recorrido, pero la medición local inicial fue 0.057 y no reprodujo ese salto. | Sin cambio específico adicional | Se conservan dimensiones explícitas del hero y placeholders. No se cambió el layout sin poder reproducir el CLS del informe. | Parcialmente corregida; causa del CLS de producción pendiente de capturar en la misma ejecución. |
| REG-05 | LCP móvil alto pese a prioridad de descarga y archivo ligero. | Sin cambio de SSR retenido | Se investigó prerender de `/`, pero no se mantuvo porque el resultado local fue inferior. | Pendiente; ver experimento descartado. |

## Experimento descartado: prerender de la portada

Se habilitó temporalmente `RenderMode.Prerender` para `/`, un fallback de origen API a la URL de producción y una regla de Vercel para servir `index.html`. La compilación prerenderizó una ruta, pero Lighthouse móvil en solitario puntuó 67, frente a 69 con las optimizaciones retenidas y CSR. Se revirtieron las tres modificaciones (`src/app/app.routes.server.ts`, `src/app/core/config/api-server.config.ts`, `vercel.json`). El experimento no forma parte del diff final.

## Validación

Comando de build: `npm.cmd run build`.

| Estado | Móvil | Escritorio | FCP móvil | LCP móvil | TBT móvil | CLS móvil | Transferencia móvil |
|---|---:|---:|---:|---:|---:|---:|---:|
| Línea base local, antes de cambios | 64 | 94 | 3,6 s | 7,0 s | 80 ms | 0,057 | 2.498 KiB |
| Correcciones retenidas, CSR | 69 | 95 | 3,4 s | 6,5 s | 90 ms | 0,057 | 1.674 KiB |
| Prerender probado y retirado | 67 | 93 | 1,1 s | 7,0 s | 60 ms | 0 | 2.205 KiB |

Lighthouse 13.6 local, Edge headless, build de producción servido en `127.0.0.1:4173`, móvil con throttling simulado y escritorio con preset desktop. El prerender se midió en solitario. La versión retenida (69/95) fue medida antes de probar prerender bajo la misma configuración descrita en la bitácora local. Las cifras son variables y no son resultados de PageSpeed Insights ni de producción. El objetivo de 90 móvil continúa pendiente; la versión de escritorio quedó en 95 local. La compilación final después de retirar el experimento de prerender pasó con `Prerendered 0 static routes`; permanece la advertencia existente de presupuesto de `isadecor/home.css` (4,45 KiB frente a 4,00 KiB).

Commit de correcciones retenidas: `2b2718b` (`perf(home): reduce mobile loading work`).

## Publicación y limitaciones

El commit de código `2b2718b` y el commit de documentación `ced8103` se integraron en `main` mediante fast-forward y se publicaron en GitHub. `main` y `fix/pagespeed-mobile-regression` apuntaron a `ced8103`; el respaldo remoto `backup/main-before-pagespeed-mobile-regression-20261117` conserva el estado anterior `16dbbf0`. Vercel registró `Deployment has completed` para el entorno Production del commit `ced8103`.

La URL pública respondió HTTP 200 después del despliegue. La portada actualizó su `Last-Modified` y tamaño HTML; el recurso `/images/recorrido-exterior-mobile.webp` respondió HTTP 200 con `Content-Length: 98492`, ETag nuevo y `X-Vercel-Cache: MISS`, confirmando la imagen publicada. No se midió PageSpeed en producción. No se modificó backend ni base de datos, y no se hicieron pruebas exhaustivas. Las puntuaciones manuales de PSI quedan pendientes del usuario; el 90 móvil no está confirmado.
