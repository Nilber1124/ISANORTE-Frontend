# ISADECOR · Estructura del Home (implementada)

Descripción de cómo está construido hoy `/isadecor`. Sustituye a la especificación original pensada para Antigravity (tablas `isadecor_ambientes`, `obras`, `calculadora`, pestañas Destacados/Nuevos/Ofertas), que **no se implementó**: el diseño cambió a una tienda con escena de video. Los prompts de `prompts/` quedan solo como historial. Para el esquema y las decisiones del backend, ver `PLAN-BACKEND.md`.

## 1. Secciones, en orden
| # | Sección | Origen del contenido |
|---|---------|----------------------|
| 1 | Cabecera de tienda (aviso, buscador, categorías) | Código + categorías del catálogo público |
| 2 | Hero + escena «Arma tu ambiente» (video con scroll) | Titular y subtítulo: **BD** · video, póster y pasos: **código** (`isadecor-home.static.ts`) |
| 3 | Cinta de avisos | **BD** (`isadecor_cinta`) |
| 4 | Promociones (1 grande + 2 pequeñas, máx. 3) | **BD** (`isadecor_promociones` + producto real); las vencidas o con producto agotado no se envían |
| 5 | Campaña | **BD** (`isadecor_campana`) |
| 6 | Elige tu acabado (selección de 8, filtrable por categoría) | **BD**: sección `TIENDA`, automática por demanda |
| 7 | Fáciles de instalar | **BD**: sección `FACILES`, solo productos marcados «fácil de instalar» |
| 8 | Franja de confianza (envío, instalación, garantía, pago) | **Código** (`HOME_BENEFITS`) |
| 9 | Constructoras y arquitectos | **BD** (`isadecor_servicios_empresa` + `isadecor_servicio_puntos`) |
| 10 | Reseñas | **BD**: reseñas reales con «mostrar en Home» |
| 11 | Pie de confianza | Código + datos de contacto del sitio |

Una sección sin contenido activo **se oculta** (nunca se muestran cajas vacías).

## 2. Flujo de datos
`Home` (componente) → `IsadecorHomeFacade` (signals `content`, `loading`, `error`) → `PublicContentApiService.getIsadecorHome()` → `GET /api/publico/sitios/isanorte/unidades/isadecor/home` → `toHomeContent()` (`isadecor-home.mapper.ts`) → modelo de vista `IsadecorHomeContent` (`isadecor-home.model.ts`).

- **Una sola petición** para todo el Home; el resto del layout hace las suyas (sitio y catálogo).
- El contrato de respuesta está en `src/app/data/models/isadecor-home/isadecor-home-response.model.ts` y en `docs/openapi.yaml` del backend.
- Estados: cargando (esqueleto fijo de 4 bloques), error con «Reintentar» y secciones vacías ocultas.
- Los filtros (chips) de la tienda salen de las categorías reales de los productos elegidos; «Ofertas» filtra por descuento.

## 3. Selección automática por demanda
La sección `TIENDA` y `FACILES` tiene un **modo**:
- `AUTOMATICO`: ordena por unidades pedidas + cotizadas en los últimos N días (por defecto 30); sin demanda, usa destacados y luego el nombre.
- `MANUAL`: solo los productos fijados, en su orden.
- `MIXTO`: primero los fijados y luego se completa por demanda, sin duplicados.

Siempre se excluyen los productos marcados como excluidos y los agotados; el máximo lo define `limite` (1–24).

## 4. Stock visible
La tarjeta muestra «Quedan N» cuando el stock es bajo (≤ `stock_minimo`), atenúa las muestras de acabados agotados y el producto agotado no aparece en promociones ni en secciones. El stock se controla **por acabado**; los pedidos lo descuentan y la cancelación lo restituye (ver `PLAN-BACKEND.md` §3b).

## 5. Administración
Menú **Home ISADECOR** (`/admin/home-isadecor/*`), con la pantalla genérica de `features/admin/site-content`:

| Pantalla | Qué edita |
|----------|-----------|
| Hero de la Home | Titular y subtítulo |
| Cinta de avisos | Textos y enlaces |
| Promociones | Producto, tipo, imagen, fecha de fin, principal |
| Campaña | Etiqueta, título, descripción, botón, imagen |
| Bloque de servicio / Puntos del servicio | Texto del bloque y sus viñetas |
| Secciones de productos | Título, modo, ventana, límite, **fijados y excluidos** |
| Reseñas del Home | Qué reseñas reales se muestran y en qué orden |

En **Productos** (editar) hay además: modalidad (comprar/cotizar), unidad de venta, plazo de entrega, fácil de instalar, aviso de poco stock, color de cada acabado y el panel de **Inventario** (ajustes con motivo e historial). Las reseñas que salen en la Home se eligen en **Home ISADECOR → Reseñas del Home** (marca «En la Home» y orden; máximo 6).

## 6. Archivos
- `src/app/features/isadecor/home/`: `home.ts/html`, `isadecor-home.facade.ts`, `isadecor-home.mapper.ts`, `isadecor-home.model.ts`, `isadecor-home.static.ts`, y los componentes `arma-ambiente/`, `product-tile/`, `promo-banner/`, `ribbon/`, `category-tile/`.
- `public/media/isadecor/`: video (`arma-ambiente.mp4` y `-sm.mp4`), pósters y fotos de categorías y promociones.
- `docs/isadecor/datos/isadecor-demo.sql`: datos de demostración (ver `LEEME-ISADECOR.md`).

## 7. Pendiente conocido
- El flujo «Comprar» completo (pagos, envíos, comprobantes, correos, reservas de stock) está diferido; hoy la tarjeta lleva a la ficha con la etiqueta Comprar/Cotizar.
- Las fuentes se cargan desde Google Fonts (pendiente autoalojarlas).
- Los textos de la franja de confianza y del pie son de muestra hasta confirmarlos con el cliente.
- La escena de video y la franja de confianza no son editables desde el administrador.
