# Plan: contenido de la Home de ISADECOR desde la base de datos

Estado: **aprobado e implementado** (2026-11-19). Fase 1: migración `V4__isadecor_home_y_stock.sql`, datos en `datos/isadecor-demo.sql` e imágenes en Cloudinary. Fase 2: endpoint público, CRUD y stock en el backend. Fase 3: administración. Fase 4: el Home consume la API. Fase 5: revisión visual. **Pendiente: despliegue** (migración V4 y datos demo en producción). Base del plan: `isadecor-home.model.ts` (contrato del frontend) y el esquema actual (`V1__esquema_inicial.sql`).

## 1. Qué será editable desde administración
| Bloque | Campos editables |
|---|---|
| Hero | Titular, subtítulo |
| Promociones | Producto, tipo (DESCUENTO o NUEVO), título, imagen, fecha de fin, orden; una principal y el resto en lista |
| Cinta de avisos | Texto, enlace opcional, orden, activo |
| Campaña | Etiqueta, título, descripción, texto del botón, enlace, imagen, activo |
| Elige tu acabado / Fáciles de instalar | Título, modo (automático, manual o mixto), ventana en días, cantidad, productos fijados y excluidos |
| Para constructoras y arquitectos | Etiqueta, título, descripción, los 4 puntos (texto y orden) |
| Reseñas | Casilla "mostrar en Home" y orden sobre las reseñas reales |

**Siguen en el código (no editables por ahora):** la escena con scroll (video, póster y pasos), la franja de confianza, el buscador, la cabecera y el pie.
**Descartado:** "más visitados" (no se medirán visitas).
**Incluido:** stock mínimo viable (sección 3b), porque la tienda va a funcionar como e-commerce.

## 2. Cambios en la base de datos (migración nueva `V4`, aditiva)
No se borra ni recrea nada: las tablas de productos, pedidos, cotizaciones, clientes y reseñas se conservan.

**Columnas nuevas en tablas existentes**
- `productos`: `modalidad` (COMPRAR/COTIZAR), `unidad_venta` (M2/UNIDAD/CAJA/ML), `plazo_entrega` (texto), `facil_instalacion` (boolean).
- `variantes_producto`: `color_hex` (para las muestras de acabado) y `stock_actual` (stock por acabado; vacío = sin control).
- `productos`: además `stock_minimo` (umbral de stock bajo).
- `resenas_producto`: `mostrar_en_home` (boolean), `orden_home` (entero).

**Tablas nuevas** (las de contenido con `unidad_negocio_id`, `activo`, fechas de creación y actualización)
- `isadecor_hero` (una fila): `titulo`, `subtitulo`.
- `isadecor_cinta`: `texto`, `enlace`, `orden`.
- `isadecor_promociones`: `producto_id`, `tipo`, `titulo`, `imagen_url`, `fecha_fin`, `orden`, `principal`.
- `isadecor_campana`: `etiqueta`, `titulo`, `descripcion`, `texto_boton`, `enlace`, `imagen_url`.
- `isadecor_servicios_empresa` (una fila): `etiqueta`, `titulo`, `descripcion`, `texto_boton`, `enlace`; y `isadecor_servicio_puntos`: `servicio_id`, `texto`, `orden`.
- `isadecor_secciones_productos`: `clave` (TIENDA o FACILES), `titulo`, `texto_enlace`, `categoria_enlace`, `modo`, `ventana_dias`, `limite`.
- `isadecor_seccion_fijados`: `seccion_id`, `producto_id`, `orden`.
- `isadecor_seccion_excluidos`: `seccion_id`, `producto_id`.
- `movimientos_stock`: `producto_id`, `variante_id` (opcional), `tipo` (ENTRADA, SALIDA, AJUSTE, PEDIDO, CANCELACION), `cantidad`, `stock_resultante`, `motivo`, `pedido_id` (opcional), `usuario`, `fecha`.

## 3. Reglas de las secciones automáticas
- **Demanda de un producto** = unidades en pedidos + unidades en cotizaciones dentro de la ventana (por defecto 30 días). Se consulta en el momento; si hace falta rendimiento, se resume por día más adelante.
- **Modo AUTOMATICO:** los productos publicados con mayor demanda. En FACILES, solo los marcados `facil_instalacion`.
- **Modo MANUAL:** solo los fijados, en su orden.
- **Modo MIXTO:** primero los fijados; el resto se completa con los de mayor demanda.
- **Excluidos:** nunca aparecen.
- **Sin datos suficientes:** se completa con productos destacados (`destacado`, `orden_destacado`) para no mostrar listas vacías.

## 3b. Stock mínimo viable
Hoy existe `productos.stock_actual` (vacío = sin control), `pedidos.stock_descontado`, descuento de stock al avanzar el pedido, devolución al cancelar y paso automático a AGOTADO cuando llega a 0. **No** existe ninguna forma de cargar o ajustar el stock desde administración (el mapeo del producto ignora ese campo).

Alcance de este plan:
1. **Stock editable en administración:** `stock_actual` en crear y editar producto y variante, más un ajuste rápido (`PATCH .../stock`) con tipo y motivo que registra un movimiento.
2. **Stock por acabado:** si el producto tiene variantes, la disponibilidad se calcula con ellas (el producto está agotado cuando todas lo están); si no, con el producto. Un stock vacío significa "sin control" y no se cambia la convención actual (los productos que solo se cotizan siguen sin stock).
3. **Historial** en `movimientos_stock` para cada cambio (manual, pedido o cancelación), con quién y cuándo.
4. **Stock bajo:** `stock_minimo` por producto y filtro "bajo stock" en el listado del panel.
5. **Sin sobreventa:** al crear el pedido se valida el stock disponible por producto o acabado y se descuenta con control de concurrencia (el producto ya tiene versión optimista). El descuento se mantiene **al confirmar el pedido**, como hoy.
6. **En la Home y el catálogo:** las secciones automáticas excluyen productos agotados; la tarjeta muestra "Agotado" o "Quedan N" cuando el stock baja del mínimo, y el botón Comprar se desactiva si no hay stock.

Fuera de este plan (plan de e-commerce posterior): reservas con vencimiento durante el pago, varios almacenes, lotes, importación masiva o ERP, plazos de reposición, pasarela de pago, costo de envío por zona, comprobantes y correos de pedido.

## 4. Endpoint de lectura
`GET /api/publico/sitios/{clave}/unidades/isadecor/home` (público, una sola petición).
```
{ hero: {titulo, subtitulo},
  cinta: [{texto, enlace}],
  promociones: [{tipo, titulo, imagenUrl, fechaFin, producto{tarjeta}}],  // la primera es la principal
  campana: {...} | null,
  tienda: {titulo, productos[tarjeta]},
  facil: {titulo, enlaceTexto, enlaceCategoria, productos[tarjeta]},
  servicios: {etiqueta, titulo, descripcion, puntos[], textoBoton, enlace} | null,
  resenas: [{nombreCliente, calificacion, comentario, compraVerificada, productoNombre, productoSlug}] }
```
Tarjeta de producto: slug, nombre, categorías, imagen, precio base y anterior, % de descuento, unidad, modalidad, plazo de entrega, valoración y cantidad de reseñas (calculadas de las reseñas), acabados (variantes con nombre, color y si están agotadas), y estado de stock (`disponible`, `quedan` si está bajo el mínimo, o `agotado`).
Se ocultan las promociones vencidas o inactivas y las secciones sin contenido.

**Administración** (requiere rol administrativo): CRUD por recurso bajo `/api/isadecor/...` (hero, cinta, promociones, campaña, servicios y puntos, secciones, fijados, excluidos), `PATCH /api/productos/{id}/stock` y `PATCH /api/productos/{id}/variantes/{varianteId}/stock`, `GET /api/productos/{id}/movimientos-stock`, y los campos nuevos en los DTO de producto, variante y reseña.

## 5. Paso de los datos actuales a la base de datos
Un script SQL idempotente `docs/isadecor/datos/isadecor-demo.sql` (mismo formato que `cajamarca-demo.sql`) con lo que hoy está en `isadecor-home.mapper.ts` (antes `isadecor-home.source.ts`, ya eliminado):
- 5 categorías y los **12 productos** con precios, descuentos, modalidad, unidad y plazo de entrega; 4 marcados como fáciles de instalar. Stock de demostración en los productos de compra directa (uno con stock bajo y uno agotado para probar los estados); los de cotización sin control de stock.
- Variantes con sus acabados (nombre y color) y la imagen principal de cada producto.
- Hero, 4 avisos de la cinta, campaña, 3 promociones, servicios con sus 4 puntos y la configuración de las dos secciones.
- 3 reseñas de demostración (con clientes de prueba) marcadas para la Home.
- **Imágenes:** las ya generadas (12 de producto, 5 de categoría, 3 de promoción y la de campaña) se suben a Cloudinary en `isadecor/` con el script existente, y el SQL guarda sus URLs. El video y el póster de la escena siguen como archivos del frontend.
- Los datos de ISANORTE (Cajamarca) no se tocan.

## 6. Fases, entregables y comprobaciones
1. **Esquema y datos:** migración `V4` + script de datos + subida de imágenes. Comprobación: arranca Flyway y las tablas existen; el script puede ejecutarse dos veces sin duplicar.
2. **Backend:** entidades, repositorios, servicios (incluidas la lógica de demanda y el stock con su historial), controlador público `home` y CRUD admin, con **pruebas unitarias por cada clase nueva** (camino feliz, vacíos y excepciones) y `openapi.yaml` y `README.md` actualizados. Comprobación: `./mvnw -o test` en verde, `curl` al endpoint con datos y una prueba de sobreventa (dos pedidos simultáneos sobre el último producto en stock).
3. **Administración (frontend):** pantallas para los recursos y para el stock (editar, ajuste rápido, historial y filtro de stock bajo), reutilizando el admin genérico. Comprobación: crear, editar, desactivar y reordenar cada uno.
4. **Conexión del frontend:** reemplazar `isadecor-home.mapper.ts` (antes `isadecor-home.source.ts`, ya eliminado) por la llamada HTTP real y esqueletos con los conteos reales. Incluye los estados de stock en la tarjeta. Comprobación: la Home idéntica a la de hoy, sin datos locales.
5. **Revisión visual y pruebas:** escritorio y móvil, modo claro y oscuro, zoom y estados vacíos; `npm run build` y `npm test`.

Reglas: todo local, **sin commit ni push**; no se imprimen secretos del `.env`.

## 7. Riesgos
- **Arranque sin datos de demanda:** cubierto por el complemento con productos destacados.
- **Los productos que solo se cotizan:** por eso la demanda suma pedidos y cotizaciones.
- **Un producto agotado o poco adecuado en primer lugar:** los agotados se excluyen solos y el resto con la lista de excluidos.
- **Stock manual desactualizado:** el historial permite auditar; la reconciliación con inventario real queda al equipo hasta que exista integración.
- **Dos compradores del último producto:** cubierto por la validación y el control de concurrencia, con prueba dedicada.
- **Pruebas del frontend:** hoy hay 38 fallos de `npm test`; 4 son de ISADECOR (pie y cabecera) y se corrigen antes de la fase 4.

## 8. Decisiones por aprobar
1. Migración aditiva `V4` (en lugar de recrear la base).
2. Demanda = pedidos más cotizaciones, ventana de 30 días.
3. Casilla `facil_instalacion` por producto.
4. Modo mixto con productos fijados y lista de excluidos.
5. Imágenes en Cloudinary; video y póster de la escena siguen en el frontend.
6. Lo que no es editable por ahora: escena, franja de confianza, cabecera y pie.
7. **Stock** (propuestas pendientes de confirmar): por acabado y no solo por producto; descuento al confirmar el pedido (como hoy); mostrar "Quedan N" bajo el mínimo y "Agotado"; los productos que solo se cotizan siguen sin control de stock.

## 9. Estado de la fase 1 y aviso para la fase 2
- **Hecho:** `V4` aplicada en la base local (Flyway muestra la versión 4 y las 10 tablas nuevas); 21 imágenes subidas a Cloudinary (`isadecor/`); datos de demostración cargados dos veces sin duplicar (5 categorías, 12 productos, 33 acabados, 18 reseñas, hero, cinta, 3 promociones, campaña, servicios con 4 puntos, 2 secciones y 5 movimientos de stock). El endpoint público de catálogo ya devuelve las 5 categorías y los 12 productos.
- **Aviso para la fase 2 (pruebas con H2):** `src/test/resources/application-test.properties` fija `spring.flyway.target=1` porque V2 (índices parciales) y V3 (datos) son solo de PostgreSQL. Cuando se añadan entidades con las columnas y tablas de `V4`, `ddl-auto=validate` fallará en las pruebas, porque H2 solo ejecuta V1. Opciones: (a) mover V2 y V3 a una carpeta específica de PostgreSQL (`db/migration/{vendor}`) para que H2 ejecute V1 y V4; (b) añadir el esquema de V4 también a V1 (obliga a rehacer la base local); (c) pruebas de repositorio solo con PostgreSQL. Recomendación: (a). Se decidirá al empezar la fase 2.

