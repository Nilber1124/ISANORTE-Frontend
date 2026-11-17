# Integración con el backend y plan para reiniciar la base de datos

Basado en la lectura del backend (solo lectura, sin cambios): migraciones Flyway V1 a V14, entidades, controladores y la configuración de Render. No pude ver la base de datos desplegada, así que lo que sigue es lo que dice el código, no el estado real de los datos.

## 1. ¿Está todo integrado con el backend?

**No del todo, y es intencional por ahora.**

Ya lee de la API (contenido administrable): Home (secciones, hero, servicios, proyectos, unidad ISADECOR), páginas Nosotros, Servicios, Proyectos y Contacto, detalle de proyecto, datos del sitio (empresa, redes, contacto, SEO), anuncios y el envío del formulario de contacto.

Sigue **local en el frontend** (ver también `BACKEND-PENDIENTE.md`):

| Qué | Dónde está hoy |
|---|---|
| Pasos del proceso, puntos de confianza del hero, líneas de oferta de ISADECOR | `home-landing.data.ts` |
| Los 8 servicios del selector del formulario | `home-landing.data.ts` |
| Icono de cada servicio | Mapa por palabras del nombre |
| Video 3D del proceso y su póster | `public/media/home/` |
| Servicios y unidad ISADECOR de respaldo (si la API falla) | `home-services-fallback.ts`, `home-business-unit-fallback.ts` (con imágenes de Unsplash y locales) |
| Ubicación, servicio de interés y consentimiento del formulario | Se envían dentro del mensaje; el consentimiento no se guarda |
| Tiempo de respuesta («menos de 24 horas»), mensajes de WhatsApp por página | Código |
| Botón secundario del hero | Viene de la BD y apunta al mismo lugar que el principal |

El contrato del formulario (`SolicitudContactoCreateRequest`) solo tiene nombre, correo, teléfono, empresa y mensaje, con correo y mensaje obligatorios.

## 2. ¿Conviene borrar tablas, columnas o datos?

- **Tablas y columnas: no las borres todavía.** Hay 41 tablas. Las del sitio institucional (contenidos, secciones, servicios, proyectos, empresa, redes, SEO, anuncios, solicitudes de contacto) las usan el frontend y el panel admin. Las de la tienda ISADECOR (productos, categorías, catálogos, cotizaciones, pedidos, clientes, carrito, reseñas, direcciones) las usan las páginas de ISADECOR. `configuraciones_calculo` y `resultados_calculo` pertenecen al cálculo de productos y no están claras; antes de quitarlas conviene confirmar con quien las creó. Quitar estructura sin necesidad es lo que más riesgo da.
- **Datos: sí, límpialos.** Es donde está el problema real: contenido de Ecuador y proyectos de demostración.

## 3. Si borras toda la BD y empiezas de cero

Esto es lo que pasaría, según el código:

1. **El contenido de demostración vuelve.** La migración `V4__contenido_inicial_isanorte.sql` inserta textos de Ecuador («constructora de referencia en Ecuador»), los proyectos «Residencia Aura», «Edificio Tech-Corporate» y «Villa Lomas Alta», servicios, hero, secciones, SEO y la unidad ISADECOR. Al recrear la base, Flyway la ejecuta de nuevo. **Borrar la BD no limpia el contenido.**
2. **Flyway no se puede limpiar desde la aplicación:** `spring.flyway.clean-disabled=true`. Reiniciar significa borrar el esquema a mano (consola de Render o `psql`), con copia de seguridad antes. Es irreversible.
3. **El administrador inicial** se recrea al arrancar si siguen definidas las variables `ADMIN_EMAIL` y `ADMIN_PASSWORD` (contraseña de al menos 12 caracteres). Si no están, nadie podrá entrar al panel.
4. **Cloudinary no se borra**, pero las filas que apuntan a las imágenes sí: quedarán archivos huérfanos y habrá que volver a enlazarlos.
5. **Hay otra sesión cargando contenido demo** (cambios sin subir en `DemoProductSeeder` y `demo-manifest.json`). Reiniciar la BD sin coordinarlo perdería ese trabajo o chocaría con sus semillas (`SEED_DEMO_DATA`, `SEED_DEMO_DATA_CLEAN`).
6. Si la base es el **Postgres gratuito de Render**, conviene revisar su fecha de vencimiento antes de invertir tiempo cargando datos.

## 4. Recomendación: no reiniciar la BD; limpiar el contenido por migración

1. **Respaldo** con `pg_dump` antes de tocar nada.
2. **Nueva migración V15** (no editar V4: cambiaría su checksum y rompería bases existentes) que:
   - elimine los proyectos de demostración y sus imágenes y relaciones;
   - reemplace los textos con Ecuador por textos neutros o de Perú;
   - deje servicios, hero y secciones con contenido mínimo y sin cifras falsas.
3. **Cargar los datos reales poco a poco**, en este orden:
   1. Empresa: nombre, ciudad, dirección, teléfonos (+51), WhatsApp, correos, redes.
   2. Configuración del sitio: logo, colores y textos del pie de página.
   3. Los 8 servicios reales (con resumen, descripción, beneficios e imagen real).
   4. Hero y secciones del Home (título concreto, botones correctos).
   5. Página Nosotros (texto de `CONTENIDO-NOSOTROS.md`) y cifras verificables.
   6. Proyectos reales con fotos, ubicación y fecha.
   7. Unidad ISADECOR, catálogo y productos.
   8. Anuncios, si los usan.
4. **Revisar la página** tras cada paso; el frontend ya está preparado para mostrar poco contenido sin romperse (secciones vacías se ocultan).
5. **Estructura nueva solo cuando haga falta**, con su propia migración: campos del formulario (ubicación, servicio, consentimiento), datos de proyecto (m², plazo), equipo, testimonios, credenciales, preguntas frecuentes.

Si, aun así, prefieres reiniciar todo, hazlo en este orden: respaldo, coordinar con la otra sesión, crear la migración V15 (o reemplazar V4 en una base nueva), borrar el esquema, arrancar con `ADMIN_EMAIL` y `ADMIN_PASSWORD` definidos y cargar los datos en el orden de arriba.
