# Panel de administración (`/admin`)

Guía de cómo está organizado el admin y cómo cargar contenido. Cambios de la mejora de
noviembre 2026 (navegación, listado de productos, formulario, contenido del sitio).

## Menú

El menú (`layouts/admin-layout/components/admin-navigation.ts`, única fuente: lo usan la barra
lateral y el título de la barra superior) se agrupa por marca:

| Grupo | Pantallas |
| --- | --- |
| Principal | Dashboard |
| ISADECOR · Tienda | Productos, Categorías, Cotizaciones, Pedidos |
| ISADECOR · Home | Hero, Cinta, Promociones, Campaña, Secciones, Bloque de servicio, Puntos, Reseñas, Videos |
| ISANORTE · Web | Landing, Proyectos, Servicios, Contacto |
| ISANORTE · Confianza y contenido | FAQs, Equipo, Credenciales, Testimonios, Garantías, Pasos, Políticas, Galería |
| Sitio y empresa | Páginas y SEO, Empresa, Unidades de negocio, Configuración |

- Los grupos se pliegan; el de la página actual se abre solo (y se vuelve a abrir al navegar a él).
- El buscador «Buscar pantalla…» filtra por nombre, ignora acentos y abre los grupos con coincidencias.
- Para añadir una pantalla: editar solo `ADMIN_NAVIGATION`.

## Productos

**Listado**
- Búsqueda (nombre, SKU, slug) y filtros de categoría, estado y stock (agotados / stock bajo).
  Los filtros se combinan; «Quitar filtros» los limpia.
- Miniatura (foto principal), stock total y estado. Stock total = suma de los acabados con
  control; si no hay acabados, el stock del propio producto. «Bajo» = igual o menor que el aviso
  de poco stock del producto.
- La estrella destaca / quita destacado sin abrir el formulario.
- 20 por página. En móvil (<768 px) la tabla pasa a tarjetas.
- El stock del listado es solo de lectura: se ajusta en el formulario, sección «Inventario»,
  porque cada ajuste queda en el historial de movimientos.

**Formulario**
- Barra de chips arriba para saltar a cada una de las 9 secciones.
- Si hay cambios sin guardar en los campos, cerrar (Cancelar, ✕ o clic fuera) pide confirmar.
  Las subidas de imágenes/variantes/documentos se guardan al instante y no cuentan como pendientes.

## Contenido del sitio (`/admin/sitio/*`, `/admin/home-isadecor/*`)

- Formularios con los componentes compartidos (campos, botones, alertas, estado vacío).
- Eliminar abre un modal de confirmación (ya no `window.confirm`).
- Orden: flechas ↑/↓ en cada fila intercambian el orden con el vecino (dos `PUT`); el campo
  «Orden» del formulario sigue disponible.

## Landing, Empresa y Configuración

- **Landing** (`/admin/landing`): la tabla de secciones ya no se desborda (la columna «Contenido» pasó
  a una línea de resumen bajo el título). El estado es un botón: clic para mostrar u ocultar.
  Cada fila tiene «Diapositivas (n)» (solo el hero), «Botones (n)» y «Editar».
- **Vista previa** (pestaña por defecto): la web pública real (`/?editor=1`) dentro de un iframe del
  mismo origen, reducida para caber, con selector Escritorio / Móvil (en pantallas estrechas arranca
  en Móvil). Al tocar un bloque de la página, o elegirlo de la lista, el panel lateral ofrece:
  editar textos/imagen/botón (el mismo formulario de la sección), diapositivas y botones (hero),
  mostrar/ocultar, o ir a la pantalla donde se edita su contenido (servicios, proyectos, pasos,
  garantías, testimonios, FAQs, unidad de negocio). Al guardar, la vista previa se recarga y
  conserva el bloque marcado.
  - Cómo funciona: `shared/utils/editor-bridge.ts` activa en la página pública, solo dentro de un
    iframe con `?editor=1`, el resaltado de `<section id>` y un `postMessage` (mismo origen) con el
    bloque tocado; el admin responde con otro mensaje para marcar/desplazar. La Home lo inicia en
    `features/isanorte/home/home.ts`. El mapa bloque → editor está en `PREVIEW_BLOCKS`
    (`admin-landing.ts`).
  - Para añadir un bloque nuevo: darle `id` a su `<section>` en la Home y una entrada en `PREVIEW_BLOCKS`.
  - **Editor del Hero en el panel lateral** («Editar la portada»; sustituye al cajón con 4 pestañas
    para ese bloque): una columna con interruptor «Visible en la web», textos (frase pequeña,
    título de 2 líneas, subtítulo — con su botón «Guardar textos» y aviso de cambios sin guardar),
    lista de **botones** (↑↓, editar, ocultar, quitar con confirmación, añadir con enlaces
    sugeridos) y lista de **fotos de fondo** (miniatura, descripción, ↑↓, ocultar, quitar, subir).
    Las listas se aplican al instante (la pantalla lo dice); los textos, al pulsar Guardar.
    Componente: `landing/components/hero-editor/`. Los demás bloques siguen usando el cajón
    `landing-section-form` hasta tener su propio editor.
  - **Edición «encima» de la página:** en el Hero, al tocar un texto de la vista previa (etiqueta,
    título, subtítulo) el panel muestra **solo ese campo** (enfocado); al tocar las fotos de fondo
    muestra solo la lista de fotos, y lo mismo con los botones. «Ver todos los campos» abre el
    formulario completo del Hero; «Editar la portada» también lo abre completo. Lo que se teclea en el panel se ve al instante en la página (borrador
    en vivo, sin guardar; al cerrar el editor o volver al texto guardado, la página se restaura).
    Cómo: los elementos llevan `data-edit-field="…"` en `home.html`; `editor-bridge.ts` envía el
    campo tocado y aplica los borradores **solo como texto** (nunca HTML). Si se toca una zona sin campo propio (p. ej. el fondo del Hero, tapado por el texto),
    se usa el `data-edit-fallback` de la sección (en el Hero, `fotos`). Un campo que la Home no
    dibuja (p. ej. la etiqueta vacía) no muestra borrador. Para hacerlo en otro bloque: marcar sus
    elementos con `data-edit-field` y darle su editor (como `hero-editor`).
  - **Título multilínea:** el título de una sección admite saltos de línea (la web del Hero lo parte en
    dos líneas). Antes se editaba en un campo de una línea que los descartaba («casaen»); ahora es un
    campo de varias líneas, en el editor del Hero y en el cajón.
  - Alcance actual: solo la Home de ISANORTE. ISADECOR puede reutilizar el mismo puente.
- Quedan además las pestañas «Secciones & Hero» (la tabla) y «Nosotros». Servicios, Proyectos, Contacto y
  Páginas y SEO ya no se incrustan: se enlazan en «También se edita en:». Los enlaces antiguos
  `?tab=servicios|proyectos|contenido|contacto` redirigen a su pantalla.
- **Empresa** y **Configuración del sitio** comparten encabezado con el resto (eyebrow
  «Sitio y empresa» + `h1`).

## Estilo: solo tokens

El admin usa únicamente los tokens del sistema de diseño (base de la unificación con Showroom):
radios `rounded-control` / `rounded-button` / `rounded-card` / `rounded-panel` (no `rounded-xl|lg|md`),
tamaños `text-caption` / `text-body-sm` / `text-body` / `text-heading-*` (no `text-xs|sm|base` ni
`text-[11px]`) y colores semánticos (`warning`, `error`, `success`, `info`, `accent`) en lugar de
paletas fijas (`amber-*`, `red-*`). Así, cuando el tema base cambie, el admin cambia con él.

- `npm run lint:tokens` (`scripts/check-design-tokens.mjs`) falla si aparece un valor fijo en
  `features/admin` o `layouts/admin-layout`. Una línea con `design-tokens-ignore` se salta (hoy
  solo la maqueta oscura de `admin-isadecor-landing`, que imita la web).
- `rounded-full` se mantiene para píldoras, puntos e interruptores (es forma, no un radio de tema).
- Pendiente fuera del admin: mover `showroom.css` a `theme.css` como base (a coordinar con la
  sesión de rediseño de la landing).

## Pendiente (opción C, no implementada)

Edición directa de textos sobre la propia vista previa (hoy el clic abre el formulario del bloque), vista previa de ISADECOR, dashboard con «pendientes» (agotados, cotizaciones sin responder, reseñas por revisar) y
enlaces «ver en la tienda» desde cada pantalla.

## Botones de la landing: fijos

Los botones de las secciones de la landing (p. ej. «Solicitar cotización», «Ver proyectos», «Ver todos los
servicios», «Conocer ISADECOR») llevan a otras páginas y **su destino no cambia nunca**, así que no son
administrables:

- **Backend:** se eliminaron `POST /api/secciones-landing/{id}/acciones` y
  `PUT|DELETE /api/secciones-landing/{id}/acciones/{accionId}` (y su DTO, servicio y validaciones de
  enlace). Siguen leyéndose dentro de la sección (`acciones`) y en la Home pública, solo lectura.
  Las filas existentes están en la base de datos (`acciones_landing`); un botón nuevo solo se añade con
  una migración o SQL, no desde el admin. Cubierto por `DynamicContentApiIntegrationTest`
  (`lasAccionesDeLaLandingNoSeAdministran`).
- **Admin:** desaparecieron «Botones (n)», el gestor de botones, la lista de botones del editor del Hero y la
  pestaña «Botón principal» del formulario de sección. El panel de bloque muestra los botones de cada
  sección como «Botones fijos» (texto y destino, solo lectura). Al guardar una sección se conservan los
  campos `textoBoton`/`enlaceBoton` que ya tuviera.

## Edición por campo en Servicios

En el bloque «Servicios» de la vista previa:
- **Título de la sección:** al tocarlo, el panel muestra solo ese campo (se guarda en la sección SERVICIOS de la landing).
- **Tarjetas:** cada tarjeta es un **servicio real** (el mismo que alimenta la página `/servicios`). Al tocar su nombre o su
  descripción corta se edita ese campo del servicio (`PUT /api/servicios/{id}` con el resto de campos sin tocar), así que el
  cambio se refleja también en `/servicios`. Se identifican por slug (`data-edit-item="servicio:<slug>"`).
- Tocar el nombre o el párrafo abre solo ese campo; tocar el resto de la tarjeta abre nombre y descripción juntos.
- El resto de la ficha (descripción larga, beneficios, imagen) se edita en `/admin/servicios`.

## Edición por campo en «Por qué elegir a ISANORTE» (garantías)

Cada tarjeta es una **garantía real** (tabla `garantias`, también editable en `/admin/sitio/garantias`). Tocar su título o su
texto abre solo ese campo; tocar el resto de la tarjeta, los dos. Guarda con `PUT /api/garantias/{id}` conservando
`enHero`, `orden` y `activo`. La API pública de confianza ahora incluye el `id` de cada garantía para poder identificarla.
La cabecera del bloque («Nuestro compromiso», «Por qué elegir a ISANORTE», la frase de abajo) es **texto fijo de la plantilla**,
no viene de la base de datos, por lo que no se edita desde el admin.
