# Prompt 2 · Datos de demostración de ISADECOR (SQL)

> Pega primero el "Contexto común" de `00-LEEME.md`. Requiere el Prompt 1 terminado.

## Objetivo
Crear `ISANORTE-Frontend/docs/isadecor/datos/isadecor-demo.sql` (idempotente) con datos de demostración coherentes para el Home, igual que `docs/landing/datos/cajamarca-demo.sql` hizo con ISANORTE. Léelo y `docs/landing/datos/LEEME.md` primero para copiar el formato y la forma de cargarlo.

## Contenido
- **Categorías (6)**: Paneles de pared WPC, Planchas SPC tipo mármol, Pisos SPC, Cielos rasos PVC, Revestimientos y molduras, Mobiliario a medida. 4 marcadas `destacada_home` (pared, piso, techo, mobiliario).
- **Productos (24)**: 4 por categoría, con `sku`, `slug`, nombre comercial creíble, resumen, descripción, `precio_base` en soles realistas, `unidad_venta` (M2/UNIDAD/CAJA/ML), `disponibilidad`.
  - `modalidad`: perfiles, molduras, pisos por caja y paneles pequeños = `COMPRAR`; cielo raso por proyecto, planchas gran formato y mobiliario = `COTIZAR` (precio referencial).
  - 8 con `destacado=true` (con `orden_destacado`), 6 con `es_nuevo=true`, 6 con `precio_anterior` y `descuento_porcentaje` (ofertas, 10-30 %).
  - 2-3 variantes por producto (color/acabado) y 2-3 especificaciones (medida, espesor, resistencia a humedad).
  - Cada producto referencia imágenes por **nombre de archivo convencional**: `isadecor/productos/<slug>-1.jpg`, `-2.jpg` (la URL final se reemplaza tras el Prompt 3).
- **Hero** (1), **beneficios** (4: envío a provincias, instalación con técnicos, garantía, pagos), **ambientes** (4), **obras** (4, con ubicaciones de Cajamarca), **calculadora** (merma 10 %).
- **Reseñas**: 12 con nombres peruanos, puntuaciones 4-5, comentarios cortos y específicos (no "excelente producto").
- **Redes**: Instagram y TikTok con URLs marcador (`https://www.instagram.com/PENDIENTE`, `https://www.tiktok.com/@PENDIENTE`).
- Textos en español de Perú, sin superlativos vacíos, sin la palabra "Import".

## Entregables
- `isadecor-demo.sql` + `isadecor-demo-manifiesto.json` (lista de imágenes necesarias: ruta, producto/sección, descripción para generarla).
- Instrucciones de carga en `datos/LEEME-ISADECOR.md`.

## Verificación
Cargar en la base local (`isanorte_main`), volver a cargar (debe ser idempotente) y comprobar `GET .../unidades/isadecor/home` con curl: listas con datos y `conteos` correctos.

## No hagas
Commit/push ni cambios de código.
