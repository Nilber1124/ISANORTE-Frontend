# Prompt 1 · Backend: modelo de contenido y endpoint del Home

> Pega primero el "Contexto común" de `00-LEEME.md`.

## Objetivo
Reemplazar el uso de la tabla `anuncios` (columna `ubicacion`) como fuente del Home de ISADECOR por tablas propias y un endpoint agregado único.

## Antes de escribir código
1. Lee `ISANORTE-Backend/AGENTS.md`, `docs/openapi.yaml` y `src/main/resources/db/migration/V1__esquema_inicial.sql`.
2. Estudia cómo se resolvió el contenido de ISANORTE (tablas propias, controladores `Public*`, DTO, mapper, tests) y **replica ese patrón** (paquete base `com.isanorte.constructora_api`).
3. Confirma que `productos` ya tiene `precio_base`, `precio_anterior`, `descuento_porcentaje`, `destacado`, `orden_destacado`, `disponibilidad`. No lo rehagas.

## Cambios de esquema (editar V1 si el proyecto reinicia la base, como se hizo con ISANORTE; no crear V4 salvo que `BASE-DE-DATOS-Y-REINICIO.md` diga lo contrario)
1. `productos`: añadir `modalidad VARCHAR(10) NOT NULL DEFAULT 'COTIZAR'` con CHECK in ('COMPRAR','COTIZAR'); `unidad_venta VARCHAR(20)` (M2, UNIDAD, CAJA, ML); `es_nuevo BOOLEAN NOT NULL DEFAULT FALSE`.
2. Nuevas tablas (todas con `id UUID`, `unidad_negocio_id` FK, `orden INT >= 0`, `activo BOOLEAN`, fechas de creación/actualización):
   - `isadecor_hero` (titulo, subtitulo, imagen_url, placeholder_buscador, texto_boton, destino_boton).
   - `isadecor_beneficios` (titulo, descripcion, icono).
   - `isadecor_ambientes` (nombre, slug, descripcion_corta, imagen_url, categoria_slug_filtro NULL, termino_busqueda NULL).
   - `isadecor_obras` (titulo, ubicacion_texto, imagen_url, descripcion_corta).
   - `isadecor_calculadora` (titulo, descripcion, merma_porcentaje, texto_boton) — una fila por unidad.
   - Las categorías del hero salen de `categorias_producto` (añadir `destacada_home BOOLEAN`, `orden_home INT`, `imagen_url` si no existen), NO de una tabla nueva.
   - Las ofertas salen de `productos` con descuento > 0; los nuevos de `es_nuevo`; los destacados de `destacado`.
3. Reseñas: reutiliza `resenas_producto`.
4. Redes: reutiliza `redes_sociales` (Instagram, TikTok).

## Endpoint nuevo (público, solo lectura)
`GET /api/publico/sitios/{clave}/unidades/{slug}/home`
Respuesta (un solo JSON, ordenado por `orden`, solo `activo = true`):
```
{
  hero, categorias[], beneficios[], ambientes[], obras[], calculadora,
  productos: { destacados[], nuevos[], ofertas[] },   // máx. 8 cada uno, con tarjeta resumida
  resenas[] (máx. 6, las mejor valoradas),
  redes[] (nombre, url, icono)
}
```
La tarjeta de producto incluye: slug, nombre, resumen, imagen principal, categoria, precioBase, precioAnterior, descuentoPorcentaje, unidadVenta, modalidad, esNuevo, disponibilidad.
Los conteos reales por sección también se devuelven (`conteos`), para que el frontend pinte esqueletos del tamaño correcto.

## Entregables
- Entidades, repositorios, servicios, DTO, mapper y controlador, siguiendo el patrón existente.
- CRUD administrativo de las 5 tablas nuevas con los mismos permisos que ISANORTE (endpoint genérico si ya existe en ISANORTE; si no, uno por entidad).
- **Tests unitarios por cada clase nueva** (feliz, vacío/nulos, excepciones, Mockito `verify`). Ejecuta `./mvnw -o test`.
- Actualizar `docs/openapi.yaml` y `README.md`.
- Marcar como obsoleto (no borrar todavía) el uso de `CINTA_HOME`, `PROMOCION_*`, `ANUNCIOS_HOME`, `CATEGORIA_SUPERIOR` de `anuncios`.

## No hagas
Commit/push, cambios en cotizaciones, pedidos, carrito, checkout ni cuenta. No toques datos de ISANORTE.

## Verificación
Arranca el backend y comprueba con curl que `/home` responde 200 con listas vacías (aún sin datos).
