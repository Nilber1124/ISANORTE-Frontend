# Prompt 4 · Admin genérico del contenido del Home de ISADECOR

> Pega primero el "Contexto común" de `00-LEEME.md`. Requiere el Prompt 1.

## Objetivo
Pantallas de administración para las tablas nuevas, reutilizando el admin genérico de ISANORTE.

## Pasos
1. Lee `src/app/features/admin/site-content/` (`admin-site-content.ts`, `site-content.config.ts`, spec) y cómo se registran las entidades de ISANORTE. Reutiliza ese mecanismo: **no crees una pantalla nueva por entidad** si el genérico lo permite, solo configuración.
2. Registra: hero, beneficios, ambientes, obras, calculadora, y los campos nuevos de producto (`modalidad`, `unidad_venta`, `es_nuevo`) y de categoría (`destacada_home`, `orden_home`).
3. Los tipos y campos deben coincidir exactamente con el contrato de `docs/openapi.yaml` actualizado en el Prompt 1.
4. Retirar del admin "Contenido del Home ISADECOR" (`announcements`, `isadecor-landing`) las ubicaciones obsoletas (CINTA_HOME, PROMOCION_*, ANUNCIOS_HOME, CATEGORIA_SUPERIOR), sin borrar el módulo global de anuncios.
5. Subida de imágenes: usa el componente/servicio que ya usa ISANORTE.

## Verificación
`npm run build` y `npm test` sin errores; crear, editar y desactivar un registro de cada entidad contra el backend local.

## No hagas
Commit/push. No cambies componentes compartidos sin revisar a todos sus consumidores.
