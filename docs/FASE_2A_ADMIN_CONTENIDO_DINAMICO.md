# Fase 2A — Administración de contenido dinámico

El frontend administrativo ya consume los contratos REST de la Fase 1B documentados en `docs/openapi.yaml`. La arquitectura se mantiene como `Component → Facade → ApiService → Backend`, con estado mediante Angular Signals y carga de datos administrativos después de la hidratación.

## Capacidades administrativas

- Landing: `etiqueta`, `imagenAlt`, orden, visibilidad, tipo `UNIDAD_NEGOCIO`, escenas Hero y acciones/CTA.
- Servicios: `etiqueta`, `imagenAlt` y beneficios ordenados.
- Proyectos: orden y texto alternativo de cada imagen.
- Unidades de negocio: estado destacado, `imagenAlt` y recursos URL de tipo fondo, editorial o catálogo.
- Empresa: estadísticas ordenadas con valor, prefijo, sufijo, etiqueta y estado.
- Configuración: clave pública estable del sitio, editable explícitamente.
- Contenido (`/admin/contenido`): páginas editoriales y SEO. La identidad sitio/página o sitio/tipo/unidad queda bloqueada al editar; los tags conservan orden explícito.
- Contacto (`/admin/contacto`): bandeja, filtro por estado, detalle completo y cambio de estado. No permite eliminar ni enviar correos.

Los recursos hijos se crean, actualizan y eliminan en sus endpoints anidados. La interfaz comunica los límites de acciones activas para `HERO` (2) y `CTA` (1), exige `alt` para una imagen editorial y muestra estados vacíos sin generar contenido de demostración.

## Límites de esta fase

Admin ya gestiona contenido dinámico, pero la web pública todavía consume contenido estático. No se consumen los endpoints `/api/publico/**`, no se modificaron Home, páginas públicas, Navbar, Footer ni ISADECOR, y no se añadió autenticación, autorización, carga de archivos o envío de correo.

La clasificación público/administrativo de OpenAPI expresa intención futura; Spring Security, JWT, roles y guards siguen pendientes.
