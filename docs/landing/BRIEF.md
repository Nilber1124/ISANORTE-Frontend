# BRIEF: Home de ISANORTE (método scroll-craft adaptado a Angular)

Brief respondido por el usuario en conversación (no entrevistado de nuevo). Fuente de marca: banner real de Facebook de ISANORTE.

## Las 8 respuestas
1. **Vibe**: confiable, técnico, preciso, moderno y cercano. Blanco, negro y gris; el naranja-rojo del logo es el único acento. Sin azul, sin lujo exagerado.
2. **Qué es / para quién**: ISANORTE, Arquitectura · Ingeniería & Construcción (Perú). Propietarios y familias que quieren construir, remodelar o regularizar un terreno.
3. **Qué debe creer el visitante**: "Con ISANORTE resuelvo plano, trámite y obra con un solo equipo".
4. **Acción siguiente**: Solicitar cotización. Secundarias: WhatsApp, Ver proyectos, Ir a ISADECOR.
5. **Servicios reales**: diseño y elaboración de planos; ejecución y supervisión de proyectos; levantamiento topográfico; saneamiento físico legal; habilitaciones urbanas; remodelaciones; diseño de interiores; estructuras metálicas.
6. **Diferenciador**: terreno, permisos y construcción juntos.
7. **Rango estético**: premium-minimal con carácter, claro por defecto y oscuro igual de cuidado.
8. **Assets**: fotos desde Cloudinary vía backend. Sin stock ni imágenes generadas.

## Gramática elegida: "Del terreno a la llave" (capítulos de proyecto)
Derivada de *Chaptered editorial* (el recorrido es un proceso de obra) con un riel de etapas como chrome. Las otras gramáticas no encajan:
- *Filmic one-shot*: obliga a un scrub continuo de video; no hay video y es la plantilla que se quiere evitar.
- *Live surface* y *Typographic poster*: pensadas para productos digitales o marcas de manifiesto, no para una constructora con 8 servicios que comparar.
- *Continuous world*: requiere un mundo generado de una pieza.
- *Gallery/catalog* y *Rhythmic cutlist*: tono de moda o energía; la confianza de obra necesita ritmo pausado.
- *Split stage*: sirve para una sola comparación (plano contra obra) y esa idea vive dentro del movimiento propio, no como estructura de toda la página.

Se aparta de *Chaptered editorial* en un punto: el hero es dimensional (capas con movimiento propio) porque se pidió expresamente; no es una portada tipográfica.

**Chrome**: navbar existente + riel vertical de etapas a la derecha (xl+): Servicios · Proceso · Proyectos · ISADECOR · Cotizar, que se actualiza al pasar. **Cierre**: bloque final que resuelve y se queda ("¿Tienes un proyecto en mente?").
**Prohibido en esta página**: carruseles, autoplay, scrub de video, imán en CTA, contadores 01/06, flecha "scroll".

## Movimiento propio (signature move): el plano que se construye
En la sección de proceso, un dibujo técnico (alzado de una casa) se traza con el scroll: terreno y cotas, muros, estructura por niveles y, al final, acabados y puerta con el acento. Cada paso del proceso corresponde a un tramo del dibujo. No usa ningún dispositivo de un kit; es SVG + GSAP ScrollTrigger propio de esta página.

## Curva de emociones (una línea por sección)
| Sección | Emoción | Qué la causa |
|---|---|---|
| Hero | Reconocimiento y calma | Titular directo, obra real detrás, capas que se separan al mover el scroll |
| Servicios | Claridad | Todo lo que hacen, a la vista, sin esconder nada en un carrusel |
| Proceso | **Asombro tranquilo (pico)** | El dibujo técnico se construye mientras avanzas y cada paso se ilumina |
| Proyectos | Confianza | Obras reales con lugar, año y fotos grandes |
| ISADECOR | Deseo, calidez | Cambio de ambiente: fondo oscuro y madera, otra línea de la casa |
| Cierre | Decisión | Una pregunta, tres vías de contacto, ninguna distracción |

**Momento pico** (lo que contaría un visitante): "Me mostraron el plano dibujándose hasta convertirse en la casa, y entendí que se encargan de todo".
La sección de proceso tiene el mayor espacio de scroll de la página; la de servicios antes es la más quieta.

## Reglas de implementación
- GSAP + ScrollTrigger cargados de forma diferida en navegador (`afterNextRender`), dentro de `gsap.context()`, con cleanup.
- `AccessibilityService.reduceMotion()` y `prefers-reduced-motion`: sin animación, dibujo completo y todo el contenido visible.
- El estado inicial de las animaciones lo pone JS; sin JS o en SSR el contenido y el dibujo se ven completos.
- Tokens del sistema de diseño; naranja solo en CTA y detalles.

## Actualización: escenario del proceso
El dibujo SVG se sustituyó por un video 3D del ensamblado de la casa sobre fondo verde (`public/media/home/proceso-obra*.mp4`, TRANSITORIO: a futuro vendrá de Cloudinary/BD), controlado por el scroll y recortado en el navegador con un canvas WebGL (`home-chroma-key.ts`), de modo que flota sobre el fondo de la página en claro y oscuro. Sin WebGL se mantiene el SVG; con reducir animaciones se muestra el póster recortado (`proceso-obra-poster.png`). El SVG queda como respaldo si el video no carga. Cada paso del proceso corresponde a un segundo del video (ver `VIDEO_KEYS` en `home-motion.directive.ts`).
