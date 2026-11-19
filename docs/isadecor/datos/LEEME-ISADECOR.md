# Datos de demostración de ISADECOR

Requisitos: backend con la migración `V4` aplicada (se aplica al arrancar) y la unidad de negocio `isadecor` (V3).

## Cargar (idempotente)
```bash
PGOPTIONS='-c search_path=isanorte_main' psql -h localhost -U postgres -d isanorte_db -v ON_ERROR_STOP=1 -q -f isadecor-demo.sql
```
Se puede ejecutar varias veces: las filas existentes se conservan (`ON CONFLICT DO NOTHING`). No modifica datos de ISANORTE.

## Qué contiene
5 categorías, 12 productos (precios, descuentos, modalidad, unidad, plazo de entrega, stock de muestra con un producto de stock bajo y uno agotado), 33 acabados con color, 18 reseñas (3 marcadas para la Home), hero, 4 avisos de la cinta, 3 promociones, 1 campaña, el bloque para constructoras con sus 4 puntos, las 2 secciones de productos automáticas y el historial de stock inicial.

## Regenerar
`demo-isadecor/build_sql.py` genera el SQL desde `manifiesto.json` (URLs de Cloudinary); `demo-isadecor/subir.py` sube las imágenes de `public/media/isadecor` a la carpeta `isadecor/` de Cloudinary con las credenciales del `.env` del backend.

## Notas
- Las reseñas usan identificadores de cliente de muestra (la tabla no exige que existan en `clientes`).
- Las promociones con fecha vencen a los 30 días de cargar los datos.
- El video y el póster de la escena siguen siendo archivos del frontend.
