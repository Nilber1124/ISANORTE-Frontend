# ISADECOR · Análisis crítico del Home (`/isadecor`)

Fase 1: solo análisis. No se modificó código. Fecha: 2026-11-17.
Base: lectura de `home.ts/html/css`, `isadecor-home-content.facade.ts`, navbar, catálogo, tarjeta de producto, `V1__esquema_inicial.sql`, `openapi.yaml`, y revisión en navegador (1440 y 375) con el backend actual (0 productos).

## 1. Veredicto corto

**Rehacer el Home desde cero y rehacer la capa de contenido del backend (opción c, por fases).** El Home actual es una landing de revista con una tienda pegada al medio: dos tercios de la página son decoración editorial y el catálogo, que es el producto, aparece tercero, vacío y sin buscador. Corregirlo exige más trabajo que rehacerlo, porque el problema no es de estilos: es de qué se muestra y de dónde sale el contenido.

## 2. Qué ve hoy un visitante (medido)

| | Escritorio 1440 | Móvil 375 |
|---|---|---|
| Alto total | 4 332 px | 6 453 px (casi 8 pantallas) |
| Secciones con backend vacío | Hero, "Colecciones", "Productos destacados" (vacío), Instagram, beneficios, cotización | igual |
| Cinta, promociones, anuncios, barra de categorías del hero | **no aparecen** (0 anuncios) | igual |

Hallazgos reales en el navegador:

- **Sin buscador.** La navbar solo tiene Inicio / Productos / Catálogo / Ingresar / Cotizar ahora. No hay `input[type=search]` en el Home. En una tienda de materiales, que el cliente busque "panel nogal" o "SPC mármol" es la acción principal.
- **11 peticiones HTTP al cargar**: `catalogo` se pide **3 veces** (size=12, size=1 y soloDestacados) y `anuncios?ubicacion=GENERAL` **2 veces**, más 6 de anuncios por ubicación. Hoy son 6 llamadas para pintar contenido que, vacío, no pinta nada.
- **Hero**: imagen de 732 kB sin formato moderno, con degradado negro del 85 % encima; la foto queda casi apagada. Con el backend vacío la barra de accesos de categorías (lo único útil del hero) no existe.
- **Con el backend vacío** el usuario ve: hero, tres tarjetas de "colección" salidas de lógica de respaldo (texto idéntico "Explora esta colección dentro del catálogo de ISADECOR."), un panel "Aún no hay productos publicados", un widget de Instagram y un bloque de cotización. Es decir: una tienda sin productos.
- **Animaciones de entrada**: en la revisión el título del hero y secciones al hacer scroll tardaron o quedaron oscuros durante el scroll (pantalla casi negra entre secciones). Dependencia de GSAP para que el contenido sea legible; hay que verificarlo con otra herramienta antes de afirmar que es un fallo permanente, pero es un riesgo de LCP/accesibilidad.
- **Marca**: el logo de la navbar dice "ISADECOR IMPORT"; el resto del sitio dice "ISADECOR". Inconsistencia visible.
- **Todo el sitio en tema oscuro** con secciones que alternan `data-theme` dark/light. Para acabados e interiores (el producto es el color y la textura de la madera/mármol) un fondo casi negro no ayuda a leer los productos.

## 3. Bloque por bloque

| # | Bloque | Problema que resuelve | Debe existir | Veredicto |
|---|---|---|---|---|
| 1 | Hero con 2 CTA (catálogo / cotizar) | Decir qué vende ISADECOR | Sí, pero con la propuesta concreta y un buscador | **Rehacer**. Texto genérico ("transforman tus espacios"), 2 CTA compitiendo, imagen oscurecida |
| 2 | Barra de 4 accesos de categoría al pie del hero | Descubrimiento por categoría | Sí, es lo más útil | **Va como idea**, pero hoy depende de anuncios (`CATEGORIA_SUPERIOR`) y desaparece si no hay. Debe salir de las categorías reales |
| 3 | Cinta/marquesina "novedades" (CINTA_HOME) | Nada concreto | No | **No va**. Texto en bucle con miniaturas, tiene a11y mala y ocupa en el DOM 4 copias del contenido |
| 4 | Promociones (1 grande + 2) | Ofertas | Sí, como "Ofertas" ligadas a productos con descuento reales | **Rehacer**. Hoy son banners de imagen sin producto ni precio, con etiqueta "Contenido actualizado" falsa |
| 5 | Anuncios (3 pósters, `GENERAL` + `ANUNCIOS_HOME`) | Redundante con promociones | No | **No va**. Misma función que el bloque 4; el usuario ya pidió menos redundancia |
| 6 | "Nuestras colecciones" (3 tarjetas de categoría) | Categorías | Redundante con el bloque 2 | **No va como bloque separado**: fusionar con 2. Código con ~150 líneas de if/else por nombre de categoría y 3 fuentes de datos distintas (anuncio, quick-access config, categorías crudas, constante local) |
| 7 | Productos destacados (máx. 8) | Comprar/cotizar ya | Sí, es el corazón | **Rehacer y subir**. Debe estar justo bajo el hero, con precio, descuento y acción directa |
| 8 | Instagram (Elfsight, script de terceros) | Prueba social / inspiración | Sí se debe mostrar (también TikTok, pedido del usuario), **pero no en el Home** | **Mover a un apartado propio** (`/isadecor/comunidad`, enlazado desde navbar y footer). Hoy ocupa 742 px del Home, carga un script externo (timeout 15 s) y tiene texto de plantilla ("vista previa del espacio que reunirá…"). En el Home solo queda, como mucho, una franja corta con iconos a las redes y 3-4 obras reales/reseñas |
| 9 | Beneficios (4 iconos) | Confianza | Sí, pero con contenido real | **Rehacer**. Hoy dicen "Catálogo organizado", "Experiencia adaptable": describen el sitio, no al cliente. Faltan envío, garantía, instalación, plazo, medios de pago |
| 10 | Bloque de cotización (3 pasos + panel con foto) | Explicar cómo pedir cotización | Sí, pero corto | **Rehacer**. 725 px para decir "elige un producto y completa tus datos". Texto interno filtrado ("Flujo de cotización existente") |
| 11 | CTA "Cotizar" | | | Aparece en navbar, hero, en cada tarjeta, final del Home: 4 veces en una pantalla |

Faltan por completo: buscador, filtros por material/uso/ambiente, "más vendidos / nuevos", marcas, **reseñas** (el backend las tiene y el Home no las usa), garantías, calculadora de m² (existe `configuraciones_calculo`), cobertura de envío a provincias, medios de pago, WhatsApp visible por producto.

## 4. Qué espera alguien en una tienda de acabados y dónde falla

1. **Buscar y encontrar rápido**: buscador arriba, categorías visibles (pared, piso, techo, mobiliario). Hoy: no hay búsqueda en el Home ni en la navbar; las categorías están escondidas en un menú desplegable.
2. **Ver producto real con precio**: tarjeta con foto, nombre, medida/espesor, precio por m² o unidad, descuento, "agregar" o "cotizar". Hoy la tarjeta muestra "Precio referencial" y "Consultar precio" cuando no hay precio, con un único botón "Cotizar".
3. **Saber si compra directa o cotización**: no está definido. El carrito, el checkout y los pedidos existen, pero el Home solo habla de cotizar. Es la decisión de negocio que condiciona todo (ver sección 6).
4. **Cuánto necesito**: en acabados se vende por m². Una calculadora (alto×ancho + merma) convierte más que cualquier banner. El backend ya tiene la configuración; el Home no la ofrece.
5. **Confianza**: garantía, instalación, plazos, ventas anteriores, fotos de obras reales, reseñas.
6. **Inspiración por ambiente** (sala, cocina, baño, exterior): hay imágenes `recorrido-*.jpg` sin usar en el Home.

## 5. Estado del código (frontend)

- `home.ts` 520 líneas, `home.html` 691, `home.css` 258 (supera el presupuesto de 4 kB). Contiene datos estáticos de respaldo (`DEFAULT_CATEGORY_HIGHLIGHTS`, `promotionPreviews`, `announcementPreviews`, `marqueeItems`, `storeBenefits`, `quoteSteps`) y código **muerto** (`promotionPreviews`, `announcementPreviews`, `marqueeItems`, `heroQuickAccess` y `quickAccessImages` no se usan en la plantilla).
- Home y Catálogo comparten `CatalogFacade` solo para pedir destacados (la misma llamada tres veces).
- Lógica de presentación que depende del texto del contenido (`name.includes('wall')`, `etiqueta.startsWith('DEMO-HOME-')`): frágil y es un residuo de datos de prueba en producción.
- Imágenes locales `/images/isadecor-*.jpg` (hero 732 kB) en vez de contenido administrable.
- Páginas vecinas (catálogo con buscador/filtros/orden, ficha, carrito, cotización, checkout, cuenta) **sí son de e-commerce** y están razonablemente completas: lo que falla es que el Home no las expone.

## 6. Backend y contrato

Lo que hay: `productos`, `categorias_producto`, `variantes_producto`, `imagenes_producto`, `especificaciones_producto`, `documentos_producto`, `configuraciones_calculo`, `resenas_producto`, `cotizaciones`, `pedidos`, `carritos_cliente`, `clientes`, `direcciones_cliente`, `catalogos`, `anuncios`, más endpoints públicos en `/api/publico/sitios/{clave}/unidades/{slug}/...` y `/api/publico/anuncios/{destino}`.

Brechas que condicionan el Home:

1. **Todo el contenido del Home vive en una sola tabla, `anuncios`**, con una columna `ubicacion` (CINTA_HOME, PROMOCION_PRINCIPAL, PROMOCION_SECUNDARIA, ANUNCIOS_HOME, CATEGORIA_SUPERIOR, GENERAL). Las categorías de la barra superior son un "anuncio" con `destino_accion` = slug. Un modelo con una columna para todo; justo lo que se corrigió en ISANORTE con una tabla por entidad.
2. **Promociones no son promociones**: no hay entidad con vigencia, producto(s), descuento ni cupón. `productos` tiene `precio_anterior` y `descuento_porcentaje`, pero el Home no consume una lista de ofertas.
3. **Destacados** solo por `destacado` + `orden_destacado` en `productos`, sin colecciones ("Lo nuevo", "Más vendidos", "Para baños").
4. **Catálogo vacío** (0 productos, confirmado en la base): ya no existe un seeder; falta script SQL de demostración y imágenes.
5. **Contrato de lista**: un único endpoint `catalogo` devuelve productos + categorías; el Home no tiene endpoint propio, por eso arma 11 llamadas. Falta un `GET .../home` que devuelva todo agregado.
6. **Sin modelo de precio por m² / unidad de venta / medidas**: se infiere de variantes y especificaciones. Para acabados es esencial.
7. **Compra vs. cotización** sin definir: coexisten `cotizaciones` y `pedidos`/`carritos`. Hay que decidir si el precio público es firme (compra directa), referencial (cotización) o mixto por producto.
8. No pude verificar en esta fase cómo se comportan `pedidos`/`checkout` con datos (la base no tiene productos); recomiendo probarlos en la fase de datos.

## 7. Recomendación

**(c) Rehacer ISADECOR completo en el lado de contenido y del Home; reutilizar lo que ya sirve.**

- **Se reutiliza**: catálogo (búsqueda/filtros/orden), ficha de producto, carrito, cotización, checkout y cuenta (con pruebas), tabla de productos/variantes/imágenes/reseñas y los componentes compartidos. Son la parte e-commerce y funcionan.
- **Se rehace**: el Home (frontend completo) y el modelo de contenido (backend): tablas propias para `home_secciones`/`hero`, `colecciones` + `coleccion_producto`, `ofertas`, `beneficios`, `ambientes` (inspiración), más endpoint agregado `GET /api/publico/sitios/{clave}/unidades/isadecor/home`. Esto sustituye `anuncios` para el Home y quita las 11 llamadas.
- **Por qué no (a)**: habría que seguir parchando fallbacks por texto, mantener 6 ubicaciones en una tabla y justificar bloques que no deberían existir.
- **Por qué no (b)** (solo el Home): sin las tablas nuevas el Home nuevo recrearía el mismo acoplamiento a `anuncios`.

### Estructura propuesta del Home nuevo (jerarquía)

1. **Hero** corto con propuesta concreta, **buscador** y 4 categorías (pared, piso, techo, mobiliario) debajo; un solo CTA principal.
2. **Franja de confianza** (envío, instalación, garantía, pago): 4 datos reales, una línea.
3. **Productos destacados / Novedades** con precio, descuento y acción directa (8 tarjetas, pestañas "Destacados · Nuevos · Ofertas").
4. **Por ambiente** (sala, cocina, baño, exterior): 4 imágenes que filtran el catálogo. Reemplaza "colecciones", anuncios y promociones.
5. **Calculadora de m²** con CTA a cotizar (una sola vez).
6. **Reseñas y 3-4 obras reales** (en el Home ya no va el feed de Instagram).
7. Cierre: cotización/WhatsApp en una franja corta, con iconos a Instagram y TikTok.

### Apartado "Comunidad" (Instagram + TikTok), fuera del Home
- Ruta propia `/isadecor/comunidad`, enlazada desde navbar (o footer) y desde la franja final del Home.
- Dos bloques: Instagram y TikTok, cada uno con sus publicaciones recientes.
- Contenido administrable, no un widget de terceros fijo: tabla `publicaciones_sociales` (red, url, miniatura, título, orden, activo) en el admin genérico; las miniaturas se cargan como imágenes normales y enlazan a la publicación. Evita scripts externos, mejora el rendimiento y funciona con SSR.
- Alternativa si se prefiere feed automático: embeds oficiales (Instagram/TikTok) cargados solo en esa página y bajo demanda (al hacer scroll), con enlace de respaldo si fallan.
- Las URLs de las cuentas de Instagram y TikTok deben ir en `redes_sociales` (ya existe en el esquema); falta que el usuario indique las cuentas.

Resultado: de 6-9 bloques decorativos a 6 con función, y 1-2 llamadas HTTP.

### Fases y esfuerzo relativo

| Fase | Alcance | Esfuerzo |
|---|---|---|
| 0 | Decisión de negocio: compra directa vs. cotización vs. mixto; marca (¿"Import"?); medios de pago/envíos reales | Pequeño, bloqueante |
| 1 | Backend: esquema nuevo (colecciones, ofertas, beneficios, ambientes, hero), endpoint `home`, tests, openapi y README | Grande (L) |
| 2 | Datos de demostración (SQL): ~24 productos con variantes y precios por m², 6 categorías, 4 ambientes, reseñas | Mediano (M) |
| 3 | Imágenes con `ia-visual-local` + Cloudinary (~40: producto sobre fondo blanco, ambientes, hero) | Mediano (M), la más lenta en tiempo |
| 4 | Admin genérico (reutilizar `site-content` de ISANORTE), incluida la tabla de publicaciones sociales | Pequeño (S) |
| 4b | Página `/isadecor/comunidad` con Instagram y TikTok | Pequeño (S) |
| 5 | Home nuevo + skeleton con conteos reales + SEO/a11y + presupuesto CSS | Mediano (M) |
| 6 | Pulido de catálogo/ficha (consistencia de tarjeta, filtros por material) | Pequeño (S) |

Datos/imágenes necesarios: lista real de productos y precios de ISADECOR (o aceptar demo), datos de contacto/WhatsApp, políticas de envío y garantía, y decisión sobre marca/logo.

## 8. Qué necesito del usuario para pasar a implementación

1. ¿Compra directa, cotización, o mixto? (cambia el Home, el modelo y el checkout).
2. ¿Tienes productos/precios reales o usamos demostración, como en ISANORTE?
3. ¿El nombre es "ISADECOR" o "ISADECOR Import"?
4. ¿Confirmas la opción (c) por fases?

*Nota de alcance*: no modifiqué código ni base de datos; solo creé este archivo. Limitación: no pude ver el Home con productos reales (catálogo vacío) ni verificar el flujo de pedidos con datos.
