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
| ISANORTE · Web | Landing, Proyectos, Servicios |
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
  `?tab=servicios|proyectos|contenido` redirigen a su pantalla.
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

## Edición por campo en Testimonios (y editor genérico de elementos)

Cada tarjeta de «Lo que dicen nuestros clientes» es un **testimonio real** (tabla `testimonios`, también en
`/admin/sitio/testimonios`). Tocar el texto, el nombre o el cargo abre solo ese campo; tocar el resto de la tarjeta, los tres.
La API pública de confianza incluye ahora el `id` de cada testimonio. La foto no se edita desde la vista previa.

Garantías y testimonios comparten un editor genérico (`content-item-editor`, configurado en `CONTENT_ITEMS`): para sumar otro
elemento de contenido del sitio basta marcar su tarjeta en la Home con `data-edit-item="<prefijo>:<id>"`, sus textos con
`data-edit-field="<clave>"` y añadir su entrada (endpoint y campos) a `CONTENT_ITEMS`.

## Preguntas frecuentes y bloque ISADECOR

- **Preguntas frecuentes:** cada pregunta del Home es una FAQ real (`/admin/sitio/faqs`). Tocar la pregunta abre solo ese campo; tocar el
  resto del desplegable, pregunta y respuesta juntas (el editor genérico `CONTENT_ITEMS.faq`). La API pública de confianza incluye
  el `id` de cada FAQ. La cabecera («Dudas comunes», «Preguntas frecuentes», la frase y el recuadro de WhatsApp) es texto fijo.
- **Bloque «Unidad ISADECOR»:** el **título** se edita al tocarlo (es el título de la sección UNIDAD_NEGOCIO de la landing). La
  **descripción** y los **puntos con check** salen de la unidad de negocio (`unidades_negocio.descripcion` y `.ofertas`):
  - Tocar la descripción abre solo ese campo (se ve en vivo); tocar los puntos abre solo «Puntos de oferta» (un punto por línea,
    se ven al guardar; se guardan separados por « | »); tocar otra zona del bloque de texto abre ambos.
  - Guarda con `PUT /api/unidades-negocio/{id}` conservando el resto de la unidad (incluida `ofertas`, que el formulario de
    `/admin/unidades-negocio` no envía: ver nota abajo). Componente: `unit-field-editor`.

> Nota: el formulario de `/admin/unidades-negocio` no incluye el campo `ofertas` en su petición; conviene revisar que guardar desde
> allí no borre los puntos de oferta (no se verificó).

## «Cómo trabajamos» (pasos del proceso)

Cada paso es un registro real (`pasos_proceso`, también en `/admin/sitio/pasos-proceso`). Tocar su título o su texto abre solo ese campo;
tocar el resto del paso, los dos (editor genérico, `CONTENT_ITEMS.paso`). La API pública incluye el `id` de cada paso. Solo se tocan los
textos: la animación con scroll de esa sección no se modifica (solo se añaden atributos `data-edit-*`). El título de la sección
(«Del terreno a la llave en mano, con un solo equipo») es texto fijo de la plantilla.

## Cabeceras de bloque editables (`textos_bloque`)

Las cabeceras de «Por qué elegir a ISANORTE» (garantías), Testimonios, Preguntas frecuentes y «Cómo trabajamos» ya no son texto fijo:
se guardan en la tabla `textos_bloque` (migración `V9`; una fila por bloque con `clave`, `etiqueta`, `titulo`, `subtitulo`).
- **Backend:** `GET /api/textos-bloque` y `PUT /api/textos-bloque/{clave}` (admin; claves: `garantias`, `testimonios`, `preguntas`,
  `proceso`; un campo en blanco vuelve al texto por defecto). La API pública de confianza devuelve `textos`.
- **Frontend:** `shared/content/block-texts.ts` define los textos por defecto; la Home usa `trust.blockText(clave, campo)` (el guardado o,
  si no hay fila, el por defecto). Al tocar la frase, el título o el subtítulo de la cabecera, el panel abre solo ese campo
  (`block-text-editor`), con escritura en vivo. Solo se pueden tocar los campos que el bloque tiene (p. ej. «Cómo trabajamos» solo el título).

## Proyectos: título y orden

- El **título** del bloque se edita al tocarlo (sección PROYECTOS de la landing).
- Las **tarjetas** no se editan en texto: al tocar una se abre «Proyectos en la Home» (`projects-order-editor`), donde solo se cambia
  **qué proyectos salen y en qué orden** (campos `destacado` y `orden`). La Home muestra los 4 primeros activos y destacados por
  orden; los demás aparecen atenuados con aviso. Los textos y fotos de cada proyecto siguen en `/admin/proyectos`.

## Vista previa de «Nosotros» (fase 1)

La vista previa tiene un selector **Inicio / Nosotros**. La página Nosotros usa el mismo puente (`?editor=1`, `editor-bridge.ts` iniciado en
`about.ts`) y sus secciones tienen `id` (`cabecera`, `estadisticas`, `valores`, `equipo`, `credenciales`, `cobertura`; lista en `ABOUT_BLOCKS`).

Ya se editan, tocando el texto (un campo cada vez, con escritura en vivo salvo listas y números):
- **Cabecera:** título, introducción y descripción (contenido de página NOSOTROS, `/api/contenidos-pagina`). El rótulo «NOSOTROS» es fijo.
- **Misión, Visión y Valores** (campos de la empresa; los valores, uno por línea, se guardan separados por « | »).
- **Año de fundación** y **lugares de cobertura** (separados por coma), de la empresa.
- **Cabeceras** de Equipo, Credenciales y respaldo, y «Dónde trabajamos» (`textos_bloque`, claves `equipo`, `credenciales`, `cobertura`). Los rótulos «RESPALDO» y «COBERTURA» son fijos.

La empresa se guarda con `PUT /api/empresa/{id}` enviando solo sus campos planos (`EmpresaUpdateRequest`): las redes sociales y estadísticas
no se tocan. - **Estadísticas** («+12 años», «+85»…): tocar la cifra abre prefijo, cifra y sufijo; la etiqueta, solo ella; el resto de la tarjeta, los cuatro
  campos. Escritura en vivo (la cifra se ve como prefijo + cifra + sufijo). La página pública no expone el `id` de las estadísticas, así que se
  localizan por su **orden**; se guardan con `PUT /api/empresa/{empresaId}/estadisticas/{id}` (`statistic-editor`).
- **Etiquetas de la cabecera** («Cajamarca», «Obra con garantía»…): una por línea (campo `tags` del contenido de página).

- **Equipo y credenciales** (fase 2): cada tarjeta es un registro real (`/api/equipo`, `/api/credenciales`). Tocar su nombre, cargo, especialidad,
  biografía, foto, entidad, tipo, código o año abre solo ese campo (las credenciales no llevan imagen: todas muestran el escudo por defecto); tocar el resto de la tarjeta, todos. El formulario permite **cambiar la foto**
  (subida, solo en los miembros), elegir el **tipo** de credencial y **eliminar** el elemento (con confirmación). En el panel del bloque, «Añadir un miembro» y «Añadir una
  credencial» abren el formulario de alta (se crea al final de la lista, activo). La API pública incluye ahora el `id` de cada miembro y credencial.
  El editor genérico (`content-item-editor`) soporta campos de imagen, selectores, alta y baja.

- **Mapa** (fase 3): tocar el mapa de «Dónde trabajamos» abre el **selector de ubicación** (mapa Leaflet/OpenStreetMap, clic o arrastrar el pin) y la
  dirección que se muestra bajo el mapa; se guarda en la empresa (`latitud`, `longitud`, `direccion`) con `PUT /api/empresa/{id}`. El mapa incrustado es
  un iframe de otro origen y se traga los clics, así que en modo editor el puente le añade una capa transparente (`[data-edit-field=ubicacion]::after`).

Pendiente de «Nosotros»: reordenar equipo y credenciales desde la vista previa (hoy se hace en `/admin/sitio/equipo` y `/admin/sitio/credenciales`).

## Vista previa de «Servicios»

El selector de la vista previa suma **Servicios** (`/servicios?editor=1`; bloques `cabecera`, `servicios`, `preguntas`; `SERVICES_BLOCKS`).
- **Título de la página** (contenido de página SERVICIOS): tocar el título abre solo ese campo. El rótulo superior es fijo.
- **Tarjetas de servicio** (`service-card-editor`): cada tarjeta es un servicio real (`/api/servicios`, también en `/admin/servicios`). Tocar el nombre, la
  descripción, la foto o la lista de puntos abre solo eso; tocar el resto de la tarjeta, todo junto. Los **puntos** se escriben uno por línea y se sincronizan
  con los beneficios del servicio (edita, añade y quita según haga falta). «Añadir un servicio» crea uno nuevo al final (el `slug` sale del nombre; la
  **foto es obligatoria**, el servidor no deja publicar un servicio sin imagen). «Quitar de la web» (pide confirmación) **desactiva** el servicio: no se borra
  (el backend no tiene `DELETE` de servicios) y se reactiva desde `/admin/servicios`. El botón «Cotizar este servicio» es fijo.
- **Preguntas frecuentes** (ámbito SERVICIOS): editar pregunta y respuesta, **añadir** («Añadir una pregunta» crea una con ámbito SERVICIOS) y eliminar.
  La cabecera del bloque («Antes de contratar»…) es texto fijo.

La API pública de la página Servicios incluye ahora el `id` de cada servicio. El editor de la Home usa los servicios por `slug` (`servicio:<slug>`); la
página Servicios usa `svc:<id>` para no mezclarlos.

## Vista previa de «Proyectos»

El selector de la vista previa incluye **Proyectos** (`/proyectos?editor=1`) con dos bloques: **Título** y **Proyectos**.

- **Título**: edita el contenido de página `PROYECTOS` (frase, título…).
- **Tarjetas de proyecto** (`data-edit-item="proy:<id>"`): tocar la portada, el nombre, la descripción, la ubicación o el periodo abre solo ese campo en el panel (`project-card-editor`).
- **Tocar el resto de la tarjeta** o **«Añadir un proyecto»** abre el **formulario completo** del proyecto (`project-full-editor`, el mismo de `/admin/proyectos`) sobre la vista previa: es un panel ancho con todos los campos, en vez del panel lateral estrecho. Al editar tiene las pestañas de fotos y testimonio; al crear, solo los datos, con el orden al final. Para quitar un proyecto de la web se usa su interruptor «activo» (no se borra).
- Los demás datos del proyecto (cliente, área, plazo, alcance, orden, destacado, galería) viajan sin cambios al guardar un campo suelto.
- **No se editan en la vista previa**: los filtros (derivados del tipo de obra) y el orden entre proyectos. La página de detalle de cada proyecto se gestiona en su ficha (ver abajo).
- Backend: la API pública de proyectos devuelve ahora el `id` de cada proyecto.

### Ficha completa del proyecto (`/admin/proyectos`)

Cada proyecto tiene colgados datos propios que se ven en su página de detalle. En lugar de editar esa página en la vista previa (demasiadas vueltas), todo se gestiona en **un solo formulario con pestañas**. Se llega tocando la tarjeta en la vista previa (abre el formulario sin salir de la página) o con «Editar» en el listado de `/admin/proyectos`. `/admin/proyectos?editar=<id>` también abre el proyecto indicado.

- **Datos**: nombre, descripción larga, ficha (cliente, ubicación, periodo, área, plazo, alcance, tipo de obra), portada, servicios, orden y destacado. Es el formulario de siempre.
- **Antes / durante / después** (`project-gallery-manager`): fotos de `proyecto_galeria` ligadas al proyecto por slug. Añadir (subida + etapa), cambiar la etapa (Antes, Durante la obra, Resultado, Detalle), subir/bajar y quitar con confirmación. Cada cambio se guarda al momento (`/api/proyecto-galeria`).
- **Testimonio** (`project-testimonial-manager`): testimonios con `proyectoSlug` igual al del proyecto; crear, editar y quitar (`/api/testimonios`). Al editar conserva foto, orden y estado.
- **El slug de un proyecto existente ya no se puede cambiar**: las fotos y los testimonios se enlazan por slug, no por id, y al cambiarlo quedaban huérfanos. En el alta sigue generándose automáticamente.
- Las pestañas de fotos y testimonio guardan por sí mismas; el botón «Guardar cambios» solo aplica a «Datos».

### Animación de aparición (corrección)

`app-reveal-stagger` esperaba a ver el 25 % del bloque entero (`threshold: 0.25`); en bloques altos (8 servicios ≈ 5000 px) nunca se alcanzaba y las tarjetas quedaban con `opacity: 0`, también en móvil. Ahora dispara con `threshold: 0` y un margen del 10 % inferior, y dentro de la vista previa del admin todo `[data-reveal]` queda visible.

### Pestañas eliminadas

`/admin/landing` ya no tiene barra de pestañas: muestra directamente la vista previa.

- **«Nosotros»**: misión, visión, valores, cobertura, año y estadísticas se editan tocándolos en la vista previa de Nosotros; el formulario completo sigue en `/admin/empresa`. Un enlace antiguo `?tab=nosotros` abre esa vista previa.
- **«Secciones & Hero»** (tabla de secciones con orden, visibilidad, alta/baja y escenas): se quitó entera porque ninguna de sus funciones se usaba. Lo que se conserva en la vista previa es editar los textos y las escenas del Hero y ocultar o mostrar una sección. El orden de las secciones de la portada ya no se cambia desde el admin.

### El formulario de contacto ya no guarda solicitudes

Las solicitudes se atienden por WhatsApp, así que el formulario de la web (página Contacto y bloque «Solicitar cotización» del Home) **no crea nada en el sistema**: al enviarlo abre WhatsApp en una pestaña nueva con el número de la empresa y un mensaje que lleva los datos escritos (nombre, teléfono, correo, empresa, servicio, ubicación y mensaje, solo los llenados). Si la empresa no tiene número de WhatsApp, avisa y no abre nada.

- Se eliminó la pantalla **Contacto** del admin (bandeja de solicitudes), su ruta, su entrada del menú y el atajo desde Landing.
- Backend: se quitaron `POST /api/publico/contacto` y `/api/solicitudes-contacto` (listar, ver y cambiar estado) con su servicio, repositorio, entidad y DTOs. **La tabla `solicitudes_contacto` se dejó intacta** (sin migración de borrado) para no perder solicitudes ya guardadas en producción; se puede eliminar con una migración cuando se hayan exportado.
- Las cotizaciones de ISADECOR (carrito/pedidos) son otro circuito y no se tocaron.

### Coherencia del admin (Fase 1 del plan de UX)

Detalle y estado en [plan-admin-ux.md](plan-admin-ux.md).

- **Encabezado común `AdminPageHeader`** (`features/admin/shared/admin-page-header`): rótulo, título, descripción y acciones proyectadas. Lo usan las 16 pantallas del admin. El título es siempre el nombre de la entrada del menú (Dashboard, Landing, Servicios, Categorías, Páginas y SEO, Videos de redes…) y el rótulo nombra la marca (`Home ISADECOR`, `Contenido ISANORTE`, `Catálogo ISADECOR`…).
- **Un verbo para crear:** «Nuevo/Nueva + sustantivo» para entidades (producto, categoría, proyecto, servicio, unidad, configuración, contenido, SEO) y «Añadir + sustantivo» para elementos dentro de otra cosa (pregunta, miembro, credencial, testimonio, garantía, paso, foto, política, red, variante, especificación, documento). En las pantallas genéricas el texto sale de `addLabel` en `site-content.config.ts`.
- **Cambios sin guardar en los paneles:** `Drawer` acepta `guardUnsaved`. Si alguien escribió dentro de un `<form>` del panel, cerrar (X, fuera del panel, Escape o el botón «Cancelar» vía `drawer.requestClose()`) pide confirmación «¿Salir sin guardar?». Lo activan los paneles con formulario (empresa, categoría, unidad de negocio, proyecto, anuncio, configuración, contenido, SEO y sección de landing). Producto y servicio conservan su propio aviso.
- **Unidad de negocio:** desactivarla exige escribir su nombre.
- **Móvil (375 px):** el bloque «Redes sociales» de Empresa ya no se sale de la pantalla; los botones de iconos, la estrella de «destacado» y los enlaces «También se edita en» de Landing miden al menos 40 px.
- **Código muerto eliminado:** `features/admin/isadecor-landing` (≈1.500 líneas). La ruta `/admin/isadecor-landing` ahora redirige a `/admin/anuncios`.

### Menú y duplicados (Fase 2 del plan de UX)

- **Menú de ISANORTE · Web:** Landing, Proyectos, Servicios y **Contenido de la web**. «Contenido de la web» (`/admin/sitio`, `AdminWebContent`) es una página con 6 tarjetas (Preguntas frecuentes, Equipo, Credenciales, Testimonios, Garantías, Pasos del proceso) que muestran cuántos elementos hay y cuántos están ocultos y abren su pantalla `/admin/sitio/<clave>`. Desapareció el grupo «Confianza y contenido». **Políticas** pasó a «Sitio y empresa».
- **Galería de proyectos:** sin entrada en el menú; `/admin/sitio/proyecto-galeria` redirige a Proyectos (sus fotos se gestionan en la ficha de cada proyecto).
- **Páginas y SEO eliminado.** `/admin/contenido` redirige a Landing. Los textos de las páginas se editan tocándolos en la vista previa, que ahora incluye **Contacto** y permite cambiar la **foto de Nosotros**.
- **SEO automático** (`public-page-seo.util.ts`, modo `automatic` de `PublicPageSeoDefaults`, usado por las páginas de ISANORTE): se ignora el SEO guardado en el backend.
  - **Título:** fijo en cada facade, con palabras clave («Servicios de construcción en Cajamarca | ISANORTE»).
  - **Descripción:** la introducción o descripción de la página, recortada a ~160 caracteres; si no hay, la fija de la facade.
  - **Imagen para compartir:** la de la página (Nosotros tiene) o, si no, `DEFAULT_SHARE_IMAGE` (foto del Hero).
  - **Robots:** siempre `index, follow`.
  - ISADECOR (producto, catálogos) no cambia. El backend y la tabla `seo_paginas` no se tocaron.
- **Empresa:** el bloque de misión, visión y valores se sustituyó por un enlace a la vista previa de Nosotros; se conserva el «Resumen institucional» (pie de página).
- **Configuración del sitio:** ya no muestra ni pide los colores primario y secundario (nada los usa); sus valores se conservan al guardar.

### Anuncios eliminados (Fase 3.1)

Se quitó el **panel lateral de anuncios** de la web de ISANORTE (la pestaña naranja «ANUNCIOS» en el borde izquierdo que se desplegaba con un carrusel) y su pantalla del admin (`/admin/anuncios`, con 5 pestañas de las cuales 4 eran del viejo Home de ISADECOR). Además de estar vacío (la tabla tenía 0 filas), el formulario creaba por defecto la ubicación `ANUNCIOS_HOME` y el panel público solo lee `GENERAL`, así que lo que se creaba no se veía.

- Frontend: se borraron `features/announcements`, `features/admin/announcements`, `AnnouncementApiService` y su modelo. El layout público ya no pide `/api/publico/anuncios/ISANORTE`.
- Las rutas `/admin/anuncios` y `/admin/isadecor-landing` redirigen a `/admin`.
- **El backend no se tocó:** los endpoints de anuncios y la tabla `anuncios` (vacía) siguen existiendo; se pueden retirar con una migración cuando se decida.

### Home de ISADECOR en una sola pantalla (Fase 3.2)

Las 9 entradas del grupo «ISADECOR · Home» (casi todas con uno o dos elementos) se reunieron en **una sola entrada, «Home de ISADECOR»**, dentro del grupo Tienda: `/admin/home-isadecor` (`AdminIsadecorHome`).

- **8 secciones plegables, en el orden en que salen en la web:** Hero de la Home, Cinta de avisos, Promociones, Campaña, Secciones de productos, Bloque de servicio (con «Puntos del servicio» dentro), Reseñas del Home y Videos de redes.
- Cada sección reutiliza su pantalla de siempre, incrustada (`AdminSiteContent` y `AdminHomeReviews` aceptan `embedded`, y `AdminSiteContent` acepta `entityKey`), y **solo se carga al abrirla**. Todas empiezan cerradas; `?seccion=<id>` abre una directamente.
- Las 9 rutas antiguas (`/admin/home-isadecor/hero`, `cinta`, `promociones`, `campana`, `servicio`, `servicio-puntos`, `secciones`, `resenas`, `publicaciones`) **redirigen** a su sección (`servicio-puntos` abre «Bloque de servicio»).
- La web pública de ISADECOR no cambia: solo cambia dónde se edita.

### Dashboard de pendientes (Fase 4)

El dashboard dejó de mostrar contadores de volumen y pasó a decir **qué hay que atender hoy**. Todo se calcula en el frontend con los endpoints que ya existían (no se tocó el backend).

- **«Para atender hoy»:** tarjetas con número, detalle y enlace a la pantalla donde se resuelve; solo aparecen las que tienen algo pendiente. Si no hay nada, una línea «Todo al día». Las tarjetas son: **cotizaciones nuevas** (estado NUEVA), **cotizaciones en revisión**, **pedidos por gestionar** (todo lo que no está entregado ni cancelado, con el desglose pendientes de pago · por preparar · en preparación · en camino), **productos agotados**, **productos con poco stock** (en o por debajo del mínimo de cada producto; solo publicados) y **proyectos sin foto** (activos sin portada).
- **Lo último que entró:** las 5 cotizaciones y los 5 pedidos más recientes con su estado.
- **Accesos rápidos:** Landing, Productos, Cotizaciones y Pedidos.
- Una línea final resume lo publicado en la web (productos, proyectos y servicios).
- La lógica de stock se extrajo a `features/admin/products/product-stock.util.ts` y la comparten Productos y el dashboard.
