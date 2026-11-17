# Datos de demostración: ISANORTE, Cajamarca (Perú)

`cajamarca-demo.sql` carga el contenido del sitio para verlo «terminado» en local.
**Todo es inventado**: teléfonos, correos, RUC, dirección, cifras, equipo, credenciales, testimonios, clientes y
proyectos. Reemplázalo con datos reales desde el panel de administración antes de publicar.

## Cargarlo (local)

1. Backend con un esquema propio (no toca otras bases):
   `SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/isanorte_db?currentSchema=isanorte_main`
   `SPRING_FLYWAY_SCHEMAS=isanorte_main` y `SPRING_FLYWAY_DEFAULT_SCHEMA=isanorte_main`; luego `./mvnw spring-boot:run`.
2. Con el esquema creado por Flyway:
   `(echo "set search_path=isanorte_main;"; cat cajamarca-demo.sql) | psql -v ON_ERROR_STOP=1 ...`
3. Frontend: `npm start` (proxy a `localhost:8080`).

El script es repetible: borra el contenido del sitio (servicios, proyectos, equipo, FAQ, páginas, secciones…) y lo
vuelve a cargar. No toca administradores, productos ISADECOR, cotizaciones ni pedidos.

## Imágenes

- El video del proceso y su póster están en Cloudinary (`isanorte-cajamarca/video`).
- Varias imágenes (hero, 4 proyectos, ISADECOR, cierre) son **respaldo**: generadas antes con FLUX y
  de temática genérica. Los 8 servicios tienen imagen propia (generadas con el generador de imágenes de Figma y subidas a `isanorte-cajamarca/servicios`). Quedan sin imagen: 1 proyecto (habilitación urbana usa una imagen de respaldo), la galería antes/durante/después.
- Las 4 fotos del equipo son retratos de demostración generados con IA (en `isanorte-cajamarca/equipo`); son personas ficticias. Para reemplazarlas por retratos generados, borra esas claves de `manifiesto.json` y los archivos de `temporales/`, y ejecuta `imagenes.py`.
- `herramientas/imagenes.py` genera con FLUX las imágenes específicas de Cajamarca y las sube a Cloudinary
  (reanudable); `herramientas/build_sql.py` regenera este SQL usando `manifiesto.json`. La generación se detuvo
  porque se agotó la cuota diaria gratuita de Cloudflare Workers AI (se renueva a las 00:00 UTC).
  Ambos scripts esperan la carpeta `demo-cajamarca/` junto a los repositorios.
