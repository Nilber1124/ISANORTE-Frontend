---
name: gsap-animations
description: Add or review motion in the ISANORTE Angular frontend using its installed GSAP stack safely. Use for entrances, scroll reveals, stagger, parallax, timelines, ScrollTrigger, or animation cleanup; not for simple styling with no motion.
---

# GSAP Animations

## Cuándo utilizarla

Úsala al crear o modificar animaciones de entrada, reveal por scroll, stagger, parallax, timelines o ScrollTrigger en ISANORTE o ISADECOR.

## Objetivo

Crear movimiento moderno, sobrio y consistente, subordinado al contenido, sin romper SSR, hidratación, rendimiento ni accesibilidad.

## Procedimiento

1. Revisa las animaciones existentes antes de añadir otra solución. `Carousel`, `CinematicTour` y `RevealStagger` ya usan GSAP mediante import dinámico dentro de `afterNextRender()` y limpian recursos con `DestroyRef`.
2. Decide si el efecto requiere JavaScript:
   - hover, focus y transiciones simples: CSS/Tailwind;
   - secuencia, reveal coordinado, parallax o scroll: GSAP;
   - ScrollTrigger solo cuando el scroll controle realmente la animación.
3. Elige un patrón coherente: `heroEntrance`, `fadeUp`, `staggerReveal`, `imageReveal`, `parallaxImage` o `sectionReveal`.
4. Define primero el estado SSR legible. La página debe conservar contenido y acciones aunque GSAP no cargue.
5. Inicializa GSAP únicamente en browser, preferentemente con `afterNextRender()` como el código actual. Importa y registra ScrollTrigger solo si se usa.
6. Limita el scope de selectores al componente y conserva referencias a timeline, tween, trigger, listener, timer u observer.
7. Implementa cleanup completo al destruir el componente; usa context/revert o `kill()` según corresponda.
8. Consulta `prefers-reduced-motion`. En modo reducido elimina scrub/parallax/pin y usa contenido inmediato o un reveal mínimo.
9. Revisa móvil, scroll rápido, resize, navegación entre rutas y destrucción/recreación del componente.
10. Mide el coste visual: evita trabajo por frame fuera de GSAP, layout thrashing y animaciones simultáneas excesivas.

## Reglas

- GSAP 3.15 ya está instalado; no instalar otra librería que resuelva la misma necesidad.
- ScrollTrigger es la opción principal para animación ligada al scroll, pero no se utiliza todavía en el código actual: añadirlo solo con una necesidad concreta.
- No animar todo ni repetir el mismo reveal en cada elemento sin jerarquía.
- Evitar scroll-jacking, parallax intenso y horizontal scroll sin justificación de UX.
- Usar pin únicamente cuando ayude a comprender una narrativa o comparación.
- La animación no puede ocultar indefinidamente contenido si JavaScript falla.
- No acceder a `window`, `document`, medidas de viewport o DOM durante SSR ni en el nivel de módulo.
- No dejar ScrollTriggers, RAF, intervalos, listeners u observers vivos tras destruir el componente.
- No modificar copy, jerarquía ni navegación solo para acomodar un efecto.
- Respetar foco, teclado y reduced motion; nunca animar de forma que impida interactuar.

## Checklist final

- [ ] El efecto aporta jerarquía o comprensión y no es movimiento decorativo excesivo.
- [ ] Se reutilizó un patrón/componente existente cuando era suficiente.
- [ ] GSAP se inicia solamente en browser después del render.
- [ ] Timeline, triggers, listeners, timers y observers se limpian.
- [ ] Reduced motion elimina scrub, parallax y movimiento intenso.
- [ ] El contenido existe y es usable sin ejecutar la animación.
- [ ] Funciona en móvil, resize y navegación entre rutas.
- [ ] No se añadió una librería de animación redundante.
- [ ] `npm run build` pasa con SSR/prerender.

