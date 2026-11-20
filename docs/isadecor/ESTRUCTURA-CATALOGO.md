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
