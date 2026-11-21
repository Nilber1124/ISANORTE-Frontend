-- Una imagen de MUESTRA por acabado (generadas con IA local). Reemplazar desde el administrador.
-- Idempotente: no duplica si ya existe la URL para el producto.

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275270/isadecor/acabados/acabado-CR-PVC-008-1.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'CR-PVC-008-1'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275270/isadecor/acabados/acabado-CR-PVC-008-1.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275271/isadecor/acabados/acabado-CR-PVC-008-2.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'CR-PVC-008-2'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275271/isadecor/acabados/acabado-CR-PVC-008-2.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275272/isadecor/acabados/acabado-LI-WPC-012-1.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'LI-WPC-012-1'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275272/isadecor/acabados/acabado-LI-WPC-012-1.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275273/isadecor/acabados/acabado-LI-WPC-012-2.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'LI-WPC-012-2'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275273/isadecor/acabados/acabado-LI-WPC-012-2.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275274/isadecor/acabados/acabado-LI-WPC-012-3.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'LI-WPC-012-3'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275274/isadecor/acabados/acabado-LI-WPC-012-3.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275278/isadecor/acabados/acabado-PC-PU-005-1.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'PC-PU-005-1'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275278/isadecor/acabados/acabado-PC-PU-005-1.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275279/isadecor/acabados/acabado-PC-PU-005-2.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'PC-PU-005-2'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275279/isadecor/acabados/acabado-PC-PU-005-2.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275275/isadecor/acabados/acabado-PD-3D-004-1.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'PD-3D-004-1'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275275/isadecor/acabados/acabado-PD-3D-004-1.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275276/isadecor/acabados/acabado-PD-3D-004-2.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'PD-3D-004-2'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275276/isadecor/acabados/acabado-PD-3D-004-2.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275280/isadecor/acabados/acabado-PI-AUT-007-1.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'PI-AUT-007-1'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275280/isadecor/acabados/acabado-PI-AUT-007-1.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275281/isadecor/acabados/acabado-PI-AUT-007-2.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'PI-AUT-007-2'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275281/isadecor/acabados/acabado-PI-AUT-007-2.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275282/isadecor/acabados/acabado-PI-AUT-007-3.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'PI-AUT-007-3'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275282/isadecor/acabados/acabado-PI-AUT-007-3.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275283/isadecor/acabados/acabado-PI-SPC-006-1.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'PI-SPC-006-1'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275283/isadecor/acabados/acabado-PI-SPC-006-1.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275284/isadecor/acabados/acabado-PI-SPC-006-2.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'PI-SPC-006-2'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275284/isadecor/acabados/acabado-PI-SPC-006-2.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275285/isadecor/acabados/acabado-PI-SPC-006-3.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'PI-SPC-006-3'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275285/isadecor/acabados/acabado-PI-SPC-006-3.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275286/isadecor/acabados/acabado-PI-SPC-006-4.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'PI-SPC-006-4'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275286/isadecor/acabados/acabado-PI-SPC-006-4.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275287/isadecor/acabados/acabado-PL-BAM-003-1.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'PL-BAM-003-1'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275287/isadecor/acabados/acabado-PL-BAM-003-1.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275288/isadecor/acabados/acabado-PL-BAM-003-2.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'PL-BAM-003-2'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275288/isadecor/acabados/acabado-PL-BAM-003-2.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275277/isadecor/acabados/acabado-PS-SAN-011-1.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'PS-SAN-011-1'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275277/isadecor/acabados/acabado-PS-SAN-011-1.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275277/isadecor/acabados/acabado-PS-SAN-011-2.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'PS-SAN-011-2'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275277/isadecor/acabados/acabado-PS-SAN-011-2.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275291/isadecor/acabados/acabado-RO-AUT-009-1.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'RO-AUT-009-1'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275291/isadecor/acabados/acabado-RO-AUT-009-1.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275293/isadecor/acabados/acabado-RO-AUT-009-2.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'RO-AUT-009-2'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275293/isadecor/acabados/acabado-RO-AUT-009-2.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275293/isadecor/acabados/acabado-RO-AUT-009-3.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'RO-AUT-009-3'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275293/isadecor/acabados/acabado-RO-AUT-009-3.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275288/isadecor/acabados/acabado-SP-MAR-002-1.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'SP-MAR-002-1'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275288/isadecor/acabados/acabado-SP-MAR-002-1.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275289/isadecor/acabados/acabado-SP-MAR-002-2.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'SP-MAR-002-2'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275289/isadecor/acabados/acabado-SP-MAR-002-2.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275290/isadecor/acabados/acabado-SP-MAR-002-3.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'SP-MAR-002-3'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275290/isadecor/acabados/acabado-SP-MAR-002-3.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275294/isadecor/acabados/acabado-WP-EXT-010-1.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'WP-EXT-010-1'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275294/isadecor/acabados/acabado-WP-EXT-010-1.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275295/isadecor/acabados/acabado-WP-EXT-010-2.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'WP-EXT-010-2'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275295/isadecor/acabados/acabado-WP-EXT-010-2.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275296/isadecor/acabados/acabado-WP-WPC-001-1.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'WP-WPC-001-1'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275296/isadecor/acabados/acabado-WP-WPC-001-1.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275297/isadecor/acabados/acabado-WP-WPC-001-2.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'WP-WPC-001-2'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275297/isadecor/acabados/acabado-WP-WPC-001-2.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275298/isadecor/acabados/acabado-WP-WPC-001-3.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'WP-WPC-001-3'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275298/isadecor/acabados/acabado-WP-WPC-001-3.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275299/isadecor/acabados/acabado-WP-WPC-001-4.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'WP-WPC-001-4'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275299/isadecor/acabados/acabado-WP-WPC-001-4.webp');

INSERT INTO imagenes_producto (id, producto_id, variante_id, url, alt_text, es_principal, orden, fecha_creacion)
SELECT gen_random_uuid(), v.producto_id, v.id, 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275300/isadecor/acabados/acabado-WP-WPC-001-5.webp', 'Acabado ' || v.nombre, false,
       COALESCE((SELECT MAX(i.orden) FROM imagenes_producto i WHERE i.producto_id = v.producto_id), 0) + 1, now()
FROM variantes_producto v WHERE v.sku = 'WP-WPC-001-5'
  AND NOT EXISTS (SELECT 1 FROM imagenes_producto i WHERE i.producto_id = v.producto_id AND i.url = 'https://res.cloudinary.com/dmf9fsyvt/image/upload/v1795275300/isadecor/acabados/acabado-WP-WPC-001-5.webp');
