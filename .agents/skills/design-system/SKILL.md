---
name: design-system
description: Create or review ISANORTE frontend UI while preserving its existing design system, semantic tokens, shared components, responsive behavior, and brand language. Use for visual components, page layouts, styling, themes, forms, and accessibility work.
---

# Design System

## Cuándo utilizarla

Úsala al crear o modificar UI, estilos, formularios, themes, responsive, componentes visuales o cualquier pantalla de ISANORTE o ISADECOR.

## Objetivo

Mantener una experiencia coherente con el sistema visual real del repositorio, reutilizando tokens y componentes antes de añadir variantes nuevas.

## Procedimiento

1. Lee `docs/DESIGN_SYSTEM.md` y contrasta sus reglas con el CSS actual.
2. Revisa `src/styles/theme.css`, `src/styles/themes/light.css`, `src/styles/themes/dark.css` y `src/styles.css` según el cambio.
3. Busca primero en `src/app/shared/components/`: Alert, Badge, Button, Card, Carousel, CinematicTour, EmptyState, InputField, Loading, Modal, RevealStagger, SectionTitle, SelectField y TextareaField.
4. Define la jerarquía, estados e interacción antes de escribir clases.
5. Usa tokens semánticos de color, tipografía, spacing, radios, sombras y motion. Usa utilidades compartidas como `app-container`, `reading-container` y `section-space` cuando encajen.
6. Implementa mobile-first y revisa al menos móvil estrecho, tablet y escritorio.
7. Verifica ambos temas cuando el componente dependa de superficies, bordes, texto o estados.
8. Revisa accesibilidad: orden de headings, nombre accesible, label, `alt`, teclado, foco visible, contraste y estados disabled/error.
9. Compara visualmente con páginas reales del proyecto y ejecuta build.

## Reglas

- No usar colores, sombras, spacing o motion arbitrarios si existe un token semántico adecuado.
- No duplicar un componente shared ni cambiar sus inputs/outputs sin revisar todos sus consumidores.
- Reutilizar Button, Card, Badge, inputs, Modal, Loading, EmptyState y SectionTitle cuando su semántica corresponda.
- No forzar Card para todo: una composición editorial o una sección abierta puede ser más correcta.
- Mantener Tailwind CSS 4 y la estrategia CSS actual; no instalar otro framework visual.
- ISANORTE conserva minimalismo, arquitectura contemporánea, fotografía protagonista, espacio generoso, negro/grises y naranja como acento, con apariencia profesional/premium.
- ISADECOR puede ser más comercial y visual, pero debe sentirse parte del mismo ecosistema.
- La apariencia no debe depender solo del color para comunicar estado.
- Respetar `prefers-reduced-motion`; las microinteracciones no deben bloquear lectura o interacción.
- No modificar tokens globales para resolver un caso local sin evaluar el impacto en toda la aplicación.

## Checklist final

- [ ] Se revisaron documentación, tokens y componentes compartidos.
- [ ] No se duplicó una primitiva existente.
- [ ] Los estilos usan tokens semánticos y funcionan en light/dark.
- [ ] La jerarquía visual corresponde a ISANORTE o ISADECOR.
- [ ] La pantalla funciona en móvil, tablet y escritorio.
- [ ] Teclado, foco, labels, headings, alt y contraste fueron revisados.
- [ ] Reduced motion está respetado cuando hay movimiento.
- [ ] No se introdujeron valores o dependencias visuales innecesarias.
- [ ] `npm run build` pasa.
