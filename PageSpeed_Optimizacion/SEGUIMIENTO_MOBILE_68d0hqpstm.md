# Seguimiento móvil PageSpeed — informe `68d0hqpstm`

## Línea base del informe

Informe móvil compartido por el usuario, generado el 17 de noviembre de 2026 a las 2:46 p. m. GMT-5 para `https://isanorte-frontend.vercel.app/`. Se abrió y desplegó con Playwright. No se ejecutó una evaluación nueva.

| Rendimiento | Accesibilidad | Buenas prácticas | SEO | LCP | TBT | CLS | Speed Index |
|---:|---:|---:|---:|---:|---:|---:|---:|
| 74 | 100 | 96 | 100 | 5,6 s | 0 ms | 0,057 | 5,5 s |

### Diagnósticos concretos leídos

- Entrega de imágenes: ahorro estimado 434 KiB. La auditoría listó una imagen de casasinhaus.com de 297 KiB (ahorro 169,7 KiB), `/images/isadecor-fondo.jpg` de 549,4 KiB (149,4 KiB), `/images/recorrido-exterior.webp` de 218 KiB (108,9 KiB) y `/images/asesora-consultoria.jpg` de 631,5 KiB (6,5 KiB).
- Descubrimiento de LCP: pasa; el elemento actual ya lleva `fetchpriority="high"`, se encuentra en el documento inicial y no usa lazy loading.
- LCP: TTFB 0 ms, demora de recurso 450 ms, descarga 230 ms y renderizado 10 ms. El elemento LCP es la imagen del recorrido exterior.
- Árbol de red: latencia crítica reportada de 10.461 ms por solicitudes a `isanorte-backend.onrender.com` (`sitios/isanorte`, `isanorte/home` y anuncios). PSI también registra esas solicitudes como `ERR_TIMED_OUT` en consola.
- Caché: ahorro estimado 216 KiB para una imagen de 270 KiB servida por `media.revistaad.es` con vida de caché de una hora.
- CLS: 0,057 atribuido a la sección de proyectos. La tabla también señala el logo ISANORTE como imagen sin tamaño aunque el HTML actual ya especifica `width` y `height`.
- JavaScript sin uso: 32,3 KiB estimados en `chunk--q916v6L.js`. Una tarea propia de 58 ms en el mismo chunk; TBT medido 0 ms.
- Enlaces con mismo texto y diferentes destinos: cuatro enlaces «Abrir detalle» de tarjetas de proyecto.

## Correcciones de este seguimiento

### MOB-FU-01 — Comprimir y dimensionar las imágenes locales que PSI identificó

- **Causa:** el respaldo de la unidad de negocio se servía como JPEG de 1920×1280 y 562.594 bytes; el fallback del hero se servía como WebP de 1600×1067 y 223.274 bytes.
- **Recomendación PSI:** usar un formato eficiente y tamaño apropiado para reducir transferencia.
- **Archivos:** `public/images/isadecor-fondo.webp`, `public/images/recorrido-exterior-mobile.webp`; referencias actualizadas en `home-business-unit-fallback.ts`, `isadecor/home.ts`, `admin-isadecor-landing.ts` y `home-hero-fallback.ts`.
- **Antes:** `/images/isadecor-fondo.jpg` y `/images/recorrido-exterior.webp`.
- **Después:** `/images/isadecor-fondo.webp` (1600×1067) y `/images/recorrido-exterior-mobile.webp` (1280×853), ambos WebP.
- **Resultado comprobable en archivos locales:** ISADEcor 562.594 → 202.184 bytes (−360.410; 64,1 %); hero 223.274 → 121.162 bytes (−102.112; 45,7 %). Total de estos archivos: −462.522 bytes. Esto no confirma la transferencia total, el LCP ni la puntuación de PSI.
- **Justificación:** se conservan las imágenes y sus encuadres CSS; las dimensiones aún superan el tamaño móvil objetivo y sirven los usos responsive de Home, ISADECOR y administración. El JPEG original no se elimina.
- **Validación:** build de producción; PSI no repetido.
- **Commit:** `01b952e`.
- **Estado:** Corregida en código; métricas de ejecución pendientes.

### MOB-FU-02 — Deferir las imágenes de tarjetas de servicios

- **Causa:** los fondos CSS de tarjetas podían iniciar descargas de imágenes de servicios (incluyendo el recurso remoto de 297 KiB) sin control de carga diferida.
- **Recomendación PSI:** retrasar imágenes fuera del contenido que se necesita al inicio.
- **Archivo:** `src/app/features/isanorte/home/home.html`.
- **Antes:** `div` con `background-image` para cada servicio.
- **Después:** `<img loading="lazy" decoding="async">` dentro de la tarjeta, manteniendo el mismo encuadre `object-cover`, animación de hover y etiqueta accesible de la tarjeta. La imagen es decorativa porque la tarjeta ya tiene nombre accesible con el título del servicio.
- **Justificación:** permite al navegador diferir medios no requeridos inmediatamente, sin retirar tarjetas ni enlaces. El navegador decide el umbral real de carga.
- **Validación:** build de producción; el waterfall no se volvió a medir.
- **Commit:** `01b952e`.
- **Estado:** Corregida en código; efecto en solicitudes pendientes de medición.

### MOB-FU-03 — Dar nombres accesibles específicos a enlaces de proyecto

- **Problema:** PSI encuentra cuatro enlaces «Abrir detalle» asociados a diferentes proyectos.
- **Causa:** `app-card` usa ese nombre genérico cuando no recibe `ariaLabel`.
- **Archivo:** `src/app/features/isanorte/home/home.html`.
- **Antes:** `<app-card [href]="'/proyectos/' + project.slug" ...>`.
- **Después:** `[ariaLabel]="'Abrir proyecto: ' + project.title"`.
- **Justificación:** el nombre anuncia el destino particular y sigue siendo idéntico en los clones del mismo enlace dentro del carrusel.
- **Validación:** build de producción; no se repitió la auditoría de accesibilidad.
- **Commit:** `fb385a3`.
- **Estado:** Corregida en código.

## Hallazgos pendientes o fuera del control frontend

- **Tiempo de respuesta y errores de Render — No aplicable en esta rama:** los errores `ERR_TIMED_OUT` vienen del host backend; esta tarea es exclusivamente frontend. La aplicación mantiene sus fallbacks existentes. Investigar latencia de origen requiere observabilidad/cambios operativos en Render o backend y no se hizo.
- **Caché de revistaad.es — No aplicable (justificada):** el recurso y sus cabeceras pertenecen a un tercero. No se modificó Vercel ni se copió contenido externo al sitio.
- **Imagen casasinhaus.com — Pendiente:** pertenece a un dominio externo y no expone transformaciones conocidas. No se cambió proveedor ni imagen comercial.
- **`asesora-consultoria.jpg` — Sin cambio:** PSI estima solo 6,5 KiB de ahorro; no justifica reemplazar un recurso compartido por una ganancia marginal sin evidencia visual adicional.
- **LCP discovery — Ya corregida antes:** fetchpriority alta y descubrimiento en HTML pasan en el informe actual; no se repitió.
- **CLS / logo — Pendiente de nueva evidencia:** el reporte menciona dimensiones aunque ya constan `width="920" height="328"`. No se alteró el layout sin una causa distinta demostrada.
- **32,3 KiB de JS sin uso y tarea de 58 ms — Pendiente:** TBT es 0 ms y PSI no vincula el ahorro a una función segura de retirar. No se añadieron source maps de producción porque no son una mejora de rendimiento y pueden exponer fuentes.
- **Caché de recursos propios, cabeceras Vercel — Sin cambio:** la oportunidad específica reportada es una URL de un tercero. No se cambió configuración de despliegue.

## Validación y publicación

- `npm.cmd run build` — **aprobado**. Angular generó bundles browser y server; se mantiene la advertencia preexistente de `isadecor/home.css` (4,45 KiB frente a un presupuesto de 4 KiB). La salida informa 0 rutas prerenderizadas, igual que la configuración de esta aplicación.
- `git diff --check` — aprobado.
- Pruebas exhaustivas y nueva medición PSI: no ejecutadas, de acuerdo con la solicitud.
- Escritorio: no hay un informe nuevo en esta solicitud; la rama limita sus cambios a optimización de imágenes, carga diferida de tarjetas y etiquetas accesibles, pero no se declara una puntuación posterior.
- Rama base: `main` en `83dc2ff9b2393642ac9ccf3b06e9564259eef5bf`.
- Commits de código: `01b952e` (imágenes/carga) y `fb385a3` (etiquetas de enlaces).
- No se afirma mejora de puntuación sin una nueva evaluación, que el usuario realizará manualmente.
