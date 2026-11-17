# Backend: estado

Resuelto en el backend nuevo (esquema reiniciado, sin seeders ni migraciones antiguas):

- Tablas y CRUD de administración para preguntas frecuentes, equipo, credenciales, testimonios, clientes y marcas,
  garantías, pasos del proceso y galería de proyectos (`/api/faqs`, `/api/equipo`, … `/api/proyecto-galeria`).
- Lectura pública de todo ello en `GET /api/publico/sitios/{clave}/confianza`.
- Proyectos con ficha técnica (`areaM2`, `plazoMeses`, `alcance`, `tipoObra`).
- Empresa con `anioFundacion`, `zonaCobertura` y `tiempoRespuesta`; sitio con URL del video del proceso y su póster;
  ISADECOR con `ofertas`.
- Formulario de contacto con `ubicacion`, `servicioInteres` y `consentimiento` (con fecha) como campos reales.

Pendiente:

- El correo y el mensaje del contacto siguen siendo obligatorios en el backend (el formulario envía un mensaje por defecto).
- Política de privacidad: falta el texto y el enlace desde el formulario.
- Los iconos de los servicios se eligen en el frontend por palabras del nombre; no hay campo `icono` en `servicios`.
- Vincular testimonios y galería a proyectos es por `slug` (texto), no por clave foránea.

## Desplegar desde cero (cuando toque)

1. Crear la base (Render/Supabase) y definir las variables de `.env.example` (`ADMIN_EMAIL`, `ADMIN_PASSWORD` de al
   menos 12 caracteres, `JWT_SECRET`, `CLOUDINARY_*`, `CORS_ALLOWED_ORIGINS`).
2. Arrancar el backend: Flyway crea el esquema (V1, V2 solo PostgreSQL, V3 con empresa, sitio e ISADECOR mínimos).
3. Cargar el contenido: con el panel de administración o `docs/landing/datos/cajamarca-demo.sql` solo como demo.
4. Frontend en Vercel apuntando al backend; revisar `environment.prod.ts`.
