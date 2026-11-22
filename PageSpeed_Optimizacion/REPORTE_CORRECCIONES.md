# Reporte de correcciones PageSpeed — Fase 2

## Alcance y punto de partida

Se analizaron los informes y evidencias de `PageSpeed_ISANORTE_Movil/` y `PageSpeed_ISANORTE_Escritorio/`, generados el 16 de noviembre de 2026 sobre la URL pública. La línea base reporta rendimiento **72 móvil / 85 escritorio**, accesibilidad **92**, LCP **13.3 s móvil / 2.4 s escritorio**, CLS **0.057 / 0.074**, y transferencia total de **5,637 KiB / 6,322 KiB**. No se ejecutó una medición nueva, por lo que ninguna mejora de puntuación o métrica se considera confirmada.

La rama es `fix/pagespeed-performance`, creada desde `develop`. Los cambios ya pendientes antes de esta tarea (eliminaciones en `docs/`, cambios de `package.json`/`package-lock.json` y carpetas de informes/herramientas sin seguimiento) se conservaron sin agregarlos a los commits.

## Incidencias

### PS-01 — Peso/formato de imágenes del hero

- **Problema / recomendación PSI:** entrega de imágenes; ahorro estimado de 444 KiB móvil y 596 KiB escritorio. Usar formatos modernos y tamaños apropiados.
- **Causa:** los respaldos locales del hero eran cinco JPEG que sumaban 1,799,472 bytes.
- **Archivos:** `public/images/recorrido-{exterior,sala,cocina,bano,dormitorio}.webp`; `src/app/features/isanorte/home/home-hero-fallback.ts`.
- **Antes:** `{ id: 'fallback-exterior', imageUrl: '/images/recorrido-exterior.jpg' }`.
- **Después:** `{ id: 'fallback-exterior', imageUrl: '/images/recorrido-exterior.webp' }`.
- **Resultado de archivo:** los WebP suman 781,552 bytes (reducción de 1,017,920 bytes, 56.6%, calculada comparando archivos locales). Esto no mide la respuesta visual ni la imagen que entregue el backend.
- **Justificación:** se reduce la transferencia del respaldo sin cambiar el contenido ni el encuadre. Las escenas cargadas desde el backend siguen bajo control del contenido/servidor.
- **Verificación:** build de producción aprobado; no hay Lighthouse posterior.
- **Commit:** `8f9fc1d`.
- **Estado:** Parcialmente corregida.

### PS-02 — Descubrimiento de la imagen LCP

- **Problema / recomendación PSI:** el recurso LCP debería ser descubrible temprano y tener prioridad alta.
- **Causa identificada:** el hero expresa sus fotografías como fondos CSS provenientes de una respuesta de contenido dinámica; el primer recurso no está declarado como `<img>` ni como preload en el HTML estático.
- **Archivos:** `src/app/shared/components/cinematic-tour/cinematic-tour.html`, `cinematic-tour.ts`.
- **Antes:** cada capa renderizaba `[style.backgroundImage]="'url(' + scene.imageUrl + ')'"`.
- **Después:** solo la primera capa se renderiza con imagen; las siguientes se asignan a medida que se acercan a su transición.
- **Justificación:** evita iniciar todas las descargas del hero simultáneamente y conserva las escenas. El primer fondo sigue siendo dinámico, así que su descubrimiento/prelación no queda resuelto.
- **Verificación:** build aprobado; sin traza LCP nueva.
- **Commit:** `8f9fc1d`.
- **Estado:** Parcialmente corregida.

### PS-03 — Árbol de dependencias de red

- **Problema / recomendación PSI:** acortar cadenas críticas y posponer recursos que no se necesitan en la vista inicial.
- **Causa:** se importaban rutas de páginas públicas e ISADECOR de forma estática, y se solicitaban a la vez todas las escenas cinematográficas.
- **Archivos:** `src/app/app.routes.ts`, `src/app/shared/components/cinematic-tour/cinematic-tour.ts`.
- **Antes:** rutas como `nosotros` y `isadecor/productos` usaban componentes importados estáticamente.
- **Después:** esas rutas usan `loadComponent`; las escenas siguientes se solicitan progresivamente.
- **Justificación:** separa código por ruta y posterga imágenes que aún no participan de la escena visible.
- **Verificación:** build de producción genera chunks lazy; el initial bundle reportado por Angular es 567.03 kB raw / 135.85 kB estimados transferidos. No se dispone de comparación contra bundle anterior.
- **Commit:** `8f9fc1d`.
- **Estado:** Parcialmente corregida.

### PS-04 — Cache de recursos estáticos

- **Problema / recomendación PSI:** el informe estima 8 KiB de ahorro por tiempos de caché.
- **Causa:** Vercel sirve los archivos estáticos y `vercel.json` no contiene encabezados de caché personalizados.
- **Archivo revisado:** `vercel.json`.
- **Antes / después:** sin cambios; no se modificó la configuración de publicación.
- **Justificación:** esta tarea prohíbe alterar el despliegue actual en Vercel. El servidor Express local ya define `maxAge: '1y'`, pero no prueba la política aplicada por Vercel.
- **Verificación:** inspección de configuración; no se midieron encabezados de producción.
- **Commit:** ninguno.
- **Estado:** No aplicable (justificada en esta fase).

### PS-05 — Causantes de desplazamiento (CLS)

- **Problema / recomendación PSI:** reservar espacio para medios/contenido antes de su carga.
- **Causa:** los logos del navbar y footer carecían de atributos de dimensiones; el contenido dinámico y sus imágenes remotas también pueden cambiar por respuesta del backend.
- **Archivos:** `src/app/layouts/public-layout/navbar/navbar.html`, `footer/footer.html`.
- **Antes:** `<img class="h-10 w-auto ...">`.
- **Después:** `<img width="920" height="328" class="h-10 w-auto ...">`.
- **Justificación:** el SVG de marca tiene esa proporción intrínseca y las dimensiones reservan su caja. Los cambios dinámicos de contenido no se modificaron.
- **Verificación:** build aprobado; CLS requiere medición posterior.
- **Commit:** `8c6f4f4`.
- **Estado:** Parcialmente corregida.

### PS-06 — Desglose de LCP

- **Problema / recomendación PSI:** optimizar la fase dominante entre TTFB, demora, descarga y renderizado.
- **Causa:** los JSON y capturas disponibles no incluyen la tabla de subpartes/elemento LCP con tiempos desglosados.
- **Archivos modificados:** ninguno específicamente.
- **Antes / después:** no hay evidencia suficiente para atribuir una fase; no se inventó una causa.
- **Justificación:** se necesita un informe Lighthouse nuevo con detalle de LCP para elegir una intervención sin conjeturas.
- **Verificación:** revisión de informes guardados; no hay traza nueva.
- **Commit:** ninguno.
- **Estado:** Pendiente.

### PS-07 — Recursos de terceros

- **Problema / recomendación PSI:** reducir y aplazar código de terceros.
- **Causa:** el informe guardado solo enumera la auditoría “Terceros”, sin identificar solicitudes concretas. El mapa del footer usa `loading="lazy"` en el componente compartido y no se halló una etiqueta de script externa en la portada.
- **Archivos modificados:** ninguno.
- **Antes / después:** el mapa conserva su carga diferida existente.
- **Justificación:** sin solicitudes y contribución LCP identificadas, eliminar o cambiar servicios podría afectar navegación/contacto.
- **Verificación:** inspección de templates; falta waterfall nuevo.
- **Commit:** ninguno.
- **Estado:** No aplicable (la evidencia no identifica un tercero crítico adicional; validar si una traza nueva lo señala).

### PS-08 — JavaScript sin usar

- **Problema / recomendación PSI:** PSI estima 331 KiB de JavaScript no utilizado en la vista evaluada.
- **Causa:** páginas públicas secundarias y la tienda compartían el grafo inicial de imports.
- **Archivos:** `src/app/app.routes.ts`.
- **Antes:** imports estáticos de `About`, `Services`, `Projects`, `Contact` y páginas ISADECOR.
- **Después:** rutas secundarias y rutas ISADECOR cargan componentes con `loadComponent`; Home de ISANORTE sigue en el arranque.
- **Justificación:** separa funcionalidades sin retirar rutas ni funciones. El tamaño PSI no se considera corregido hasta comparar una auditoría nueva.
- **Verificación:** build muestra chunks diferidos, incluido `isadecor-layout`; sin PSI posterior.
- **Commit:** `8f9fc1d`.
- **Estado:** Parcialmente corregida.

### PS-09 — Dimensiones explícitas de imágenes

- **Problema / recomendación PSI:** los elementos de imagen no tenían `width`/`height`.
- **Causa:** logos visibles del layout público sin esos atributos.
- **Archivos:** navbar y footer públicos.
- **Antes:** `<img [src]="..." [alt]="...">` sin dimensiones HTML.
- **Después:** `width="920" height="328"` acorde al viewBox del logo, manteniendo el tamaño visual CSS.
- **Justificación:** reserva proporción antes de descargar la imagen. Las tarjetas con fotografías dinámicas usan fondos y proporciones de contenedor; el backend conserva sus recursos.
- **Verificación:** build aprobado; no se midió CLS con Lighthouse.
- **Commit:** `8c6f4f4`.
- **Estado:** Corregida en código.

### PS-10 — Tamaño total transferido

- **Problema / recomendación PSI:** 5,637 KiB móvil y 6,322 KiB escritorio.
- **Causa:** las cinco imágenes locales del recorrido se descargaban por fondos CSS al crear las capas; además, rutas de ISADECOR no eran diferidas.
- **Archivos:** rutas, `CinematicTour` y respaldos WebP enumerados en PS-01/03.
- **Antes:** cinco fondos asignados durante el render y módulos importados estáticamente.
- **Después:** primer fondo inmediato, escenas posteriores asignadas antes de cada transición y funcionalidades no iniciales divididas por ruta.
- **Justificación:** baja las solicitudes iniciales y comprime los respaldos sin retirar contenido. Otras imágenes del backend no se optimizan en esta rama.
- **Verificación:** tamaño local WebP reducido en 1,017,920 bytes; build con chunks lazy. No hay medición de bytes de red actualizada.
- **Commit:** `8f9fc1d`.
- **Estado:** Parcialmente corregida.

### PS-11 — Tareas largas del hilo principal

- **Problema / recomendación PSI:** 3 tareas largas móvil y 1 escritorio.
- **Causa:** los informes guardados no identifican la tarea, script o stack responsable. TBT de línea base: 70 ms / 20 ms.
- **Archivos modificados:** ninguno específicamente; el cambio de rutas puede diferir ejecución no inicial.
- **Antes / después:** no se aplicó una fragmentación ni Web Worker sin conocer el trabajo responsable.
- **Justificación:** la intervención requiere el detalle de tareas de una nueva traza; no hay cálculo pesado claramente identificado en el código revisado.
- **Verificación:** falta perfil de rendimiento nuevo.
- **Commit:** ninguno.
- **Estado:** Pendiente.

### PS-12 — User Timing

- **Problema / recomendación PSI:** sugiere incorporar marcas de User Timing y muestra cuatro marcas.
- **Causa:** es una sugerencia informativa, no una auditoría puntuable ni un defecto de experiencia identificado.
- **Archivos modificados:** ninguno.
- **Antes / después:** no se agregaron marcas globales sin una experiencia/objetivo de negocio que medir.
- **Justificación:** instrumentar sin caso de uso no reduciría la carga y añadiría trabajo al hilo principal.
- **Verificación:** lectura del diagnóstico PSI.
- **Commit:** ninguno.
- **Estado:** No aplicable (justificada).

### PS-13 — Animación no compuesta

- **Problema / recomendación PSI:** una animación móvil y tres escritorio; evitar propiedades que causan paint.
- **Causa:** el recorrido animaba `filter: blur()` en cada escena.
- **Archivo:** `src/app/shared/components/cinematic-tour/cinematic-tour.ts`.
- **Antes:** `tl.to(layer, { filter: 'blur(...)', ... })` y transición de filtro en la escena entrante.
- **Después:** transiciones basadas en opacidad y transform; se conserva fundido, zoom y movimiento.
- **Justificación:** elimina el filtro animado de alto coste visual en el hero.
- **Verificación:** build aprobado; no se comprobó la auditoría de animación con Lighthouse nuevo.
- **Commit:** `8f9fc1d`.
- **Estado:** Corregida en código.

### PS-14 — Contraste de colores

- **Problema / recomendación PSI:** relación de contraste insuficiente en textos del sitio.
- **Causa:** el footer usa fondo oscuro de marca, pero heredaba tokens del tema claro para `text-secondary` y `text-muted`.
- **Archivo:** `src/app/layouts/public-layout/footer/footer.html`.
- **Antes:** `<footer class="bg-brand ...">`.
- **Después:** `<footer data-theme="dark" class="bg-brand ...">`.
- **Justificación:** aplica los tokens semánticos de tema oscuro en esa superficie, conservando fondo, estructura y paleta de marca.
- **Verificación:** revisión de tokens y build; sin reporte automático nuevo para conocer todos los elementos incumplidos.
- **Commit:** `8c6f4f4`.
- **Estado:** Corregida en código.

### PS-15 — Tamaño/separación de objetivos táctiles

- **Problema / recomendación PSI:** controles interactivos pequeños o próximos.
- **Causa:** enlaces de navegación desktop y accesos sociales del footer no alcanzaban el alto recomendado de 44 px.
- **Archivos:** navbar y footer públicos.
- **Antes:** enlaces sin altura mínima y enlaces sociales `size-9` (36 px).
- **Después:** navegación desktop con `min-h-11` y accesos sociales `size-11` (44 px). El menú móvil ya usa padding vertical de 12 px.
- **Justificación:** amplía la zona de activación manteniendo iconografía, color y disposición.
- **Verificación:** clases revisadas y build aprobado; falta volver a ejecutar PSI.
- **Commit:** `8c6f4f4`.
- **Estado:** Corregida en código.

### PS-16 — Secuencia de encabezados

- **Problema / recomendación PSI:** hay saltos en niveles de encabezado.
- **Causa:** las secciones del footer usaban `<h4>` aunque la portada no tiene un nivel intermedio que las preceda.
- **Archivo:** `src/app/layouts/public-layout/footer/footer.html`.
- **Antes:** `<h4 class="text-eyebrow ...">Contacto</h4>` (y Navegación/Ubicación).
- **Después:** `<h2 class="text-eyebrow ...">Contacto</h2>` (mismas clases visuales).
- **Justificación:** corrige el nivel semántico sin alterar presentación. La jerarquía global requiere confirmación del auditor automático.
- **Verificación:** inspección del árbol de headings y build; sin PSI posterior.
- **Commit:** `8c6f4f4`.
- **Estado:** Corregida en código.

### PS-17 — Source maps de producción

- **Problema / recomendación PSI:** faltan mapas de origen para el JavaScript propio.
- **Causa:** la configuración de producción no activa `sourceMap`; los mapas facilitarían depuración pero pueden exponer fuentes si se publican.
- **Archivo revisado:** `angular.json`.
- **Antes / después:** se mantiene desactivada la publicación de source maps; no se cambiaron opciones de build.
- **Justificación:** la recomendación no aporta rendimiento y existe un riesgo de exposición de código; la configuración actual de producción prioriza no publicar fuentes. No se habilitan mapas ocultos ni se cambia Vercel sin una decisión operativa explícita.
- **Verificación:** inspección de configuración; build aprobado.
- **Commit:** ninguno.
- **Estado:** No aplicable (justificada por seguridad de publicación).

## Resumen de estados

- **Total analizado:** 17 incidencias/recomendaciones.
- **Corregidas en código:** 5 (PS-09, PS-13, PS-14, PS-15, PS-16).
- **Parcialmente corregidas:** 6 (PS-01, PS-02, PS-03, PS-05, PS-08, PS-10).
- **Pendientes:** 2 (PS-06, PS-11).
- **No aplicables justificadas:** 3 (PS-04, PS-12, PS-17) más PS-07, cuyo informe no señala una solicitud concreta que se pueda retirar.
- **Métricas de rendimiento confirmadas tras el cambio:** ninguna. Solo se confirmaron cambios de bytes de los WebP y la salida de chunks del build.
