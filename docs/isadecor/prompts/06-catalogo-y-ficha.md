# Prompt 6 · Rediseño del catálogo y de la ficha de producto de ISADECOR (backend + frontend)

> Pensado para entregarse a Codex. Es autosuficiente: no dependas de ninguna conversación previa.
> Trabaja en español (código en inglés o español según lo existente, textos de UI en español). **No hagas commit ni push.**

## 0. Contexto
Monorepo local en `~/Documentos/Proyectos/ISANORTE/`:
- `ISANORTE-Frontend/` — Angular 22 standalone + signals, Tailwind 4, SSR/prerender, patrón facade (componente → facade con signals → servicio API en `src/app/data/services` → modelos en `src/app/data/models`). Sin `HttpClient` en componentes de la tienda.
- `ISANORTE-Backend/` — Spring Boot 4, JPA (`ddl-auto=validate`), Flyway, MapStruct (campo sin mapear = error), PostgreSQL local (`isanorte_db`, esquema `isanorte_main`). Reglas del repo en `ISANORTE-Backend/AGENTS.md`: un test unitario por clase nueva, actualizar `README.md` y `docs/openapi.yaml`, correr `./mvnw -o test`.

La tienda es **ISADECOR** (`/isadecor/*`, layout `src/app/layouts/isadecor-layout`). **ISANORTE (la web de la constructora) NO se toca**: conserva su estilo e Inter.
El **Home de ISADECOR ya está rediseñado** con la dirección visual "Showroom": ese es el modelo a seguir. Léelo antes de empezar:
- `docs/DESIGN_SYSTEM.md` §26 y §27 y `src/styles/showroom.css` (clase `.showroom`, `.enlace`, `.filete-b/.filete-l`, tokens de color y radios; Outfit para titulares, Hanken Grotesk para cuerpo, JetBrains Mono para etiquetas/medidas).
- `docs/isadecor/ESTRUCTURA-HOME.md` (cómo está armado el Home y qué viene del backend).
- `src/app/features/isadecor/home/`: `product-tile/product-tile.ts` (la tarjeta nueva), `isadecor-home.mapper.ts` (`toProductCard`), `home.html` (chips de categoría, estados de carga/error/vacío).

## 1. Objetivo
Que **el catálogo (`/isadecor/productos`) y la ficha (`/isadecor/productos/:slug`)** se vean y se comporten como el Home, usando **la misma tarjeta de producto** y los datos reales que ya existen (acabados con color, stock, modalidad, unidad de venta, plazo de entrega, valoración). Hoy están en un estilo distinto y ignoran esos datos.

## 2. Diagnóstico (lo que hay que arreglar)
Catálogo (`src/app/features/isadecor/catalog/`):
1. Tarjeta propia (`catalog/components/product-card`): esquinas de 12 px (el Showroom usa 4/6/8 px), colores fijos `#FDEBEC`/`#FBF3DB`/`#9F2F2D`/`#956400` que ignoran tokens y modo claro/oscuro, chips en mayúsculas por todos lados.
2. No muestra muestras de acabado, valoración, "Quedan N", unidad ("/ m²"), ni respeta `modalidad` (siempre "Ver producto" + "Cotizar"; "Ver producto" es un adorno `aria-hidden` y el único botón real es "Cotizar", con el mismo peso visual).
3. Muestra el SKU interno en cada tarjeta y una etiqueta fija "DISPONIBLE".
4. Tarjetas de ~530 px de alto, 3 por fila a 1440 px; página de 3.420 px (escritorio) y 8.643 px (móvil) con solo 12 productos.
5. Móvil: el primer producto aparece a ~913 px (más abajo que una pantalla de 812 px) por un encabezado grande, tres frases de relleno casi invisibles (contraste bajo: "Materiales de alta durabilidad…") y buscador + orden apilados. Hay 12 elementos táctiles < 40 px.
6. Filtros pobres: colección, "Solo en oferta", "Entrega inmediata". Faltan color/acabado, modalidad, rango de precio, "fácil de instalar", chips de filtros activos y "Limpiar todo".
Ficha (`src/app/features/isadecor/product-detail/`):
7. Los acabados son una lista de texto con "Consultar"; no hay muestras de color ni stock por acabado.
8. Ofrece a la vez "Agregar al carrito", "Comprar ahora" y "Solicitar cotización" sin respetar `modalidad` (el piso SPC es COTIZAR).
9. El calculador dice "Medida del Largo o área" sin explicar qué escribir ni la unidad.
10. 7 secciones y ~5.000 px de alto. Se expone al público la herramienta interna "Compara una publicación externa" / comparación de competidores (`components/product-price-comparison`, `components/product-competitor-comparison`): **quítala de la vista pública** (no borres el backend ni los componentes si algo más los usa; verifica con grep).

## 3. Parte A · Backend (primero)
El catálogo (`GET /api/publico/sitios/{clave}/unidades/{unidadSlug}/catalogo`) y el detalle (`.../productos/{slug}`) devuelven DTOs pobres. Archivos: `PublicContentController`, `PublicContentService` (`findProductCatalog`, `findPublicProduct`), `mapper/PublicProductMapper`, `dto/response/PublicProductCardResponse`, `PublicProductDetailResponse`, `PublicProductVariantResponse`, `repository/ProductoCatalogSpecifications`, `dto/request/PublicProductCatalogQuery`.
Reutiliza lo que ya existe y está probado: `IsadecorHomeService.card(...)` (arma imagen principal, categorías, acabados, valoración redondeada a 1 decimal, estado de stock con `util/DisponibilidadStock`) y `IsadecorHomeResponse.ProductoCard`. **No dupliques la lógica**: extráela a un componente compartido (p. ej. un `ProductoCardAssembler`) que usen el Home y el catálogo, con sus tests.

1. **Tarjeta del catálogo**: que `PublicProductCardResponse` incluya (campos nuevos al final, nulos permitidos): `modalidad`, `unidadVenta`, `plazoEntrega`, `valoracion` (Double 1 decimal), `resenasCantidad`, `acabados[{nombre, colorHex, agotado}]`, `estadoStock` (DISPONIBLE|QUEDAN|AGOTADO|SIN_CONTROL), `quedan`, `facilInstalacion`. Calcula valoraciones con una sola consulta agrupada (`ResenaProductoRepository.resumenPorProductos`) para no hacer N+1; hidrata variantes/imágenes/categorías en lote como ya hace `findByIdIn`.
2. **Detalle**: añade a `PublicProductDetailResponse`: `modalidad`, `unidadVenta`, `plazoEntrega`, `facilInstalacion`, `estadoStock`, `quedan`, `valoracion`, `resenasCantidad`; y a `PublicProductVariantResponse`: `colorHex`, `stockActual` (o `agotado` + `quedan` por acabado; decide y documenta; no expongas el stock exacto si no es bajo si prefieres solo el estado).
3. **Filtros nuevos** en el catálogo (parámetros opcionales, validados): `modalidad` (COMPRAR|COTIZAR), `facilInstalacion` (boolean), `precioMin`/`precioMax` (decimales ≥ 0, min ≤ max, si no 400 con el formato de error estándar), `acabado` (texto: coincide con nombre de variante). Añade sus `Specification` en `ProductoCatalogSpecifications` y al `PublicProductCatalogQuery`. Añade al orden `PRECIO_ASC/PRECIO_DESC/NOMBRE_ASC/DESTACADOS` que ya existen un `MAS_VALORADOS` solo si es barato de implementar; si no, omítelo y dilo.
4. La respuesta del catálogo debe incluir, junto a las categorías, el **rango de precios disponible** (`precioMinimo`, `precioMaximo` de los publicados) para el control de precio.
5. Tests: unitarios por clase nueva/modificada (assembler, specifications nuevas, servicio con filtros, controller con los parámetros nuevos, validación de rango). Actualiza `docs/openapi.yaml` y el `README.md` del backend. Corre `./mvnw -o test` **sin tener las variables de `.env` exportadas en esa shell** (si exportas `SPRING_DATASOURCE_*`, los tests de integración fallan). Línea base: 484 tests, 0 fallos; debe seguir en 0.
6. Compatibilidad: los campos nuevos solo se añaden (no cambies ni quites existentes) para no romper `PublicProductApiIntegrationTest`.

## 4. Parte B · Frontend
### 4.1 Tarjeta única
Reutiliza `src/app/features/isadecor/home/product-tile/product-tile.ts` (o muévela a `src/app/features/isadecor/shared/` como `ProductTile` y haz que Home, catálogo y "También te puede interesar" la usen). Debe:
- Mostrar foto cuadrada, categoría, nombre, muestras de acabado (máx. 5, agotados atenuados y anunciados a lectores de pantalla), valoración si existe, precio **con unidad** ("/ m²", "/ caja"…; "Desde" si COTIZAR), precio anterior y descuento, plazo de entrega y "Quedan N" si `estadoStock = QUEDAN`.
- Un único botón visual por tarjeta según `modalidad` ("Comprar" relleno o "Cotizar" contorno); toda la tarjeta es un solo enlace a la ficha (sin enlaces anidados). Sin SKU ni etiqueta fija de disponibilidad (si está AGOTADO, muéstralo claramente y no ofrezcas comprar).
- Sin colores hexadecimales fijos: solo tokens del tema (claro y oscuro). Radios del Showroom.
- Actualiza `toProductCard` (mapper del Home) o crea el equivalente para el catálogo para adaptar la respuesta del backend al modelo de la tarjeta, con tests.
- Retira `catalog/components/product-card` y su CSS cuando nada lo use (grep); migra o borra sus specs.

### 4.2 Catálogo
- **Encabezado corto**: título (h1 único) + número de resultados + buscador. Quita las frases de relleno. Objetivo en móvil: el primer producto empieza antes de 650 px de alto.
- **Cuadrícula**: 2 columnas en móvil, 3 en tablet, 4 en escritorio; tarjetas ≤ 400 px de alto a 1440 px. Paginación o "Cargar más" ya existentes se conservan (revisa `catalog.facade.ts`).
- **Filtros**: en escritorio panel lateral pegajoso; en móvil botón "Filtros" que abre un panel (dialog accesible con foco atrapado y Esc). Contenido: colección (chips), acabado/color, modalidad, rango de precio (usa el rango que devuelve el backend), "fácil de instalar", "solo en oferta", "solo disponibles". Debajo del buscador, **chips de filtros activos** quitables y "Limpiar todo". Los filtros viven en la URL (query params) como hoy: respeta los existentes (`q`, `categoria`, etc.) para no romper enlaces del Home y del navbar.
- Estados: carga (esqueletos con la forma de la tarjeta), error con "Reintentar", sin resultados (mensaje + botón "Limpiar filtros"), y un `aria-live="polite"` que anuncie "N productos".
- Orden: selector `Destacados | Precio ↑ | Precio ↓ | Nombre`.
- Elementos táctiles ≥ 44 px.

### 4.3 Ficha de producto
- Galería (se mantiene) + bloque de compra a la derecha (sticky en escritorio; en móvil, barra inferior fija con el precio y el botón principal).
- **Acabados como muestras de color** (botones tipo radio con nombre accesible, agotado deshabilitado y anunciado, imagen de la variante al seleccionar si existe, precio de la variante si difiere). Selección por defecto: la primera disponible.
- **Un solo botón principal según `modalidad`**: COMPRAR → "Agregar al carrito" (secundario: "Cotizar este proyecto" como enlace, sin "Comprar ahora" duplicado); COTIZAR → "Cotizar" (añade al carrito de cotización existente). Respeta el flujo y servicios actuales de carrito/cotización (`IsadecorQuoteCartService`, etc.); no cambies checkout, cuenta ni cotización.
- Precio con unidad, precio anterior/descuento, plazo de entrega, "Quedan N", valoración con enlace a las opiniones.
- **Calculador**: etiqueta clara ("¿Cuántos m² vas a cubrir?" / unidad según `configuracionCalculo`), ayuda breve con ejemplo y resultado en lenguaje claro ("Necesitas 4 cajas (incluye 10 % de merma)"). Conserva la lógica y sus tests (`product-calculator`).
- **Reduce secciones**: orden final → compra, detalles (especificaciones y documentos en pestañas o acordeón), opiniones, "También te puede interesar" (misma tarjeta). **Elimina de la vista pública** la comparación de precios/competidores.
- Migas, un solo h1, jerarquía de encabezados correcta, foco visible, contraste AA.

### 4.4 Estilo
Todo bajo la clase `showroom` (ya la aplica el layout). Tipografías y radios del Showroom, filetes naranjas como acento, un solo acento naranja, sin sombras pesadas. Prueba **claro y oscuro** (la preferencia vive en `localStorage['isanorte:a11y:v1']` con `{"theme":"light"|"dark",...}`).

## 5. Reglas y trampas conocidas
- No toques ISANORTE (`src/app/features/isanorte`, `layouts/public-layout`) ni el admin salvo imprescindible.
- No imprimas ni commitees `.env`. No hagas `git commit/push/stash/reset`. No instales paquetes nuevos sin necesidad (si dudas, no lo hagas).
- El servidor de desarrollo (`npm start`, puerto 4200, proxy `/api` → `localhost:8080`) a veces sirve plantillas viejas: haz `touch` a los archivos cambiados y recarga. El backend local se arranca con las variables del `.env` exportadas **solo para ese proceso** (`SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/isanorte_db?currentSchema=isanorte_main`, `SPRING_FLYWAY_SCHEMAS=isanorte_main`, `SPRING_FLYWAY_DEFAULT_SCHEMA=isanorte_main`) y `./mvnw -o -q spring-boot:run`. No uses `pkill -f` en la misma shell que tus otros comandos (la mata).
- Usa `npx --no-install tsc --noEmit -p tsconfig.app.json` para comprobar tipos (sin `--no-install`, npx puede instalar un paquete `tsc` equivocado).
- Los comandos largos (`ng build`, `ng test`, `mvn test`) pueden tardar; no los interrumpas.
- Datos de prueba: 12 productos publicados de ISADECOR con acabados, stock, reseñas y 7 categorías. No inventes datos en el código; si necesitas más productos para probar paginación, hazlo por SQL local temporal y bórralo.

## 6. Verificación obligatoria (informa resultados reales)
1. Backend: `./mvnw -o test` → 0 fallos (reporta el total). `curl` al catálogo con cada filtro nuevo y a un detalle, mostrando que los campos nuevos llegan.
2. Frontend: `npx ng build` sin errores. `npx ng test --watch=false`: **línea base 23 fallos ya existentes y ajenos** (admin-layout, public-layout, app.routes.server, app.spec ×3, announcement-api, admin-landing/projects/services/site-config/orders). No debe haber fallos nuevos; crea/actualiza specs para todo lo que cambies (tarjeta, catálogo/facade con filtros y chips, ficha con selección de acabado y botón por modalidad, calculador).
3. En el navegador, **a 1440 px y 375 px, en claro y oscuro**, para `/isadecor/productos` y una ficha COMPRAR y otra COTIZAR (`piso-spc-alto-transito` es COTIZAR; busca una COMPRAR): sin desborde horizontal (`document.documentElement.scrollWidth <= innerWidth`), un solo h1, sin errores de consola, filtros por URL funcionando, panel de filtros móvil con teclado (Tab/Esc).
4. Mide y reporta: alto de la página del catálogo (antes: 3.420 px escritorio / 8.643 px móvil), posición del primer producto en móvil (antes: 913 px), alto de la tarjeta (antes: ~530 px), alto de la ficha (antes: ~5.000 px), nº de peticiones HTTP del catálogo.
5. Actualiza `docs/isadecor/ESTRUCTURA-HOME.md` (o crea `docs/isadecor/ESTRUCTURA-CATALOGO.md`) y `docs/DESIGN_SYSTEM.md` (§26: patrones nuevos de catálogo y ficha).

## 7. Entrega
Resume: qué cambiaste por archivo (con rangos de línea), decisiones tomadas (p. ej. stock expuesto por acabado), resultados de la verificación con números, y lo que quedó fuera. Deja todo **sin commitear**.
