-- Subcategorías de MUESTRA para ISADECOR (requiere la migración V8). Reemplazar desde el administrador.
-- Idempotente: no duplica subcategorías ni vínculos. Los productos conservan su categoría principal y
-- además quedan en su subcategoría (elegir la categoría padre en el catálogo incluye a las hijas).
WITH nuevas(padre, nombre, slug, orden) AS (VALUES
    ('paredes', 'Wall panel de interior', 'wall-panel-de-interior', 10),
    ('paredes', 'Piedra y mármol', 'piedra-y-marmol', 11),
    ('paredes', 'Planchas de bambú', 'planchas-de-bambu', 12),
    ('pisos', 'Piso SPC', 'piso-spc', 20),
    ('pisos', 'Piso autoadhesivo', 'piso-autoadhesivo', 21),
    ('exterior-estructura', 'Wall panel de exteriores', 'wall-panel-de-exteriores', 30),
    ('exterior-estructura', 'Listones y separadores', 'listones-y-separadores', 31),
    ('exterior-estructura', 'Panel sándwich', 'panel-sandwich-estructura', 32))
INSERT INTO categorias_producto (id, nombre, slug, activo, orden, unidad_negocio_id, categoria_padre_id,
                                 fecha_creacion, fecha_actualizacion)
SELECT gen_random_uuid(), n.nombre, n.slug, true, n.orden, p.unidad_negocio_id, p.id, now(), now()
FROM nuevas n JOIN categorias_producto p ON p.slug = n.padre
WHERE NOT EXISTS (SELECT 1 FROM categorias_producto x WHERE x.slug = n.slug);

WITH vinculos(categoria, producto) AS (VALUES
    ('wall-panel-de-interior', 'wall-panel-wpc-interior'),
    ('wall-panel-de-interior', 'paneles-decorativos-3d'),
    ('piedra-y-marmol', 'piedra-cincelada-pu'),
    ('piedra-y-marmol', 'plancha-marmol-spc'),
    ('planchas-de-bambu', 'plancha-bambu'),
    ('piso-spc', 'piso-spc-alto-transito'),
    ('piso-autoadhesivo', 'piso-autoadhesivo-pvc'),
    ('wall-panel-de-exteriores', 'wallpanel-exterior'),
    ('listones-y-separadores', 'listones-wpc-separadores'),
    ('panel-sandwich-estructura', 'panel-sandwich'))
INSERT INTO categoria_producto (categoria_id, producto_id)
SELECT c.id, p.id
FROM vinculos v JOIN categorias_producto c ON c.slug = v.categoria JOIN productos p ON p.slug = v.producto
WHERE NOT EXISTS (SELECT 1 FROM categoria_producto x WHERE x.categoria_id = c.id AND x.producto_id = p.id);
