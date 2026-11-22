# ISADECOR · Catálogo y ficha

## Catálogo público

`/isadecor/productos` lee los filtros de la URL. Conserva `q`, `categoria`,
`soloDescuento`, `soloDisponible`, `soloDestacados` y `orden`. Añade
`acabado`, `modalidad`, `facilInstalacion`, `precioMin` y `precioMax`.
Cada chip limpia su filtro de la URL y «Limpiar todo» los retira en conjunto.
Los límites de precio se aplican al precio base y las sugerencias del control
provienen de `precioMinimo` y `precioMaximo` de la unidad publicada.

`Catalog` sincroniza la URL con `CatalogFacade`. El facade coordina paginación,
carga, error y reintento vía `PublicContentApiService.getProductCatalog`. Cambiar
los filtros reinicia la paginación. La búsqueda del catálogo se aplica al
enviar el formulario.

El panel de filtros es lateral en escritorio. En móvil abre un diálogo modal
con Escape, ciclos de Tab y Shift+Tab y restauración del foco al cerrar.
La cuadrícula usa dos, tres o cuatro columnas según el ancho. Los productos
del catálogo, el Home y las recomendaciones usan `HomeProductTile`.

## Ficha pública

`/isadecor/productos/:slug` presenta galería y compra, detalles en acordeón,
opiniones y recomendaciones. Selecciona el primer acabado disponible y usa
su imagen y precio cuando existen. Un acabado con stock agotado aparece
deshabilitado y etiquetado.

`COMPRAR` ofrece «Agregar al carrito» y un enlace secundario para cotizar el
proyecto. `COTIZAR` añade al carrito de cotización existente. Un producto
agotado muestra su estado con la acción de compra oculta. En móvil, el precio
y la acción principal quedan en la barra inferior.

El calculador conserva la fórmula `ceil(medida / coberturaPorUnidad)` con
las unidades de la configuración. La configuración actual carece de un
porcentaje de merma independiente.

El backend redondea la valoración a un decimal y devuelve el stock por
producto y los acabados de la tarjeta. El detalle indica color y agotamiento
por acabado. Expone la cantidad restante del acabado solo cuando es baja,
según el umbral de stock configurado para el producto. Las recomendaciones
incluyen la proyección de tarjeta del Home en `tarjeta`.


## Filtros del catálogo (v2, inspirados en Falabella)
- **Colecciones** solo en el panel de filtros (sección «Colección», casillas con cantidad), con **selección múltiple** (`?categoria=pisos,techos`).
- **Panel con secciones plegables**: Acabado o color (muestras reales con color y cantidad, selección múltiple `?acabado=Blanco,Nogal`), Precio (rangos rápidos generados desde el rango publicado + rango manual que se aplica al salir del campo), Cómo se vende (control segmentado Todos/Comprar/Cotizar) y Características.
- **Se aplica al instante** (sin botón «Aplicar»). Arriba del panel, el bloque **Seleccionados · N resultados** con chips quitables y «Limpiar todo».
- **Título dinámico:** con una sola colección elegida, el `h1` y el `<title>` pasan a su nombre.
- **Móvil:** colecciones en carrusel, chips rápidos «En oferta» y «Fácil de instalar», botón Filtros (n) que abre el panel completo y termina con «Ver N resultados».
- **Backend:** `GET .../catalogo` acepta listas separadas por coma en `categoria` y `acabado` (máx. 12 valores) y devuelve `acabados` (nombre, `colorHex`, cantidad) y `imagenUrl` en cada colección.

### Escala con muchas colecciones
- No hay fila de colecciones sobre la grilla (ocupaba espacio y se veía mal con fotos o sin ellas): la elección vive en la sección **Colección** del panel.
- El panel muestra 8 colecciones y un «Ver más (n)»; desde 12 aparece un buscador interno. Las elegidas siempre se ven, y también como chips en «Seleccionados».
- Si algún día hay subcategorías, la lista del panel pasaría a árbol; requiere cambio de modelo en el backend.

### Búsqueda
- Una sola caja de búsqueda (la del encabezado de la tienda). Al buscar, el título pasa a «Resultados para «…»» y aparece un chip quitable.
- El backend busca por **palabras** (todas deben coincidir) en nombre, SKU, resumen, descripción, colección y **acabado**, sin distinguir tildes, mayúsculas ni singular/plural: «paneles sandwich» encuentra «Panel sándwich».
- Sin resultados: mensaje con consejos, «Quitar búsqueda», «Limpiar todo» y colecciones sugeridas.
- Pendiente: tolerancia a errores de tipeo (p. ej. «sanwich»), que requeriría `pg_trgm` o un motor de búsqueda.

### Comprar y cotizar a la vez
- Todo producto puede **comprarse y cotizarse**: la modalidad por defecto es `AMBAS` (migración `V6`). `COMPRAR` y `COTIZAR` siguen existiendo para restringir un producto a una sola vía desde el administrador («Cómo se puede adquirir»).
- Reglas (`features/isadecor/product-actions.ts`): se **compra** si la modalidad lo permite, tiene precio y hay existencias; se **cotiza** salvo que sea «solo comprar». Sin precio: «Consultar precio» y solo cotización. Agotado: la compra se bloquea y se ofrece «Cotizar reposición».
- **Ficha:** botón principal «Agregar al carrito» y secundario «Cotizar por WhatsApp» (mensaje con producto, acabado y cantidad ya escritos; el calculador de m² alimenta la cantidad). Solo se muestra «Desde» en productos exclusivamente de cotización, cuyo precio es referencial.
- **Tarjeta:** un único botón «Ver producto» (o «Cotizar» si es solo cotización); la elección de acabado y de la vía se hace en la ficha.
- **Carrito único** con dos salidas: «Ir a pagar» (checkout, requiere cuenta de cliente) y «Solicitar cotización por WhatsApp».
- **No hay formulario de cotización enlazado:** el encabezado, el pie, la ficha y el carrito cotizan por WhatsApp. La página `/isadecor/cotizacion` sigue existiendo pero sin enlaces; al enviarla abre WhatsApp con los productos y los datos (no guarda nada).
- Se quitó el filtro «Cómo se vende» del panel; el parámetro `modalidad` del backend sigue aceptándose (COMPRAR y COTIZAR incluyen los productos AMBAS).

### Ficha técnica y detalles (v2)
- **Detalles** ya no usa acordeones: la **descripción** acepta viñetas (líneas que empiezan con «- ») y se pliega con «Mostrar más» si pasa de 700 caracteres; las **especificaciones** son una tabla de dos columnas agrupada por `grupo`; los **documentos** son botones de descarga. Cada bloque se oculta si no tiene datos.
- **Entrega e instalación** bajo el precio: plazo de entrega, retiro en tienda (si el producto lo permite) e instalación con técnicos en Cajamarca (texto fijo; confirmar con el cliente).
- **Garantía y cambios** (acordeón): texto genérico y enlace a WhatsApp; las condiciones reales las define el cliente.
- Ruta con colección (`Catálogo / Pisos / Producto`) y cantidad con botones − / +.
- **Datos de ejemplo:** `datos/isadecor-fichas.sql` carga descripción con viñetas y especificaciones de los 12 productos de demostración (valores de MUESTRA: reemplazar desde el administrador). No hay documentos (PDF) ni fotos extra de ejemplo.
- **Calculador de cantidades:** aparece en la ficha cuando el producto tiene su configuración (`configuraciones_calculo`: área, cobertura por unidad, unidad de venta). `datos/isadecor-calculador.sql` la carga para 11 productos de demostración (cobertura de MUESTRA: reemplazar desde el administrador). El cálculo es `ceil(área / cobertura)`; el 10 % de merma figura solo como texto de ayuda, aún no se suma solo.
- **Columna de compra compacta:** el calculador es una sola línea en vivo («Cubrir [25] m² · Necesitas 12 cajas») que pasa el resultado a la cantidad sin botones; las opciones de acabado muestran solo la muestra de color y el nombre (el radio queda oculto para teclado y lectores de pantalla); la cantidad (− / +) va en la misma fila que «Agregar al carrito»; en escritorio se quita el enlace de colección duplicado de la ruta. A 1366×768 todo, hasta «Cotizar por WhatsApp», cabe en la primera pantalla; en pantallas bajas (menos de 52 rem de alto) la columna deja de fijarse para que nada quede cortado.

### Imágenes por acabado
- Un producto admite **varias imágenes** y cada una puede pertenecer a un **acabado** (`imagenes_producto.variante_id`, migración V7; en la API `varianteSku`) o ser **general** (sin acabado).
- **Ficha:** al elegir un acabado, la galería muestra las fotos de ese acabado; si no tiene, las generales (y como último recurso la imagen heredada `variante.imagenUrl`). Con varias fotos del acabado, las miniaturas permiten alternar.
- **Admin (formulario de producto → Galería):** selector «Acabado de la próxima imagen» y un selector «Acabado» por imagen (General o uno de los acabados con SKU). Un aviso lista los acabados sin foto («Faltan imágenes para: …»); **avisa, no bloquea** el guardado.
- **Backend:** en `PUT` de imagen, `varianteSku` ausente conserva el acabado actual y `""` la vuelve general; un SKU que no es del producto se rechaza. Al borrar un acabado sus fotos quedan como generales (`ON DELETE SET NULL`).
- **Datos de ejemplo:** `datos/isadecor-imagenes-acabados.sql` (una foto por acabado de los productos demo, generadas con IA local, a modo de MUESTRA).

### Subcategorías
- Una categoría puede colgar de otra (`categorias_producto.categoria_padre_id`, migración V8; API `categoriaPadreId` en el admin y `padreSlug` en el catálogo público). **Solo dos niveles**: el padre debe ser una categoría raíz, una categoría no puede ser su propio padre y una con subcategorías no puede colgar de otra (validado en el servicio).
- **Menú (escritorio):** cada categoría con subcategorías muestra una flecha y un desplegable al pasar el cursor o enfocar con el teclado (`group-hover` / `group-focus-within`, sin estado). En el menú móvil las subcategorías aparecen sangradas bajo su categoría.
- **Catálogo:** elegir una categoría padre incluye los productos de sus subcategorías; el panel «Colección» muestra las subcategorías sangradas. El conteo del padre cuenta productos distintos del árbol. Un padre aparece aunque no tenga productos propios.
- **Admin → Categorías:** campo «Categoría padre» (solo categorías raíz); la tabla indica «Subcategoría de …».
- **Los productos pueden estar en la categoría y en su subcategoría** a la vez; la ficha y la ruta siguen usando la categoría principal.
- **Datos de ejemplo:** `datos/isadecor-subcategorias.sql` crea 8 subcategorías (Paredes → Wall panel de interior / Piedra y mármol / Planchas de bambú; Pisos → Piso SPC / Piso autoadhesivo; Exterior y estructura → Wall panel de exteriores / Listones y separadores / Panel sándwich). Son de MUESTRA: reemplazar desde el administrador.

### Catálogos en PDF
- La página `/isadecor/catalogos` muestra **un catálogo destacado y el resto como portadas compactas**: la primera línea (por `orden`) va en una tarjeta grande con portada, título, texto y los botones «Ver catálogo» (naranja, el único del bloque) y «Descargar»; debajo, «Más líneas» en una rejilla de portadas 3:4 (2 columnas en móvil, 3 en tableta, 5 en escritorio) con el título debajo y un enlace «Descargar». Toda la portada compacta abre el PDF en otra pestaña. Escala a cualquier cantidad: las filas simplemente se suman. Con un solo catálogo se muestra solo el destacado.
- **«Descargar» real:** el PDF está en Cloudinary (otro dominio, donde el atributo `download` se ignora), así que la URL lleva `fl_attachment` (`downloadUrl` en `catalogos.ts`).
- **La portada debe ser una foto sin texto**: el título lo pone la tarjeta. No usar la captura de la primera página del PDF.
- **Datos de ejemplo:** `datos/isadecor-catalogos.sql` carga 5 catálogos (Paredes y revestimientos, el destacado, Pisos, Techos, Autoadhesivos, Exterior y estructura). Los PDF se generaron con datos de demostración (`demo-isadecor/generar_catalogos.py`, Chromium headless) y están en Cloudinary (`isadecor/catalogos`); las portadas reutilizan las fotos de categoría. Son de MUESTRA: reemplazar desde el administrador de catálogos de la unidad.
- Pendiente de decidir: enlace «Ver productos» de cada catálogo hacia el catálogo web (hoy el catálogo no guarda a qué categoría pertenece), datos como páginas o peso (requieren migración), y un buscador si pasan de unos 15 catálogos.
