---
name: dynamic-content
description: Design or implement backend-managed commercial content for ISANORTE and ISADECOR while keeping Angular responsible for presentation. Use for landing sections, company data, services, projects, products, CTAs, navigation, or admin-editable copy.
---

# Dynamic Content

## Cuándo utilizarla

Úsala cuando una pantalla muestre contenido comercial que deba ser editable desde backend: landing de ISANORTE, Nosotros, Servicios, Proyectos, ISADECOR, CTA, datos corporativos, navegación o futuras pantallas administrativas de contenido.

## Objetivo

Separar la estructura visual del contenido editable: Angular controla cómo se presenta y Spring Boot/PostgreSQL controla qué contenido se presenta, sin inventar un contrato que el backend aún no soporta.

## Procedimiento

1. Lee `AGENTS.md`, la feature y `docs/openapi.yaml` en los dominios relacionados.
2. Identifica el estado actual real:
   - Home y About de ISANORTE contienen contenido estático sustancial;
   - navbar y footer contienen datos estáticos;
   - Services, Projects, Contact e ISADECOR Home siguen siendo placeholders.
3. Clasifica cada valor:
   - estructura/presentación estable de Angular;
   - contenido editorial administrable;
   - dato operacional del backend;
   - fallback temporal explícito.
4. Reutiliza únicamente contratos documentados, como configuración del sitio, empresa, secciones landing, servicios, proyectos, unidades de negocio, categorías o productos, cuando cubran el caso real.
5. Si existe endpoint suficiente, aplica `Feature → Facade → ApiService → Backend` y modela exactamente Request/Response/enums.
6. En el facade normaliza solo necesidades de presentación justificadas: orden, visibilidad, selección y estado derivado.
7. Diseña el template para manejar `visible`, `orden`, campos `null`, imagen ausente, sección inexistente y colección vacía sin romper layout ni accesibilidad.
8. Define fallbacks razonables y localizados. Distingue un fallback temporal de contenido empresarial definitivo.
9. Conserva contenido principal en el HTML SSR/prerenderizado y evita que la animación determine si se renderiza.
10. Si el contrato no cubre el contenido, documenta campos u operación faltantes y no implementes un modelo ficticio.

## Reglas

- Evitar fijar permanentemente en el template textos empresariales que el administrador deberá editar.
- Preferir acceso tipado como `content.hero.title` o colecciones de secciones documentadas frente a literales dispersos.
- No guardar HTML completo en base de datos como atajo. Un campo textual llamado `contenido` no autoriza por sí solo a renderizar HTML sin sanitización y contrato explícito.
- No inventar bloques, enums, IDs, slugs, estados de publicación ni relaciones.
- No ocultar una ausencia de datos con contenido definitivo no aprobado.
- Respetar `visible` y `orden`; usar un orden estable y defensivo cuando el contrato lo permita.
- Una imagen faltante no debe producir icono roto ni perder información equivalente; definir `alt` según su función.
- Una colección vacía debe mostrar EmptyState, ocultar la sección o usar fallback según la intención de producto, no por accidente.
- Mantener separados el modelo del contrato y cualquier view model solo cuando la transformación aporte valor real.
- No cargar desde API en cada componente hijo; coordinar el contenido de pantalla desde su facade cuando la complejidad lo justifique.

## Checklist final

- [ ] Está claro qué controla Angular y qué controla backend.
- [ ] El contrato utilizado existe en OpenAPI y coincide con sus tipos reales.
- [ ] Se manejan visible, orden, null, imágenes ausentes, secciones faltantes y colecciones vacías.
- [ ] Los fallbacks son explícitos, accesibles y no se confunden con contenido definitivo.
- [ ] No se persiste ni renderiza HTML arbitrario.
- [ ] La UI conserva el Design System y funciona con SSR.
- [ ] La limitación se documentó si el backend todavía no soporta el caso.
- [ ] `npm run build` pasa cuando hubo cambios de aplicación.
