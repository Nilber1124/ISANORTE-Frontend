# ISANORTE · ISADECOR Design System

Esta guía define la base visual compartida del frontend (ISANORTE, ISADECOR y administración) para que las páginas públicas y privadas utilicen las mismas decisiones de color, tipografía, espacio, geometría e interacción. Es una guía viva: cuando una decisión de diseño demuestra funcionar mejor en una pantalla real, se actualiza aquí en lugar de mantener una regla que ya no se sigue.

## 1. Identidad visual

**ISANORTE** comunica ingeniería, arquitectura, precisión y confianza: minimalismo con un futurismo sobrio, tipografía limpia, geometría firme y espacio negativo generoso.

**ISADECOR** es una tienda de acabados e interiores. Comunica material, calidez y facilidad de compra: fotografía y texturas reales, jerarquía clara entre descubrir, elegir y comprar, y movimiento con propósito (ver §26). Hereda los tokens, la tipografía y los componentes del sistema.

El negro, el blanco y los grises forman la base neutra. El naranja es el color de acción y de marca: identifica llamadas a la acción, estados activos, etiquetas de oferta y detalles de marca. Puede ocupar superficies puntuales y acotadas (una cinta de avisos, una etiqueta, un botón) siempre con texto de contraste suficiente (AA); no se usa para teñir páginas completas ni bloques de lectura.

## Temas

Light es el tema predeterminado de ISANORTE. Se declara desde el HTML inicial con `data-theme="light"`, por lo que también aparece correctamente durante prerenderizado o cuando JavaScript está deshabilitado. Dark es la variante alternativa y conserva la paleta oscura original.

Ambos temas comparten componentes, tipografía, spacing, radios, sombras, movimiento, layouts y responsive. Solo cambian los valores cromáticos:

```text
src/styles/
├── theme.css
└── themes/
    ├── light.css
    └── dark.css
```

- `theme.css` registra el contrato semántico de Tailwind y contiene las reglas no cromáticas.
- `light.css` define los valores claros y funciona también como fallback de `:root`.
- `dark.css` redefine el mismo conjunto bajo `[data-theme='dark']`.
- `ThemeService` expone `theme`, `setTheme()`, `useLightTheme()`, `useDarkTheme()` y `toggleTheme()`. La preferencia se persiste desde `AccessibilityService` (ver §25).

El atributo se aplica sobre `<html>`:

```html
<html data-theme="light"></html>
<html data-theme="dark"></html>
```

Un componente compatible usa exclusivamente el contrato semántico:

```html
<article class="border border-border bg-surface text-text-primary">
  <p class="text-text-secondary">Contenido adaptativo</p>
</article>
```

No debe consultar el tema, incluir ramas `if (dark)` ni repetir valores cromáticos. Si un diseño necesita un nuevo concepto recurrente, primero se crea un token semántico con valores para Light y Dark.

## 2. Paleta de colores

Los tokens se registran en `src/styles/theme.css` mediante `@theme` de Tailwind CSS 4 y obtienen sus valores de cada archivo cromático. Se consumen con utilidades como `bg-background`, `bg-surface`, `text-text-secondary` y `border-border`.

| Token              | Light     | Dark      | Uso recomendado                        |
| ------------------ | --------- | --------- | -------------------------------------- |
| `brand`            | `#0c0c0a` | `#0c0c0a` | Identidad corporativa                  |
| `background`       | `#ffffff` | `#0c0c0a` | Fondo general                          |
| `background-soft`  | `#f7f7f5` | `#11110f` | Alternancia sutil de secciones         |
| `background-muted` | `#efefec` | `#181816` | Fondo de menor énfasis                 |
| `background-deep`  | `#efefec` | `#000000` | Footer y nivel de fondo profundo       |
| `surface`          | `#ffffff` | `#151513` | Cards y controles                      |
| `surface-soft`     | `#fafaf9` | `#181816` | Badges y estados neutrales             |
| `surface-hover`    | `#f2f2ef` | `#1d1d1a` | Hover de superficies                   |
| `surface-elevated` | `#ffffff` | `#20201d` | Modal, dropdown y panel elevado        |
| `border`           | `#e4e4df` | `#2a2a27` | Borde estructural habitual             |
| `border-strong`    | `#ccccc5` | `#3a3a36` | Borde con mayor énfasis                |
| `text-primary`     | `#11110f` | `#ffffff` | Títulos y contenido principal          |
| `text-secondary`   | `#55554f` | `#b5b5b0` | Descripción y contenido complementario |
| `text-muted`       | `#707069` | `#858581` | Metadatos, captions y ayudas           |
| `text-disabled`    | `#a0a09a` | `#62625e` | Texto y controles deshabilitados       |
| `accent`           | `#f97316` | `#f97316` | CTA excepcional y detalle de marca     |
| `accent-hover`     | `#ea580c` | `#ea580c` | Hover del CTA accent                   |
| `accent-strong`    | `#b93b0a` | `#fb923c` | Texto o indicador naranja accesible    |
| `success`          | `#3f704b` | `#78a083` | Confirmación                           |
| `warning`          | `#765b23` | `#b99a62` | Advertencia                            |
| `error`            | `#9b4545` | `#c77878` | Error                                  |
| `info`             | `#486784` | `#7890aa` | Información                            |
| `focus`            | `#3d3d38` | `#ffffff` | Anillo de foco visible                 |

Los colores de estado son funcionales. Se usan en formularios, badges y mensajes del panel administrativo; no decoran secciones públicas.

## 3. Tipografía

La familia base es `Inter, ui-sans-serif, system-ui, ...`. No se descarga ninguna fuente: si Inter está instalada se usa y, si no, el navegador continúa con la fuente del sistema.

| Rol / utilidad                 | Tamaño aproximado | Peso | Uso                                      |
| ------------------------------ | ----------------- | ---- | ---------------------------------------- |
| Display XL / `text-display-xl` | 40–64 px, fluido  | 650  | Hero principal y mensajes excepcionales  |
| Display / `text-display`       | 36–52 px, fluido  | 650  | Grandes encabezados de landing           |
| H1 / `text-heading-1`          | 32–42 px, fluido  | 650  | Título principal de página               |
| H2 / `text-heading-2`          | 26–32 px, fluido  | 600  | Sección principal                        |
| H3 / `text-heading-3`          | 21–24 px, fluido  | 600  | Subsección o card destacada              |
| H4 / `text-heading-4`          | 20 px             | 600  | Título secundario                        |
| Body Large / `text-body-lg`    | 18 px             | 400  | Entradilla y descripción destacada       |
| Body / `text-body`             | 16 px             | 400  | Contenido habitual                       |
| Body Small / `text-body-sm`    | 14 px             | 400  | Ayudas, metadatos y contenido secundario |
| Caption / `text-caption`       | 12 px             | 400  | Información de baja jerarquía            |
| Eyebrow / `text-eyebrow`       | 13 px             | 650  | Categoría superior en mayúsculas         |

Las escalas grandes usan `clamp()` para responder de forma continua entre móvil y escritorio. Cada token incluye line-height y letter-spacing adecuados a su rol.

## 4. Jerarquía tipográfica

- Display se reserva para el hero y mensajes de marca. No reemplaza la semántica HTML.
- Cada página debe tener un solo H1 principal cuando su estructura lo requiera.
- H2 abre secciones; H3 abre subsecciones y cards relevantes; H4 titula grupos menores.
- Body comunica contenido habitual; Body Small y Caption reducen la jerarquía sin comprometer legibilidad.
- Eyebrow identifica una categoría superior. Se escribe en mayúsculas, con tracking amplio y puede incorporar una línea o punto naranja pequeño.
- El color acompaña la jerarquía: `text-primary` para lo esencial, `text-secondary` para soporte y `text-muted` para metadatos.

## 5. Espaciado

La escala se basa en múltiplos de 4 px y coincide con Tailwind: 4, 8, 16, 24, 32, 48, 64 y 96 px. Como referencia conceptual se denominan XS, SM, MD, LG, XL, 2XL, 3XL y 4XL.

- Elementos íntimamente relacionados: 4–8 px.
- Controles dentro de un grupo: 8–16 px.
- Padding habitual de card: 24 px; cards amplias: 32 px en tablet y escritorio.
- Bloques dentro de un componente: 24–32 px.
- Bloques mayores: 48–64 px.
- Secciones públicas: `section-space` escala con `clamp()` desde 56 px en móvil hasta 128 px en escritorio. También son válidos `py-14`, `py-16`, `md:py-20` y `lg:py-24/28/32` según contexto.

Antes de introducir un valor arbitrario debe elegirse el paso más cercano de esta escala.

## 6. Contenedores

`app-container` limita el ancho general a 1408 px (`88rem`), centra el contenido y escala el padding horizontal entre 16 y 48 px. Debe envolver el contenido principal de cada sección.

`reading-container` limita líneas de lectura a 768 px (`48rem`). Se usa en textos extensos, encabezados y formularios que perderían legibilidad a todo el ancho.

## 7. Grid

Se usa Grid para colecciones bidimensionales y Flexbox para alineación en una dimensión. El enfoque es mobile-first:

- Móvil: 1 columna.
- Tablet: 2 columnas.
- Escritorio: 3 columnas para contenido amplio o 4 para tarjetas compactas.
- Gaps habituales: 16, 20, 24 o 32 px según densidad.

Las columnas deben ser fluidas y evitar anchos fijos que generen desbordamiento.

## 8. Border radius

| Token / utilidad              | Valor | Uso                                   |
| ----------------------------- | ----- | ------------------------------------- |
| `control` / `rounded-control` | 10 px | Inputs, selects y controles compactos |
| `button` / `rounded-button`   | 12 px | Botones                               |
| `card` / `rounded-card`       | 16 px | Cards e imágenes habituales           |
| `panel` / `rounded-panel`     | 24 px | Paneles amplios o capas especiales    |

`rounded-full` se reserva para badges, chips, avatares e indicadores circulares.

## 9. Bordes

Los bordes crean estructura en fondos oscuros. Una card normal usa `border-white/10`; divisores discretos pueden usar `/5`; hover o elementos relevantes pueden subir a `/15` o `/20`. Los tokens `border` y `border-light` sirven para estructura opaca y niveles elevados. No se usa un borde intenso en todos los elementos.

## 10. Sombras

| Token / utilidad  | Uso                                              |
| ----------------- | ------------------------------------------------ |
| `shadow-soft`     | Elevación mínima de controles o bloques pequeños |
| `shadow-card`     | Profundidad discreta de cards                    |
| `shadow-floating` | Modal, dropdown o panel flotante                 |

Las sombras son negras y difusas. No deben parecer glow ni sustituir un borde necesario.

## 11. Superficies

La profundidad sigue esta secuencia: `background` → `background-soft` → `surface` → `surface-elevated`. `background-muted` y `background-deep` separan regiones amplias, mientras `shadow-floating` identifica un modal o elemento flotante. La secuencia funciona con valores claros u oscuros sin cambiar el componente.

## 12. Botones

`app-button` acepta `variant`, `size`, `type`, `href`, `target`, `disabled`, `loading` y `ariaLabel`. Sin `href` renderiza un `<button>` nativo; con `href`, un `<a>`. Los tamaños son `small`, `medium` y `large`.

- `primary`: usa `action-primary` y `action-primary-text`; es oscuro en Light y claro en Dark. Acción principal habitual.
- `secondary`: usa la superficie, texto y borde del tema. Acción secundaria cercana.
- `accent`: naranja. Acciones de mayor importancia comercial: comprar, cotizar, buscar, ver oferta. Una por zona visible para que conserve su jerarquía.
- `ghost`: transparente y sin borde dominante. Acciones terciarias o de baja prominencia.

Cada variante incorpora hover, active, focus-visible, disabled y loading. Loading mantiene el texto, muestra progreso y expone `aria-busy`.

## 13. Cards

`app-card` presenta contenido genérico mediante proyección. Acepta padding `small`, `medium` o `large`. Sin `href` renderiza un `<article>` estático. Con `href` renderiza un enlace completo, añade foco visible y eleva la card 4 px en hover/focus. Esta distinción evita sugerir interacción en contenido estático.

La base usa `surface`, `border`, `rounded-card` y `shadow-card`. Productos, servicios y proyectos pueden componer su contenido dentro de ella sin duplicar esta estructura.

## 14. Badges

`app-badge` crea una etiqueta pequeña, redondeada y de contraste tenue. Sus variantes semánticas cubren neutral, accent, success, warning, error e info. El color se usa solo cuando su significado lo exige.

## 15. Formularios

`app-input-field`, `app-textarea-field` y `app-select-field` componen los patrones `form-label`, `form-control`, `form-helper` y `form-error`. Usan `surface`, `border`, placeholder muted, altura mínima consistente y el token `focus`. Textarea permite redimensionado vertical. Un error activa `aria-invalid` y el color semántico correspondiente.

Cada campo debe mantener un `<label>` asociado mediante `for`/`id`. Las ayudas y errores se enlazan con `aria-describedby`; los errores usan también `aria-invalid` y, si se actualizan dinámicamente, una región anunciable apropiada.

## 16. Iconografía

La futura familia principal debe ser outline, geométrica y de grosor uniforme. No se mezclan familias dentro de una vista. Los iconos acompañan una etiqueta visible o reciben un nombre accesible si actúan solos. Todavía no se instala una dependencia de iconos.

## 17. Imágenes

Se priorizan imágenes grandes y nítidas de arquitectura, interiores, materiales y procesos. En ISADECOR se usan además texturas de material en primer plano y escenas de ambiente. Deben usar crop limpio, `object-cover`, dimensiones declaradas (`width`/`height`), `loading="lazy"` salvo la imagen principal, y los radios del sistema. Un degradado puede proteger el contraste del texto. Las imágenes generadas o de muestra no deben mostrar texto, marcas ni personas, y se marcan como muestra en la fuente de datos hasta contar con fotografía real.

## 18. Animaciones

Los tiempos de referencia son 150 ms para respuesta rápida, 250 ms para transición normal y 500 ms para entrada. Para interfaz se animan principalmente opacity, color y transformaciones cortas; una elevación de card no supera 4 px.

Se permite movimiento de mayor escala cuando comunica el producto y cumple estas condiciones:

- Tiene un propósito claro (mostrar una transformación, guiar el recorrido), no es decorativo.
- El contenido esencial y las acciones siguen disponibles sin animación (respaldo estático).
- Respeta `prefers-reduced-motion` y `data-motion="reduce"` (§25): sin animación, sin autoplay, con la versión estática.
- Se pausa al pasar el cursor o enfocar cuando avanza solo (marquesinas), y nunca bloquea el acceso a la compra (siempre hay un salto directo a la tienda).
- No usa glow pulsante, rotaciones decorativas ni saltos de layout.

La hoja global reduce animaciones y transiciones con `prefers-reduced-motion`. El atributo `data-motion="reduce"` aplica la misma reducción y fuerza los elementos `[data-reveal]` a su estado final. Los componentes con GSAP o movimiento propio consultan `AccessibilityService.reduceMotion()`.

## 19. Responsive

El desarrollo es mobile-first. Los layouts comienzan en una columna, incorporan dos columnas en tablet y tres o cuatro cuando el contenido lo permite. La tipografía principal usa `clamp()`, los contenedores tienen gutters fluidos y no se emplean anchos fijos innecesarios. Cada vista debe revisarse al menos en 320 px, tablet, laptop y monitor amplio.

## 20. Accesibilidad

- Objetivo: WCAG AA en vistas principales.
- Mantener contraste suficiente entre texto y superficie.
- Conservar una estructura de encabezados lógica y un H1 principal.
- Usar elementos nativos, labels, `alt`, nombres accesibles y estados ARIA cuando corresponda.
- Todos los controles funcionan con teclado y muestran `focus-visible`.
- Verificar contraste y foco en Light y Dark; el cambio de tema no debe ocultar estados.
- Mantener objetivos táctiles cercanos o superiores a 44 px en acciones habituales.
- No comunicar un estado únicamente mediante color.
- Respetar `prefers-reduced-motion`.
- Ofrecer el panel de accesibilidad de usuario (modo oscuro, alto contraste, tamaño de texto, reducir animaciones, resaltar enlaces); ver §25.

## 21. Buenas prácticas

- Consumir tokens semánticos: `bg-background`, `bg-surface`, `text-text-secondary`, `border-border`.
- Revisar cada componente nuevo con `data-theme="light"` y `data-theme="dark"` sin añadir lógica interna de tema.
- Usar la escala tipográfica por rol: `text-heading-2`, `text-body-sm`, etc.
- Elegir spacing de Tailwind antes de crear valores nuevos.
- Componer páginas con `app-container`, componentes compartidos y HTML semántico.
- Usar el naranja para acción, estado activo, oferta o detalle de marca, con contraste AA y sin teñir páginas completas.
- Mantener CSS específico dentro del componente solo cuando represente comportamiento propio.
- Navbar: fondo oscuro o transparente sobre hero, borde inferior sutil, navegación blanca/gris, activo claro y un solo CTA accent. En ISADECOR incorpora buscador y categorías cuando se trate de la tienda.
- Footer futuro: `background-deep`, espacio amplio, texto secundario, divisores sutiles, logo, contacto, enlaces y redes.

## 22. Qué NO hacer

| NO                                                           | SÍ                                                                                            |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------- |
| Teñir páginas o bloques de lectura completos de naranja      | Usarlo en acciones, etiquetas, cintas y detalles acotados con contraste AA                    |
| Inventar `text-[47px]` o `text-[71px]`                       | Usar `text-display`, `text-heading-1` y el resto de la escala                                 |
| Repetir `bg-[#0c0c0a]` o `text-[#b5b5b0]` en componentes     | Usar `bg-background`, `text-text-secondary` y el resto de tokens semánticos                   |
| Inventar colores por componente                              | Utilizar tokens semánticos y proponer un token solo si el caso se repite                      |
| Usar `rounded-full` en cards o paneles                       | Reservarlo para chips, filtros, badges, avatares e indicadores                                |
| Agregar sombras enormes o glow constante                     | Elegir `shadow-soft`, `shadow-card` o `shadow-floating`                                       |
| Introducir espacios arbitrarios repetidos                    | Elegir valores de la escala de 4 px; un valor puntual (altura de escena, offset sticky) es válido si se justifica |
| Hacer una card estática con hover de elevación               | Activar interacción visual solo cuando la card tenga un destino real                          |
| Usar colores de estado como decoración                       | Aplicarlos a validación, mensajes, badges y estados administrativos                           |
| Hacer movimiento sin respaldo estático ni pausa              | Seguir las condiciones de §18                                                                 |
| Consultar Light/Dark dentro de cada componente               | Dejar que el mismo token semántico cambie mediante `data-theme`                               |

## 23. Componentes compartidos — segunda tanda

Los componentes de esta sección son standalone, no contienen lógica de negocio y consumen los tokens de `theme.css`. Sus identificadores se reciben como inputs en lugar de generarse aleatoriamente; así el HTML producido por SSR coincide con el que Angular hidrata en el navegador.

### 23.1 InputField

**Propósito:** presentar un input nativo junto con label, ayuda, error y estado de carga. Admite texto, correo, contraseña, teléfono, URL, búsqueda, números y fechas.

| Input                     | Tipo / valor inicial     | Propósito                                           |
| ------------------------- | ------------------------ | --------------------------------------------------- |
| `inputId`                 | `string`, obligatorio    | Relaciona el label y los mensajes con el control    |
| `label`                   | `string`, obligatorio    | Nombre visible del campo                            |
| `type`                    | `InputFieldType`, `text` | Tipo nativo del input                               |
| `value`                   | `string`, `''`           | Valor enlazable mediante `[(value)]`                |
| `name`                    | `string`                 | Nombre enviado por un formulario nativo             |
| `placeholder`             | `string`                 | Ejemplo breve del formato esperado                  |
| `autocomplete`            | `string`                 | Sugerencia de autocompletado del navegador          |
| `inputMode`               | `string`                 | Teclado virtual recomendado                         |
| `helperText`              | `string`                 | Ayuda asociada mediante `aria-describedby`          |
| `error`                   | `string`                 | Mensaje anunciado y estado `aria-invalid`           |
| `ariaDescribedBy`         | `string`                 | IDs adicionales que describen el campo              |
| `disabled`                | `boolean`, `false`       | Deshabilita el control                              |
| `readonly`                | `boolean`, `false`       | Impide edición sin sacar el valor del formulario    |
| `required`                | `boolean`, `false`       | Marca el campo como obligatorio                     |
| `loading`                 | `boolean`, `false`       | Muestra progreso y bloquea temporalmente la edición |
| `minLength` / `maxLength` | `number`                 | Límites nativos de longitud                         |

| Output        | Valor        | Propósito                                             |
| ------------- | ------------ | ----------------------------------------------------- |
| `valueChange` | `string`     | Cambio generado automáticamente por `model()`         |
| `focused`     | `FocusEvent` | Notifica entrada de foco cuando sea necesario         |
| `blurred`     | `FocusEvent` | Notifica salida de foco, útil para validación externa |

```html
<app-input-field
  inputId="contact-email"
  label="Correo"
  type="email"
  [(value)]="email"
  autocomplete="email"
  helperText="Usaremos este correo para responder."
  [error]="emailError()"
  required
/>
```

Buenas prácticas: mantener `inputId` único por página, mostrar el error después de una interacción o envío y usar `helperText` para orientación breve. La validación pertenece al formulario consumidor.

### 23.2 TextareaField

**Propósito:** capturar texto de varias líneas con la misma estructura visual y accesible que InputField.

| Input                              | Tipo / valor inicial   | Propósito                             |
| ---------------------------------- | ---------------------- | ------------------------------------- |
| `inputId`, `label`                 | `string`, obligatorios | Asociación accesible y nombre visible |
| `value`                            | `string`, `''`         | Valor enlazable mediante `[(value)]`  |
| `name`, `placeholder`              | `string`               | Atributos del control nativo          |
| `helperText`, `error`              | `string`               | Ayuda o validación asociada           |
| `ariaDescribedBy`                  | `string`               | IDs descriptivos adicionales          |
| `disabled`, `readonly`, `required` | `boolean`              | Estados nativos del control           |
| `loading`                          | `boolean`, `false`     | Bloquea edición y muestra progreso    |
| `rows`                             | `number`, `5`          | Altura inicial en líneas              |
| `maxLength`                        | `number`               | Límite nativo de caracteres           |

Outputs: `valueChange: string`, `focused: FocusEvent` y `blurred: FocusEvent`.

```html
<app-textarea-field
  inputId="project-description"
  label="Descripción"
  [(value)]="description"
  [rows]="6"
  [maxLength]="500"
  helperText="Resume el alcance y la ubicación."
/>
```

Buenas prácticas: permitir redimensionado vertical, evitar textareas para respuestas cortas y acompañar `maxLength` con un contador en la vista consumidora cuando sea relevante.

### 23.3 SelectField

**Propósito:** seleccionar una opción de una lista tipada y conservar un control `<select>` nativo, usable con teclado y tecnologías de asistencia.

```ts
interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}
```

| Input                         | Tipo / valor inicial                   | Propósito                                                    |
| ----------------------------- | -------------------------------------- | ------------------------------------------------------------ |
| `inputId`, `label`            | `string`, obligatorios                 | Asociación accesible y nombre visible                        |
| `options`                     | `readonly SelectOption[]`, obligatorio | Opciones disponibles                                         |
| `value`                       | `string`, `''`                         | Valor enlazable mediante `[(value)]`                         |
| `placeholder`                 | `string`                               | Opción inicial orientativa                                   |
| `name`, `helperText`, `error` | `string`                               | Metadatos y feedback                                         |
| `ariaDescribedBy`             | `string`                               | IDs descriptivos adicionales                                 |
| `disabled`, `required`        | `boolean`                              | Estados nativos                                              |
| `loading`                     | `boolean`, `false`                     | Deshabilita mientras se obtienen opciones y muestra progreso |

Outputs: `valueChange: string`, `focused: FocusEvent` y `blurred: FocusEvent`.

```html
<app-select-field
  inputId="project-sector"
  label="Sector"
  placeholder="Selecciona un sector"
  [options]="sectorOptions"
  [(value)]="sector"
/>
```

Buenas prácticas: usar labels breves, ordenar opciones de manera predecible y no sustituir el select nativo por una lista visual si no existe una necesidad funcional real.

### 23.4 Badge

**Propósito:** comunicar una categoría o estado corto. Las variantes son `neutral`, `accent`, `success`, `warning`, `error` e `info`; los tamaños son `small` y `medium`.

| Input       | Tipo / valor inicial      | Propósito                                                        |
| ----------- | ------------------------- | ---------------------------------------------------------------- |
| `variant`   | `BadgeVariant`, `neutral` | Significado visual                                               |
| `size`      | `BadgeSize`, `small`      | Densidad del badge                                               |
| `dot`       | `boolean`, `false`        | Añade un indicador visual no textual                             |
| `ariaLabel` | `string`                  | Nombre alternativo cuando el contenido visible no sea suficiente |

No emite outputs. El texto se proyecta con `<ng-content>`.

```html
<app-badge variant="success" dot>Publicado</app-badge>
<app-badge variant="accent">Destacado</app-badge>
```

Buenas prácticas: escribir una o dos palabras, no convertir el badge en botón y usar color solo cuando exista un significado. `accent` se reserva para información excepcional.

### 23.5 Alert

**Propósito:** comunicar feedback contextual. Las variantes son `neutral`, `info`, `success`, `warning` y `error`. Error usa `role="alert"` y anuncio assertive; las demás usan `role="status"` y anuncio polite.

| Input         | Tipo / valor inicial      | Propósito                   |
| ------------- | ------------------------- | --------------------------- |
| `variant`     | `AlertVariant`, `neutral` | Nivel semántico del mensaje |
| `title`       | `string`                  | Encabezado opcional         |
| `dismissible` | `boolean`, `false`        | Muestra la acción de cierre |

| Output      | Valor  | Propósito                                      |
| ----------- | ------ | ---------------------------------------------- |
| `dismissed` | `void` | Solicita al componente padre retirar la alerta |

```html
@if (showAlert()) {
<app-alert
  variant="error"
  title="No se guardaron los cambios"
  dismissible
  (dismissed)="showAlert.set(false)"
>
  Revisa los campos marcados.
</app-alert>
}
```

Buenas prácticas: explicar qué ocurrió y qué puede hacer la persona. El componente emite el cierre pero el estado de visibilidad pertenece al consumidor.

### 23.6 Modal

**Propósito:** presentar una decisión o tarea breve sobre el contenido actual. Las variantes de tamaño son `small`, `medium` y `large`.

| Input             | Tipo / valor inicial  | Propósito                                    |
| ----------------- | --------------------- | -------------------------------------------- |
| `modalId`         | `string`, obligatorio | Base estable para IDs ARIA                   |
| `title`           | `string`, obligatorio | Nombre accesible del diálogo                 |
| `description`     | `string`              | Descripción asociada con `aria-describedby`  |
| `size`            | `ModalSize`, `medium` | Ancho máximo del panel                       |
| `open`            | `boolean`, `false`    | Estado enlazable mediante `[(open)]`         |
| `dismissible`     | `boolean`, `true`     | Permite cerrar el diálogo                    |
| `closeOnBackdrop` | `boolean`, `true`     | Cierra al seleccionar el fondo               |
| `closeOnEscape`   | `boolean`, `true`     | Cierra mediante Escape                       |
| `loading`         | `boolean`, `false`    | Marca `aria-busy` y bloquea cierre/contenido |
| `showFooter`      | `boolean`, `true`     | Muestra el área de acciones                  |

| Output       | Valor                                | Propósito                                     |
| ------------ | ------------------------------------ | --------------------------------------------- |
| `openChange` | `boolean`                            | Cambio generado automáticamente por `model()` |
| `closed`     | `'button' \| 'backdrop' \| 'escape'` | Informa el motivo de cierre interno           |

El contenido principal se proyecta normalmente. Las acciones usan el atributo `modal-actions`.

```html
<app-modal modalId="quote-modal" title="Solicitar cotización" [(open)]="modalOpen">
  <p class="text-body text-text-secondary">Completa los datos básicos del proyecto.</p>

  <app-button modal-actions variant="ghost" (click)="modalOpen.set(false)"> Cancelar </app-button>
  <app-button modal-actions variant="accent">Continuar</app-button>
</app-modal>
```

El modal mueve el foco al abrir, lo contiene mientras está activo y lo devuelve al elemento anterior al cerrar. Buenas prácticas: no encadenar modales, mantener títulos concretos, limitar el contenido y usar `loading` durante una operación que no debe interrumpirse.

### 23.7 Loading

**Propósito:** indicar que una región está esperando datos o completando una operación. Las variantes visuales son `spinner` y `dots`; los tamaños son `small`, `medium` y `large`; los layouts son `inline` y `block`.

| Input       | Tipo / valor inicial        | Propósito                                       |
| ----------- | --------------------------- | ----------------------------------------------- |
| `variant`   | `LoadingVariant`, `spinner` | Representación visual                           |
| `size`      | `LoadingSize`, `medium`     | Tamaño del indicador                            |
| `layout`    | `LoadingLayout`, `block`    | Flujo compacto o región centrada                |
| `label`     | `string`, `Cargando`        | Mensaje anunciado por tecnologías de asistencia |
| `showLabel` | `boolean`, `true`           | Muestra u oculta visualmente la etiqueta        |

No emite outputs.

```html
<app-loading label="Cargando proyectos" />
<app-loading variant="dots" layout="inline" label="Procesando" [showLabel]="false" />
```

Buenas prácticas: describir qué se está cargando, mostrar loading solo en la región afectada y no presentar empty-state mientras la carga continúa.

### 23.8 EmptyState

**Propósito:** explicar la ausencia de datos y ofrecer un siguiente paso opcional. Tiene presentación normal y `compact`.

| Input          | Tipo / valor inicial  | Propósito                                     |
| -------------- | --------------------- | --------------------------------------------- |
| `emptyStateId` | `string`, obligatorio | Base estable para IDs ARIA                    |
| `title`        | `string`, obligatorio | Explicación principal                         |
| `description`  | `string`              | Contexto o próximo paso                       |
| `compact`      | `boolean`, `false`    | Reduce padding y radio para espacios pequeños |

No emite outputs. Admite los slots `empty-state-icon` y `empty-state-actions`; si no se entrega icono usa una ilustración geométrica neutra.

```html
<app-empty-state
  emptyStateId="empty-projects"
  title="Aún no hay proyectos"
  description="Crea el primero para comenzar."
>
  <app-button empty-state-actions (click)="createProject()">Crear proyecto</app-button>
</app-empty-state>
```

Buenas prácticas: distinguir ausencia de datos de error y loading, mantener una sola acción principal y explicar el estado con lenguaje directo.

## 24. Arquitectura CSS con Tailwind CSS 4.3.3

El Design System usa las APIs CSS-first de Tailwind CSS 4.3.3. La elección entre `@theme`, `@utility` y `@apply` depende del tipo de abstracción; no se crea una clase semántica para cada combinación que aparece en una vista.

| API        | Responsabilidad en el sistema                                                                 |
| ---------- | --------------------------------------------------------------------------------------------- |
| `@theme`   | Registrar tokens que Tailwind convierte en utilidades, como tipografía, colores, radios y sombras |
| `@utility` | Declarar patrones visuales semánticos, estables y reutilizables entre componentes o vistas    |
| `@apply`   | Componer utilidades atómicas dentro de una `@utility` cuando mejora la legibilidad de su definición |

### 24.1 Escala tipográfica mediante `@theme`

Los roles tipográficos se registran en `src/styles/theme.css` con el namespace `--text-*`. Tailwind genera a partir de ellos las utilidades públicas del Design System y aplica conjuntamente tamaño, line-height, letter-spacing y peso cuando el rol los define:

- `text-display-xl`
- `text-display`
- `text-heading-1`
- `text-heading-2`
- `text-heading-3`
- `text-heading-4`
- `text-body-lg`
- `text-body`
- `text-body-sm`
- `text-caption`
- `text-eyebrow`

```css
@theme {
  --text-heading-2: clamp(1.625rem, 3vw, 2rem);
  --text-heading-2--line-height: 1.18;
  --text-heading-2--letter-spacing: -0.025em;
  --text-heading-2--font-weight: 600;
}
```

```html
<h2 class="text-heading-2 text-text-primary">Proyectos destacados</h2>
<p class="text-body text-text-secondary">Contenido habitual de la sección.</p>
```

No se deben reconstruir estos roles en los templates con combinaciones como `text-3xl font-semibold leading-tight tracking-tight`, ni crear tamaños arbitrarios equivalentes.

### 24.2 Patrones reutilizables mediante `@utility`

Las siguientes utilidades encapsulan patrones compartidos con un significado estable:

| Utilidad            | Responsabilidad                                                        |
| ------------------- | ---------------------------------------------------------------------- |
| `app-container`     | Ancho máximo, centrado y gutters fluidos de la aplicación              |
| `reading-container` | Ancho de lectura para encabezados, texto extenso y formularios         |
| `section-space`     | Espaciado vertical fluido de las secciones                             |
| `form-label`        | Presentación común de las etiquetas de formulario                      |
| `form-control`      | Superficie, geometría y estados de inputs, selects y textareas         |
| `form-helper`       | Texto auxiliar asociado a un control                                   |
| `form-error`        | Mensaje de validación asociado a un control                            |
| `form-choice`       | Base visual de checkbox y radio nativos                                |
| `badge`             | Geometría, densidad y presentación neutral de una etiqueta             |
| `badge-*`           | Color semántico de badges: accent, success, warning, error e info      |

Estas utilidades pueden usar `@apply` internamente para componer primitivas de Tailwind y CSS nativo para valores o estados propios del sistema:

```css
@utility form-label {
  @apply mb-2 inline-block text-body-sm font-semibold text-text-secondary;
  line-height: 1.4;
}

@utility form-control {
  @apply min-h-[2.875rem] w-full rounded-control border border-border bg-surface px-4 py-3 text-text-primary;

  &:focus-visible {
    border-color: var(--color-focus);
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
}
```

Las variantes del componente `app-badge` se resuelven con `badge`, `badge-accent`, `badge-success`, `badge-warning`, `badge-error` y `badge-info`. El tamaño `medium` conserva únicamente los overrides atómicos necesarios; no duplica la base visual.

### 24.3 Límite de la abstracción

Las utilidades de layout que describen la composición de una sección concreta permanecen en su template. Por ejemplo:

```html
<div class="mt-8 grid gap-4 md:grid-cols-3">...</div>
```

No se debe convertir esa combinación en una clase nueva si solo aparece en una sección. Clases como `mt-8`, `grid`, `flex`, `gap-4` o `md:grid-cols-3` se encapsulan únicamente cuando forman parte de un patrón compartido, estable y con significado dentro del Design System.

Antes de crear una nueva utilidad semántica deben cumplirse estas condiciones:

- El patrón aparece o previsiblemente aparecerá en más de un componente o vista.
- Su nombre expresa una responsabilidad visual clara, no la ubicación donde nació.
- Su definición es estable entre temas y tamaños de pantalla.
- Reduce repetición sin ocultar el layout particular del template.

La documentación está excluida del escaneo de clases mediante `@source not '../docs'`, por lo que los ejemplos de esta guía no generan CSS que la aplicación no utilice.

## 25. Accesibilidad de la persona usuaria

Un botón flotante abajo a la izquierda (el de WhatsApp está abajo a la derecha) abre un panel no modal con cinco opciones y "Restablecer todo". En el panel de administración se integra en la barra superior con `placement="inline"`.

### 25.1 Piezas

| Pieza | Ubicación | Responsabilidad |
| --- | --- | --- |
| `AccessibilityService` | `core/services/accessibility.service.ts` | Estado con signals, persistencia versionada (`isanorte:a11y:v1`) y atributos `data-*` en `<html>`. El modo oscuro delega en `ThemeService`. |
| `AccessibilityWidget` | `shared/components/accessibility-widget` | Botón y panel. Montar una sola vez por layout (público, ISADECOR y topbar del admin). |
| `accessibility.css` | `src/styles/accessibility.css` | Estilos de cada opción; sobrescribe tokens `--theme-*` existentes, sin tokens nuevos. |
| Script de `index.html` | `src/index.html` | Aplica los atributos antes del primer pintado. Debe mantenerse alineado con el servicio. |

### 25.2 Atributos sobre `<html>`

| Atributo | Valores | Efecto |
| --- | --- | --- |
| `data-theme` | `light`, `dark` | Tema (ThemeService). |
| `data-contrast` | `high` | Alto contraste, combinable con claro y oscuro. |
| `data-text-size` | `0`, `1`, `2`, `3` | Texto al 100, 115, 130 y 150 % mediante el `font-size` raíz. |
| `data-motion` | `reduce` | Sin animaciones ni transiciones. |
| `data-links` | `highlight` | Enlaces de contenido subrayados, en negrita y con fondo. |

Valores iniciales: lo guardado y, si no hay nada, `prefers-color-scheme`, `prefers-contrast: more` y `prefers-reduced-motion: reduce`. Solo se guarda cuando la persona cambia algo; "Restablecer todo" borra lo guardado y vuelve a los valores del sistema.

### 25.3 Alto contraste

Reasigna los `--theme-*` bajo `html[data-contrast='high'][data-theme='light'|'dark']` (y las secciones internas `[data-theme='dark']`). Peores casos medidos del texto sobre cualquier superficie: 7,08:1 en claro y 7,43:1 en oscuro; bordes de controles y foco por encima de 3:1. El foco pasa a 3 px, se eliminan sombras de texto y desenfoques de fondo. Los componentes deben consumir tokens semánticos (`text-text-primary`, `border-border`…) para adaptarse solos.

### 25.4 Texto grande

Los tokens tipográficos y las utilidades de Tailwind están en rem, así que basta con cambiar el `font-size` raíz. Dos salvedades:

- Las media queries en rem no siguen al `font-size` raíz. Las barras de navegación usan las variantes `nav-md:` (público) y `nav-lg:` (ISADECOR), definidas en `accessibility.css`, que retrasan el paso a escritorio según el nivel de texto (hasta 96 rem con 130 % y 150 %); antes se muestra el menú móvil.
- Con texto grande se aplica `overflow-wrap: anywhere` y los `app-button` pueden partir su etiqueta, para evitar scroll horizontal a 320 px.

Al crear logos o elementos con ancho en rem dentro de filas flex, permitir que encojan (`min-w-0 shrink`).

### 25.5 Enlaces resaltados

Aplica a `a[href]`, excepto los que son botones (`rounded-button`), los circulares (`rounded-full`), `[role='button']` y los marcados con `data-a11y-skip`. Los enlaces que envuelven una imagen se resaltan con contorno. Para excluir un enlace concreto, añadir `data-a11y-skip`.

### 25.6 Cómo probar

1. Abrir el botón, activar cada opción y recargar: todas persisten (`localStorage['isanorte:a11y:v1']`).
2. Alto contraste: revisar en claro y oscuro; los controles deben tener borde visible y el foco ser grueso.
3. Texto: pasar a 150 % y revisar a 320 px que no hay scroll horizontal (`document.documentElement.scrollWidth <= clientWidth`).
4. Animaciones: activar y comprobar que todo el contenido de `reveal-stagger`, `cinematic-tour` y carruseles queda visible y estático.
5. Teclado: Escape cierra el panel y devuelve el foco al botón.
6. Pruebas: `npx ng test --watch=false --include='src/app/core/services/accessibility.service.spec.ts' --include='src/app/shared/components/accessibility-widget/accessibility-widget.spec.ts'`.

### 25.7 Limitaciones conocidas

- Colores fijos fuera de los tokens (p. ej. el verde del botón de WhatsApp) no cambian con alto contraste.
- Los textos sobre imágenes dependen de sus overlays; en alto contraste se recomienda mantener overlays oscuros opacos.
- "Reducir animaciones" no pausa vídeos incrustados.

## 26. Patrones de tienda (ISADECOR)

Patrones definidos para la Home de ISADECOR. Se reutilizan en el resto de la tienda cuando aplique. El contenido llega del backend (`GET .../unidades/isadecor/home`) y es editable desde administración; ver `docs/isadecor/ESTRUCTURA-HOME.md`.

| Patrón | Descripción y reglas |
| ------ | -------------------- |
| **Escena con scroll** (`app-arma-ambiente`) | Hero y recorrido en una sola pieza: un video a pantalla completa avanza con el scroll y cada paso presenta una categoría. Respaldo estático; botón fijo "Ir a la tienda"; pasos navegables; encuadre adaptado en móvil. |
| **Cinta de avisos** (`app-home-ribbon`) | Franja delgada con textos cortos y enlaces opcionales, editables desde administración. Se pausa al pasar el cursor o enfocar; con movimiento reducido queda estática. |
| **Promociones** (`app-home-promo-banner`) | Una promoción grande y dos pequeñas, siempre con producto real, etiqueta (`-20 %` o `Nuevo`), precio anterior y actual, vigencia y destino directo. Se ocultan al vencer; máximo tres. |
| **Tarjeta de producto** (`app-home-product-tile`) | Foto, categoría, nombre, precio por unidad, etiqueta de descuento y acción según modalidad: *Comprar* (relleno) o *Cotizar* (contorno). |
| **Filtro de tienda** | Chips de categoría y "Ofertas" sobre una cuadrícula (2, 3 o 4 columnas). Sin carruseles ni barras de scroll horizontal visibles. |
| **Cabecera de tienda** (`app-isadecor-navbar`) | Tres niveles fijos: aviso fino (envíos e instalación), logo + buscador central + cuenta + carrito, y fila de categorías con la zona de entrega. En móvil el buscador pasa a su propia fila. |
| **Campaña editable** | Una tarjeta con texto y foto para una temporada o lanzamiento, con enlace a una categoría. Se oculta si no hay campaña. |
| **Fila "Fáciles de instalar"** | Productos marcados como fáciles de instalar, elegidos por demanda o fijados a mano, en cuadrícula con enlace a su categoría; sin carrusel. Se oculta si no hay productos. |
| **Franja de confianza** | Envío, instalación, garantía y pago en una línea de cuatro. Contenido fijo en el código (`isadecor-home.static.ts`); los textos son de muestra hasta confirmarlos con el cliente. |
| **Bloque para constructoras y arquitectos** | Texto, botón de presupuesto y lista de cuatro puntos separados por filetes. |
| **Pie de confianza** (`app-isadecor-footer`) | Compra con confianza, ayuda, medios de pago (texto en mono) y legales; incluye Libro de Reclamaciones (confirmar enlace y obligación con el cliente). Los elementos sin destino aún se muestran como texto. |
| **Tarjeta de producto** | Añade muestras de color de los acabados (los agotados se atenúan y se anuncian como «agotado»), valoración con estrellas y número de reseñas, plazo de entrega en mono y «Quedan N» cuando el stock es bajo. |

Estados: la Home hace una sola petición; mientras carga muestra esqueletos, si falla ofrece «Reintentar» y toda sección sin contenido activo se oculta (sin cajas vacías).

Orden de la Home de tienda: cabecera (buscar, categorías, entrega), escena, cinta y promociones, campaña, elegir (selección filtrable de ocho), fila de fáciles de instalar, franja de confianza, constructoras y arquitectos, reseñas y pie de confianza.

### 26.1 Catálogo y ficha

- **Tarjeta compartida.** Imagen cuadrada y un enlace que ocupa la tarjeta completa. Hasta cinco muestras con nombre y estado, valoración, precio por unidad y plazo de entrega. Comprar usa relleno naranja, Cotizar usa borde y Agotado sustituye la acción.
- **Catálogo.** Encabezado con búsqueda y conteo anunciado, filtros activos quitables y cuadrícula de 2/3/4 columnas. Los filtros se comparten por URL. Panel lateral pegajoso en escritorio y diálogo modal operable con Tab y Escape en móvil.
- **Ficha.** Galería con imagen por acabado, bloque de compra pegajoso y barra inferior móvil. Los acabados usan radios nativos con nombre visible y cantidad de stock disponible cuando es baja. Después de la compra van los detalles en acordeón, opiniones y recomendaciones.

Detalles de datos y navegación en [Estructura del catálogo](isadecor/ESTRUCTURA-CATALOGO.md).

## 27. Dirección visual de ISADECOR: Showroom

Dirección adoptada para ISADECOR tras comparar cinco propuestas. Se activa con la clase `showroom` del layout de ISADECOR (`src/styles/showroom.css`), sin afectar a ISANORTE ni a administración.

- **Tipografía:** Outfit para titulares y nombres de producto (geométrica minimalista; peso 500, tracking -0.03em), Hanken Grotesk para cuerpo y controles, y JetBrains Mono para eyebrows, medidas, unidades y fechas. Se cargan desde Google Fonts en `index.html` (pendiente autoalojarlas).
- **Forma:** esquinas contenidas (control 4 px, botón y card 6 px, panel 8 px) mediante la sobrescritura de `--radius-*`. `rounded-full` solo en chips.
- **Color:** los tokens de marca en claro y oscuro; un solo acento naranja. El naranja aparece como filete (`filete-b`, `filete-l`), etiqueta de oferta, botón de acción y separador de la cinta; no como bloque de color.
- **Composición:** la imagen manda y el texto va en su propia zona (promociones con imagen a un lado y texto al otro). Una ficha destacada y dos secundarias, no tres iguales. Cinta de avisos como filete fino con separadores `/`.
- **Excepción documentada:** la escena con scroll del Home superpone texto sobre el video; es el único caso y mantiene contraste mediante degradado.
