-- Catálogos PDF de MUESTRA para ISADECOR (PDF generados con datos de demostración). Reemplazar desde el administrador.
-- La portada es una foto de la línea SIN texto (el título lo pone la tarjeta). Idempotente: crea los que faltan
-- y actualiza portada y archivo de los existentes con el mismo título.
WITH v(titulo, portada, pdf, orden) AS (VALUES
    ('Paredes y revestimientos', 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795116759/isadecor/cat/cat-paredes.webp', 'https://res.cloudinary.com/dmf9fsyvt/raw/upload/v1795277251/isadecor/catalogos/catalogo-paredes.pdf', 1),
    ('Pisos', 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795116760/isadecor/cat/cat-pisos.webp', 'https://res.cloudinary.com/dmf9fsyvt/raw/upload/v1795277253/isadecor/catalogos/catalogo-pisos.pdf', 2),
    ('Techos', 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795116760/isadecor/cat/cat-techos.webp', 'https://res.cloudinary.com/dmf9fsyvt/raw/upload/v1795277256/isadecor/catalogos/catalogo-techos.pdf', 3),
    ('Autoadhesivos', 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795116763/isadecor/promo/promo-rollo.webp', 'https://res.cloudinary.com/dmf9fsyvt/raw/upload/v1795277258/isadecor/catalogos/catalogo-autoadhesivos.pdf', 4),
    ('Exterior y estructura', 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795116757/isadecor/cat/cat-listones.webp', 'https://res.cloudinary.com/dmf9fsyvt/raw/upload/v1795277260/isadecor/catalogos/catalogo-exterior-estructura.pdf', 5)),
u AS (SELECT id FROM unidades_negocio WHERE slug = 'isadecor'),
actualizados AS (
    UPDATE catalogos c SET imagen_portada_url = v.portada, archivo_url = v.pdf, fecha_actualizacion = now()
    FROM v, u WHERE c.unidad_negocio_id = u.id AND c.titulo = v.titulo
    RETURNING c.titulo)
INSERT INTO catalogos (id, titulo, imagen_portada_url, archivo_url, orden, activo, unidad_negocio_id,
                       fecha_creacion, fecha_actualizacion)
SELECT gen_random_uuid(), v.titulo, v.portada, v.pdf, v.orden, true, u.id, now(), now()
FROM v, u
WHERE v.titulo NOT IN (SELECT titulo FROM actualizados)
  AND NOT EXISTS (SELECT 1 FROM catalogos c WHERE c.unidad_negocio_id = u.id AND c.titulo = v.titulo);
