-- Fichas de ejemplo (descripción con viñetas y especificaciones) de los productos de demostración de ISADECOR.
-- Son datos de MUESTRA: reemplazarlos desde el administrador con la información real de cada producto.
-- Formato de la descripción: el primer párrafo, una línea en blanco y luego viñetas que empiezan con «- ».

UPDATE productos SET descripcion = 'Panel de WPC con veta de madera para revestir muros interiores sin pintura ni obra húmeda.

- Veta de madera uniforme en cada pieza
- Resiste la humedad y no lo atacan las termitas
- Se limpia con un paño húmedo
- Se instala por encastre o con adhesivo de montaje' WHERE slug = 'wall-panel-wpc-interior';
DELETE FROM especificaciones_producto WHERE producto_id = (SELECT id FROM productos WHERE slug = 'wall-panel-wpc-interior');
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('fe831127-ebde-5ce1-b9d9-ec438cc21d14', 'Largo del panel', '2,90 m', 'Medidas', 0, (SELECT id FROM productos WHERE slug = 'wall-panel-wpc-interior'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('180c565c-174e-5db6-a3a5-782f41d4bf83', 'Espesor', '9 mm', 'Medidas', 1, (SELECT id FROM productos WHERE slug = 'wall-panel-wpc-interior'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('49767a4e-6625-572f-a19f-ea8e5669d025', 'Material', 'WPC (compuesto de madera y plástico)', 'Material y uso', 2, (SELECT id FROM productos WHERE slug = 'wall-panel-wpc-interior'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('cecc5b61-3ba9-57cb-9bb9-d01b115e776a', 'Uso', 'Interior', 'Material y uso', 3, (SELECT id FROM productos WHERE slug = 'wall-panel-wpc-interior'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('db5b1c67-d8c8-5a55-a634-638234dae3d2', 'Acabados', 'Nogal, roble, ceniza, blanco y negro', 'Material y uso', 4, (SELECT id FROM productos WHERE slug = 'wall-panel-wpc-interior'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('70e8de91-aa32-5273-a552-7254046a4534', 'Sistema', 'Adhesivo de montaje o clips', 'Instalación', 5, (SELECT id FROM productos WHERE slug = 'wall-panel-wpc-interior'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('2821e40a-aa0a-5869-b09c-145642fc5145', 'Mantenimiento', 'Paño húmedo', 'Instalación', 6, (SELECT id FROM productos WHERE slug = 'wall-panel-wpc-interior'));

UPDATE productos SET descripcion = 'Plancha SPC de gran formato con acabado mármol para muros y paneles de acento.

- Gran formato: menos juntas y una instalación más rápida
- Superficie lisa, fácil de limpiar
- Resistente al agua: apta para baños y cocinas
- Acabados Carrara, Negro Marquina y Gris' WHERE slug = 'plancha-marmol-spc';
DELETE FROM especificaciones_producto WHERE producto_id = (SELECT id FROM productos WHERE slug = 'plancha-marmol-spc');
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('d3a9173c-9838-594b-8c0c-5d4cbfda7cd6', 'Formato', 'Gran formato (consultar medidas por acabado)', 'Medidas', 0, (SELECT id FROM productos WHERE slug = 'plancha-marmol-spc'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('974e4382-b237-5040-862e-10aec4d9d25a', 'Material', 'SPC (compuesto de piedra y polímero)', 'Material y uso', 1, (SELECT id FROM productos WHERE slug = 'plancha-marmol-spc'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('e46ece21-70ba-5ba6-b2f0-5a33207b81cf', 'Uso', 'Interior, zonas húmedas', 'Material y uso', 2, (SELECT id FROM productos WHERE slug = 'plancha-marmol-spc'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('bd044d02-6f04-53db-9c43-b8e84c60dff2', 'Acabados', 'Carrara, Negro Marquina y Gris', 'Material y uso', 3, (SELECT id FROM productos WHERE slug = 'plancha-marmol-spc'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('e002aaa6-3c44-5683-9674-e95fdf25529f', 'Sistema', 'Adhesivo de montaje', 'Instalación', 4, (SELECT id FROM productos WHERE slug = 'plancha-marmol-spc'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('72009d3a-a77b-5c14-9c0d-0a51f09d1f84', 'Mantenimiento', 'Paño húmedo', 'Instalación', 5, (SELECT id FROM productos WHERE slug = 'plancha-marmol-spc'));

UPDATE productos SET descripcion = 'Piso SPC click de alta resistencia para hogares y locales con mucho tránsito.

- Sistema click: se instala sin pegamento sobre piso nivelado
- Alta resistencia al tránsito y a la humedad
- Superficie con veta de madera y textura realista
- Se vende por caja; el calculador estima cuántas necesitas' WHERE slug = 'piso-spc-alto-transito';
DELETE FROM especificaciones_producto WHERE producto_id = (SELECT id FROM productos WHERE slug = 'piso-spc-alto-transito');
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('0a694297-1ed2-577c-baa7-cfacebae01ae', 'Se vende por', 'Caja', 'Medidas', 0, (SELECT id FROM productos WHERE slug = 'piso-spc-alto-transito'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('5ffecfe1-2329-544f-9489-c29eab806a85', 'Espesor', '5 mm', 'Medidas', 1, (SELECT id FROM productos WHERE slug = 'piso-spc-alto-transito'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('48acca5a-eb10-5969-bb48-1c08496772a7', 'Material', 'SPC (compuesto de piedra y polímero)', 'Material y uso', 2, (SELECT id FROM productos WHERE slug = 'piso-spc-alto-transito'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('aa72d30b-38ad-55ac-8ecf-77faaedc91c8', 'Uso', 'Interior, alto tránsito', 'Material y uso', 3, (SELECT id FROM productos WHERE slug = 'piso-spc-alto-transito'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('2ae2d47b-b468-5618-bf07-e29981b66379', 'Acabados', 'Roble claro, roble ahumado, gris cemento y nogal', 'Material y uso', 4, (SELECT id FROM productos WHERE slug = 'piso-spc-alto-transito'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('198e2925-4f3d-5abe-8af2-275b499ff714', 'Sistema', 'Click flotante', 'Instalación', 5, (SELECT id FROM productos WHERE slug = 'piso-spc-alto-transito'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('71028d99-4cbf-5d8d-a427-a5a81fb29c22', 'Mantenimiento', 'Escoba o paño húmedo', 'Instalación', 6, (SELECT id FROM productos WHERE slug = 'piso-spc-alto-transito'));

UPDATE productos SET descripcion = 'Cielo raso de PVC ligero, antihongos y fácil de limpiar.

- Liviano: no exige estructuras pesadas
- No se pudre ni acumula hongos con la humedad
- Superficie lisa que se limpia con un paño
- Acabado blanco o madera clara' WHERE slug = 'cielo-raso-pvc';
DELETE FROM especificaciones_producto WHERE producto_id = (SELECT id FROM productos WHERE slug = 'cielo-raso-pvc');
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('6e67f1dd-5b10-58be-ad16-81e2cbe3165c', 'Material', 'PVC', 'Material y uso', 0, (SELECT id FROM productos WHERE slug = 'cielo-raso-pvc'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('1c24dfb9-b904-5b47-b179-362a823a39ff', 'Uso', 'Interior (techos y cielos rasos)', 'Material y uso', 1, (SELECT id FROM productos WHERE slug = 'cielo-raso-pvc'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('d86d2d20-304f-5447-a46a-7fbf14ef5704', 'Acabados', 'Blanco y madera clara', 'Material y uso', 2, (SELECT id FROM productos WHERE slug = 'cielo-raso-pvc'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('f76aea1a-3eb1-54c6-b78b-a328a5ddd711', 'Sistema', 'Perfiles y clips sobre estructura ligera', 'Instalación', 3, (SELECT id FROM productos WHERE slug = 'cielo-raso-pvc'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('ab63a24d-f2b6-5964-b613-5801b1636045', 'Mantenimiento', 'Paño húmedo', 'Instalación', 4, (SELECT id FROM productos WHERE slug = 'cielo-raso-pvc'));

UPDATE productos SET descripcion = 'Rollo de vinilo autoadhesivo para renovar muros y muebles sin obra.

- Se pega sin herramientas: quita el papel y presiona
- Ideal para renovar muebles, muros lisos y closets
- Se corta a medida con tijera o cúter
- Acabados concreto, blanco y arena' WHERE slug = 'rollo-autoadhesivo';
DELETE FROM especificaciones_producto WHERE producto_id = (SELECT id FROM productos WHERE slug = 'rollo-autoadhesivo');
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('24e326ba-3174-539b-a073-8f62a00207e2', 'Material', 'Vinilo autoadhesivo', 'Material y uso', 0, (SELECT id FROM productos WHERE slug = 'rollo-autoadhesivo'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('9dfe6a25-675c-54e6-bfe8-f7c771866932', 'Uso', 'Interior (muros lisos y muebles)', 'Material y uso', 1, (SELECT id FROM productos WHERE slug = 'rollo-autoadhesivo'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('f5146ee1-3c0e-5389-9eb4-d092315e3b4a', 'Acabados', 'Concreto, blanco y arena', 'Material y uso', 2, (SELECT id FROM productos WHERE slug = 'rollo-autoadhesivo'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('2f727a59-4a56-5abf-aa6e-b6870fbf375c', 'Sistema', 'Autoadhesivo', 'Instalación', 3, (SELECT id FROM productos WHERE slug = 'rollo-autoadhesivo'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('0018cca0-cd81-5a54-845e-a18f1313a56d', 'Preparación', 'Superficie limpia, seca y lisa', 'Instalación', 4, (SELECT id FROM productos WHERE slug = 'rollo-autoadhesivo'));

UPDATE productos SET descripcion = 'Tablones autoadhesivos de PVC para renovar pisos sin obra.

- Se pegan directamente sobre un piso limpio y nivelado
- Cortan fácil para adaptarse a cualquier ambiente
- Se venden por caja
- Acabados roble, gris y nogal' WHERE slug = 'piso-autoadhesivo-pvc';
DELETE FROM especificaciones_producto WHERE producto_id = (SELECT id FROM productos WHERE slug = 'piso-autoadhesivo-pvc');
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('ede04b4f-cdce-52e9-aedb-0efbb02d6c08', 'Se vende por', 'Caja', 'Medidas', 0, (SELECT id FROM productos WHERE slug = 'piso-autoadhesivo-pvc'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('e80ae28b-1ede-55f2-9ef2-b6e7e58d30d7', 'Material', 'PVC autoadhesivo', 'Material y uso', 1, (SELECT id FROM productos WHERE slug = 'piso-autoadhesivo-pvc'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('360cb301-6ed1-5095-80a9-5ac1722cfd52', 'Uso', 'Interior', 'Material y uso', 2, (SELECT id FROM productos WHERE slug = 'piso-autoadhesivo-pvc'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('5407823b-e870-58a3-8be3-686e5f1f3e1a', 'Acabados', 'Roble, gris y nogal', 'Material y uso', 3, (SELECT id FROM productos WHERE slug = 'piso-autoadhesivo-pvc'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('540c619f-239a-58cd-9de0-6f84e4ccdbf7', 'Sistema', 'Autoadhesivo', 'Instalación', 4, (SELECT id FROM productos WHERE slug = 'piso-autoadhesivo-pvc'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('b653d8d1-2fea-5f4a-9009-4cbfd54aa430', 'Preparación', 'Piso limpio, seco y nivelado', 'Instalación', 5, (SELECT id FROM productos WHERE slug = 'piso-autoadhesivo-pvc'));

UPDATE productos SET descripcion = 'Paneles con relieve geométrico para dar profundidad a los muros de acento.

- Relieve geométrico que juega con la luz
- Livianos y fáciles de cortar
- Se pueden pintar con el color que prefieras
- Acabados blanco y gris' WHERE slug = 'paneles-decorativos-3d';
DELETE FROM especificaciones_producto WHERE producto_id = (SELECT id FROM productos WHERE slug = 'paneles-decorativos-3d');
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('04cdf675-a4fc-5c61-b235-f9da28d6ffa9', 'Material', 'Panel decorativo de relieve 3D', 'Material y uso', 0, (SELECT id FROM productos WHERE slug = 'paneles-decorativos-3d'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('a9747443-3e9e-544e-959f-a95c07e22396', 'Uso', 'Interior', 'Material y uso', 1, (SELECT id FROM productos WHERE slug = 'paneles-decorativos-3d'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('9fe6e3e7-9673-503d-a01f-b5758aebaec1', 'Se vende por', 'Unidad', 'Material y uso', 2, (SELECT id FROM productos WHERE slug = 'paneles-decorativos-3d'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('cc92c73b-7abc-536a-a684-4b5fb6eef740', 'Acabados', 'Blanco y gris', 'Material y uso', 3, (SELECT id FROM productos WHERE slug = 'paneles-decorativos-3d'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('52be913c-8194-5258-9ab6-b203b51f5f2e', 'Sistema', 'Adhesivo de montaje', 'Instalación', 4, (SELECT id FROM productos WHERE slug = 'paneles-decorativos-3d'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('69fcbfc5-6aa0-5dae-9082-0d79963a7828', 'Acabado', 'Pintable', 'Instalación', 5, (SELECT id FROM productos WHERE slug = 'paneles-decorativos-3d'));

UPDATE productos SET descripcion = 'Listones WPC verticales para separar ambientes con un acabado de madera.

- Dividen espacios sin cerrarlos del todo
- Acabado de madera resistente a la humedad
- Se venden por metro lineal
- Acabados nogal, roble y negro' WHERE slug = 'listones-wpc-separadores';
DELETE FROM especificaciones_producto WHERE producto_id = (SELECT id FROM productos WHERE slug = 'listones-wpc-separadores');
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('6a65e122-02bf-5eb0-b05c-12f5c99765d0', 'Se vende por', 'Metro lineal', 'Medidas', 0, (SELECT id FROM productos WHERE slug = 'listones-wpc-separadores'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('b9e1fa53-26f4-58bb-a6a4-13fa05be591d', 'Material', 'WPC (compuesto de madera y plástico)', 'Material y uso', 1, (SELECT id FROM productos WHERE slug = 'listones-wpc-separadores'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('fd0f89c3-6259-583d-ba71-8996cc8329a6', 'Uso', 'Interior', 'Material y uso', 2, (SELECT id FROM productos WHERE slug = 'listones-wpc-separadores'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('51a1d3a8-88e7-59cd-9abe-9c851c481c63', 'Acabados', 'Nogal, roble y negro', 'Material y uso', 3, (SELECT id FROM productos WHERE slug = 'listones-wpc-separadores'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('a3160e7e-273a-5e83-89cd-5d6dfdbbff5d', 'Sistema', 'Fijación a piso y techo o a estructura', 'Instalación', 4, (SELECT id FROM productos WHERE slug = 'listones-wpc-separadores'));

UPDATE productos SET descripcion = 'Panel aislante para techos y cerramientos.

- Núcleo aislante entre dos láminas
- Mejora el confort térmico y acústico
- Liviano y rápido de montar
- Para techos, cerramientos y divisiones' WHERE slug = 'panel-sandwich';
DELETE FROM especificaciones_producto WHERE producto_id = (SELECT id FROM productos WHERE slug = 'panel-sandwich');
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('d4b348eb-4df8-57a7-aa3c-51daba114129', 'Material', 'Panel sándwich con núcleo aislante', 'Material y uso', 0, (SELECT id FROM productos WHERE slug = 'panel-sandwich'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('b1733459-e0fe-5b80-9aa7-b7a2f6e608e0', 'Uso', 'Techos y cerramientos', 'Material y uso', 1, (SELECT id FROM productos WHERE slug = 'panel-sandwich'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('434bd2af-e215-51d3-abf8-67f4801c7f15', 'Se vende por', 'Metro cuadrado', 'Material y uso', 2, (SELECT id FROM productos WHERE slug = 'panel-sandwich'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('55673da3-8471-5278-9520-726e917dc823', 'Sistema', 'Fijación a estructura metálica', 'Instalación', 3, (SELECT id FROM productos WHERE slug = 'panel-sandwich'));

UPDATE productos SET descripcion = 'Revestimiento de poliuretano con textura de piedra cincelada.

- Textura de piedra natural con una fracción del peso
- Liviano: se fija con adhesivo
- Resistente a la humedad
- Para muros interiores y exteriores protegidos' WHERE slug = 'piedra-cincelada-pu';
DELETE FROM especificaciones_producto WHERE producto_id = (SELECT id FROM productos WHERE slug = 'piedra-cincelada-pu');
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('8707266a-baaf-5bfa-82db-50876b9898a6', 'Material', 'Poliuretano (PU)', 'Material y uso', 0, (SELECT id FROM productos WHERE slug = 'piedra-cincelada-pu'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('fbf3e7d8-a876-5287-b60c-e5b056c37c97', 'Uso', 'Interior y exterior protegido', 'Material y uso', 1, (SELECT id FROM productos WHERE slug = 'piedra-cincelada-pu'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('d1e8396b-310e-58b4-ad85-d26adc2a3dcf', 'Se vende por', 'Metro cuadrado', 'Material y uso', 2, (SELECT id FROM productos WHERE slug = 'piedra-cincelada-pu'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('d1bc35c8-e223-5bea-b56c-929cb42f712d', 'Acabados', 'Gris pizarra y arena', 'Material y uso', 3, (SELECT id FROM productos WHERE slug = 'piedra-cincelada-pu'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('6e8c5a6a-d6ac-56a6-9c73-b699d31d4d08', 'Sistema', 'Adhesivo de montaje', 'Instalación', 4, (SELECT id FROM productos WHERE slug = 'piedra-cincelada-pu'));

UPDATE productos SET descripcion = 'Plancha de bambú con aspecto de madera cálida.

- Veta natural de bambú en tonos cálidos
- Ligera y fácil de instalar
- Para muros y paneles de acento
- Acabados ámbar y natural' WHERE slug = 'plancha-bambu';
DELETE FROM especificaciones_producto WHERE producto_id = (SELECT id FROM productos WHERE slug = 'plancha-bambu');
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('7d6def36-4c52-570a-8f9f-b267d2e5e862', 'Material', 'Bambú', 'Material y uso', 0, (SELECT id FROM productos WHERE slug = 'plancha-bambu'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('1906e2c5-d751-52c8-b6f3-2e314256be67', 'Uso', 'Interior', 'Material y uso', 1, (SELECT id FROM productos WHERE slug = 'plancha-bambu'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('f84037c5-8496-5b50-8f92-38b3b92cf9b6', 'Se vende por', 'Metro cuadrado', 'Material y uso', 2, (SELECT id FROM productos WHERE slug = 'plancha-bambu'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('21153dd9-d1a9-51cf-825e-cbf99e96ed4d', 'Acabados', 'Ámbar y natural', 'Material y uso', 3, (SELECT id FROM productos WHERE slug = 'plancha-bambu'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('1ed5988f-3263-5e34-b271-634f76e9010e', 'Sistema', 'Adhesivo de montaje', 'Instalación', 4, (SELECT id FROM productos WHERE slug = 'plancha-bambu'));

UPDATE productos SET descripcion = 'Revestimiento WPC para fachadas y terrazas.

- Pensado para la intemperie: resiste sol y lluvia
- No requiere pintura ni barniz
- Se venden por metro cuadrado
- Acabados madera oscura y natural' WHERE slug = 'wallpanel-exterior';
DELETE FROM especificaciones_producto WHERE producto_id = (SELECT id FROM productos WHERE slug = 'wallpanel-exterior');
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('0f66279f-3d9a-5573-8229-4d8c76b47d3b', 'Material', 'WPC para exterior', 'Material y uso', 0, (SELECT id FROM productos WHERE slug = 'wallpanel-exterior'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('15f903ed-a7da-57b9-9862-277feed18af5', 'Uso', 'Exterior (fachadas y terrazas)', 'Material y uso', 1, (SELECT id FROM productos WHERE slug = 'wallpanel-exterior'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('89377833-8b71-56cd-a262-ff07dd6d3bc9', 'Se vende por', 'Metro cuadrado', 'Material y uso', 2, (SELECT id FROM productos WHERE slug = 'wallpanel-exterior'));
INSERT INTO especificaciones_producto (id, clave, valor, grupo, orden, producto_id) VALUES ('5d4ac110-63bb-5a6a-a41c-73ae0d092962', 'Sistema', 'Clips y estructura', 'Instalación', 3, (SELECT id FROM productos WHERE slug = 'wallpanel-exterior'));
