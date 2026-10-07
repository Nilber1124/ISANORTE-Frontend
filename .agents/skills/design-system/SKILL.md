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
4. Define la jerarquía, estados e interacción antes de escribir clases. Para estados de interacción complejos (hover multi-parte, focus-visible personalizado, feedback de formulario, transición loading → success) o patrones de UX avanzados, cargar las skills globales `ui-styling` o `ui-ux-pro-max` antes de implementar.
5. Cuando se vaya a crear un nuevo componente shared, seguir este orden: (a) confirmar que ningún componente existente puede adaptarse, (b) definir sus inputs/outputs y estados (idle, loading, error, disabled, empty), (c) implementarlo con tokens semánticos exclusivamente, (d) actualizar `docs/DESIGN_SYSTEM.md` con su descripción. No crear tokens nuevos para un solo caso local sin evaluar si el concepto es reutilizable.
6. Usa tokens semánticos de color, tipografía, spacing, radios, sombras y motion. Usa utilidades compartidas como `app-container`, `reading-container` y `section-space` cuando encajen.
7. Implementa mobile-first y revisa al menos móvil estrecho, tablet y escritorio.
8. Verifica ambos temas cuando el componente dependa de superficies, bordes, texto o estados.
9. Revisa accesibilidad: orden de headings, nombre accesible, label, `alt`, teclado, foco visible, contraste y estados disabled/error.
10. Compara visualmente con páginas reales del proyecto y ejecuta build.

## ISADECOR

ISADECOR es más comercial y orientada al producto que ISANORTE, pero debe sentirse parte del mismo ecosistema visual. Criterios de diferenciación permitidos:

- Puede usar composiciones más densas, grids de productos y énfasis en imagen de producto.
- El acento naranja puede aparecer con mayor frecuencia en badges de precio, etiquetas de categoría y CTAs de catálogo, pero nunca como fondo dominante de sección.
- Puede extender la paleta de superficies con `background-soft` y `background-muted` para alternar secciones de catálogo sin crear tokens propios.
- Tipografía, spacing, radios, sombras y motion comparten los mismos tokens que ISANORTE; no redefinir.
- Si un patrón de ISADECOR (ej. ficha de producto, comparador) requiere un token conceptualmente nuevo, evaluarlo para el sistema global antes de crearlo como variable local.

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
- [ ] La jerarquía visual corresponde a ISANORTE o ISADECOR según la unidad de negocio.
- [ ] Si el componente es de ISADECOR, respeta la diferenciación permitida sin crear tokens locales injustificados.
- [ ] Si hubo interacción compleja, se consultó `ui-styling` o `ui-ux-pro-max`.
- [ ] Si se creó un componente shared nuevo, `docs/DESIGN_SYSTEM.md` fue actualizado.
- [ ] La pantalla funciona en móvil, tablet y escritorio.
- [ ] Teclado, foco, labels, headings, alt y contraste fueron revisados.
- [ ] Reduced motion está respetado cuando hay movimiento.
- [ ] No se introdujeron valores o dependencias visuales innecesarias.
- [ ] `npm run build` pasa.
