# Correcciones PageSpeed — seguimiento móvil

## Alcance y línea base

Se abrieron con Playwright los informes ya proporcionados para la URL de producción `https://isanorte-frontend.vercel.app/`, informe `xb0cif69td`, consulta del 17 de noviembre de 2026. No se ejecutaron Lighthouse ni PageSpeed de nuevo.

| Modalidad | Rendimiento | Accesibilidad | LCP | CLS |
|---|---:|---:|---:|---:|
| Móvil | 79 | 93 | 5.2 s | 0.057 |
| Escritorio | 96 | 97 | 1.0 s | 0.069 |

PSI señala en móvil el `div.cinematic-tour__layer` con `/images/recorrido-exterior.webp` como LCP y recomienda alta prioridad de descarga. El informe también estima 221 KiB de ahorro en entrega de imágenes, 267 KiB de JavaScript sin usar, 8 KiB asociados a caché, 5 recursos con animaciones no compuestas en escritorio (1 en móvil), 2 tareas largas en escritorio y 3.285 KiB transferidos en móvil. La cadena de solicitud del documento aparece como error en el informe móvil. Google Maps aporta aproximadamente 461 KiB; los recursos de imagen Cloudinary reportan 1.512 KiB en total. Los hallazgos de contraste corresponden a los textos de encabezado de servicios y proyectos. El mapa y esos controles se conservan.

Las puntuaciones y métricas anteriores son línea base del informe, no resultados de esta rama. No se afirma que el objetivo móvil de 90 puntos se haya alcanzado ni que escritorio conserve 96 después de los cambios.

## Incidencias nuevas analizadas

### MOB-01 — Descubrimiento y prioridad de la imagen LCP

- **Problema y recomendación PSI:** la imagen de portada aparece como fondo CSS y no tiene prioridad alta explícita. PSI muestra una demora de solicitud de 690 ms para `recorrido-exterior.webp`.
- **Causa:** el primer frame del hero se expresaba como `background-image` dinámico.
- **Archivo:** `src/app/shared/components/cinematic-tour/cinematic-tour.html`.
- **Antes:** `[style.backgroundImage]="i === 0 ? 'url(' + scene.imageUrl + ')' : null"`.
- **Después:** primera escena en `<img ... fetchpriority="high" decoding="async">`; las demás capas siguen cargándose progresivamente por el mecanismo existente.
- **Justificación:** el navegador descubre la imagen como recurso HTML prioritario; posición absoluta y `object-cover` conservan el recorte visual. Las dimensiones declaradas son proporcionales al formato panorámico y el elemento no altera el layout porque ocupa una capa absoluta.
- **Validación:** build de producción aprobado. No se volvió a medir LCP.
- **Commit:** `ea6a64d`.
- **Estado:** Corregida en código; efecto en LCP pendiente de medición.

### MOB-02 — Peso y formato de imágenes Cloudinary

- **Problema y recomendación PSI:** PSI estima 221 KiB de ahorro en móvil; Cloudinary es el grupo de imágenes más pesado (1.512 KiB en el desglose de terceros).
- **Causa:** las URL de contenido se usaban sin pedir formato automático, calidad automática ni un ancho máximo acorde a su contexto.
- **Archivos:** `src/app/shared/utils/cloudinary-image-url.util.ts`; `src/app/features/isanorte/home/public-home.facade.ts`.
- **Antes:** `imageUrl: scene.imagenUrl` y URLs originales de proyectos, servicios, unidad de negocio y CTA.
- **Después:** las URL de `res.cloudinary.com/.../image/upload/` reciben `f_auto,q_auto,w_<ancho>`; anchos usados: 800 para editoriales, 960 para tarjetas, 1.200 para CTA y 1.920 para fondos/hero. Otros dominios y URLs no reconocidas se dejan intactos; las imágenes ausentes permanecen ausentes.
- **Justificación:** conserva imágenes y contenido, delegando formato y compresión en el proveedor de imágenes que ya sirve esos recursos. No requiere cambios de backend. La reducción efectiva depende de la respuesta de Cloudinary y no se declara confirmada sin medición.
- **Validación:** build de producción aprobado; sin medición de bytes en red posterior.
- **Commit:** `ea6a64d`.
- **Estado:** Corregida en código; ahorro efectivo pendiente de medición.

### MOB-03 — JavaScript de Google Maps en la carga inicial

- **Problema y recomendación PSI:** el informe identifica recursos de Google Maps de unos 461 KiB; `loading="lazy"` no impidió que el iframe entrara en la ventana de carga anticipada del navegador.
- **Causa:** el iframe se encontraba en el DOM inicial aunque estuviera al final de la página.
- **Archivos:** `src/app/shared/components/location-map/location-map.ts`, `location-map.html`.
- **Antes:** el iframe se renderizaba desde el primer render y dependía únicamente de `loading="lazy"`.
- **Después:** se conserva un contenedor de 7rem de alto y se crea el iframe cuando `IntersectionObserver` detecta que está a 200 px del viewport. El enlace externo a Google Maps continúa disponible; el observador se desconecta al activarse y al destruir el componente. Si el navegador no ofrece `IntersectionObserver`, el mapa se muestra.
- **Justificación:** reduce la probabilidad de iniciar Google Maps durante el LCP sin retirar el mapa ni su alternativa de navegación. `afterNextRender` mantiene el primer HTML determinista y protege SSR/hidratación.
- **Validación:** build SSR/producción aprobado. No se inspeccionó el waterfall posterior.
- **Commit:** `ea6a64d`.
- **Estado:** Corregida en código; solicitudes efectivas pendientes de medición.

### MOB-04 — Contraste de los encabezados de sección

- **Problema y recomendación PSI:** contraste insuficiente en los rótulos de servicios y proyectos.
- **Causa:** esos textos usaban `text-accent` (`#f97316`) sobre fondos claros.
- **Archivo:** `src/app/features/isanorte/home/home.html`.
- **Antes:** `text-eyebrow text-accent`.
- **Después:** `text-eyebrow text-accent-strong` (`#b93b0a` en tema claro).
- **Justificación:** usa el token semántico de acento fuerte ya existente, conserva familia de color, tamaño y jerarquía visual, y eleva el contraste en el tema claro.
- **Validación:** compilación aprobada; el contraste no se volvió a medir automáticamente.
- **Commit:** `35d4167`.
- **Estado:** Corregida en código; relación de contraste pendiente de medición.

### MOB-05 — Animación de color del botón de accesibilidad

- **Problema y recomendación PSI:** el botón flotante anima propiedades de color/borde que provocan pintura; esta observación también aparece en el informe de escritorio.
- **Causa:** la clase del control incluía `transition-colors`.
- **Archivo:** `src/app/shared/components/accessibility-widget/accessibility-widget.ts`.
- **Antes:** `... shadow-floating transition-colors hover:bg-action-primary-hover`.
- **Después:** `... shadow-floating hover:bg-action-primary-hover`.
- **Justificación:** conserva botón, tamaño, color de estado y hover, sin interpolar propiedades que PSI identifica como no compuestas.
- **Validación:** compilación aprobada; no se ejecutó otra auditoría de animaciones.
- **Commit:** `35d4167`.
- **Estado:** Corregida en código; auditoría posterior pendiente.

## Hallazgos que no se cambiaron

- **Caché, ahorro estimado 8 KiB — No aplicable (justificada):** las cabeceras de producción son responsabilidad de Vercel/CDN. La solicitud no autoriza cambiar configuración del despliegue y una alteración general de caché no se justifica por el ahorro indicado.
- **Enlaces con propósito duplicado — Pendiente:** PSI muestra esta auditoría de accesibilidad, pero el detalle no permitió atribuir el mismo nombre a un par concreto de enlaces con suficiente seguridad. No se cambiaron etiquetas a ciegas.
- **Objetivos táctiles — No repetida:** la fase anterior ya amplió navegación y controles sociales a 44 px. El botón flotante actual mide 48 px y los controles inline 44 px. No se duplicaron esas correcciones.
- **Tareas largas — Pendiente:** el informe actual muestra 57 ms en un chunk propio y TBT de 0 ms; no identifica trabajo propio bloqueante que justifique mover lógica o retirar funciones.
- **Latencia de documento — Pendiente de evidencia:** el diagnóstico móvil muestra `Error` y no aporta una recomendación accionable para el frontend.
- **JavaScript sin uso restante — Pendiente:** la mayor parte estimada corresponde al paquete de Google Maps y el resto a código propio. Esta rama difiere el iframe; no se eliminaron rutas ni código funcional para perseguir una estimación sin traza de cobertura.
- **Puntuaciones 90 móvil y 96 escritorio — Pendiente de medición:** no se ejecutó PSI, conforme a la instrucción. No se pueden confirmar puntuaciones posteriores.

## Validación ejecutada

- `npm.cmd ci` en el worktree temporal aislado para instalar las dependencias del commit base.
- `npm.cmd run build` — **aprobado**, bundles browser y server generados; `Prerendered 0 static routes`, igual que la configuración existente.
- Se mantiene una advertencia no bloqueante ya presente: `src/app/features/isadecor/home/home.css` supera el presupuesto de 4 KiB por 453 bytes (total 4,45 KiB).
- Un primer intento de build, previo a corregir el tipo nullable de una imagen de servicio, falló en TypeScript. El build final posterior a esa corrección aprobó.
- `git diff --check` — aprobado antes de documentar.
- No se ejecutaron pruebas, auditorías de rendimiento, PageSpeed ni comprobaciones manuales extensas.
- El build reporta 19 vulnerabilidades en dependencias instaladas (8 moderadas, 8 altas y 3 críticas); no se ejecutó `npm audit fix` ni se alteraron dependencias por quedar fuera del alcance de optimización.

## Commits

- `ea6a64d` — `perf(home): prioriza y optimiza recursos móviles`.
- `35d4167` — `a11y(home): mejora contraste y reduce animación de color`.
- El commit de esta documentación se añadirá después de completar este archivo.
