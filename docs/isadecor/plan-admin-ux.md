# Plan: ordenar el admin (redundancias y UX)

Resultado de la auditoría del admin (30 pantallas a escritorio, 23 a 375 px, y lectura del código).
Este documento convierte esos hallazgos en fases ejecutables.

**Estado:** Fase 1 ✅ · Fase 2 ✅ · Fase 3 ✅ (3.3 opcional, no hecha) · Fase 4 ✅.

**Decisión tomada en la Fase 2:** el SEO deja de administrarse (ver «SEO automático» abajo). «Páginas y SEO» desaparece del admin.

**Correcciones a la auditoría descubiertas al ejecutar la Fase 1**
- **Proyectos a 375 px no desborda.** Fue un falso positivo de la medición: su tabla se desplaza dentro de su propia caja. El desborde real era solo el de **Empresa** (el bloque «Redes sociales» llegaba a 424 px en una pantalla de 360).
- **Unidades de negocio ya tenía un modal de confirmación** al desactivar; lo que faltaba era que fuera más exigente (ahora hay que escribir el nombre de la unidad).

Reglas de trabajo: solo local (sin deploy ni push), un commit por tema, sin `Co-Authored-By`,
tests del componente tocado, verificación en navegador a 1440 px y 375 px, y documentación al día.

## Hechos verificados (no son suposiciones)

| Hecho | Cómo se comprobó |
|---|---|
| El Home público de ISADECOR solo consume las tablas de `home-isadecor/*` (hero, cinta, promociones, campaña, tienda, fácil, servicios, reseñas, comunidad). | `GET /api/publico/sitios/isanorte/unidades/isadecor/home` y `features/isadecor/home/*` |
| Los **anuncios** (`/admin/anuncios`) solo los usa la cinta superior de la web de ISANORTE (`<app-announcement-ribbon destination="ISANORTE">`). La tienda ISADECOR no los consume. | grep de `announcement` fuera del admin |
| La tabla `anuncios` tiene **0 filas**. | consulta a `isanorte_main.anuncios` |
| `features/admin/isadecor-landing` (~1.500 líneas) no lo carga ninguna ruta; solo lo referencia `app.spec.ts`. La ruta `isadecor-landing` abre en realidad Anuncios. | `app.routes.ts` |
| Cada pantalla repite su propio encabezado (no hay componente compartido) y 6 verbos distintos para «crear». | grep de `*.html` |
| Solo `product-form` avisa de cambios sin guardar; 12 pantallas con panel (`app-drawer`) no. | grep de `confirmDiscard` |
| A 375 px solo **Proyectos** y **Empresa** desbordan horizontalmente. | medición con iframes |

## Fase 1 · Limpieza y coherencia (riesgo bajo) — ✅ hecha

Objetivo: que todo el admin hable igual y que no haya código muerto. Tamaño: **M**.

| # | Tarea | Dónde | Hecho cuando |
|---|---|---|---|
| 1.1 ✅ | Borrar `features/admin/isadecor-landing` y la ruta duplicada `isadecor-landing`; ajustar `app.spec.ts`. | `features/admin/isadecor-landing`, `app.routes.ts`, `app.spec.ts` | compila, tests verdes, sin referencias |
| 1.2 ✅ | **Títulos = nombre del menú.** «Administración de servicios»→«Servicios»; «Contenido público»→«Páginas y SEO»; «Gestión de Landing Page»→«Landing»; «ISANORTE Admin»→«Dashboard»; «Contenido del Home ISADECOR» (Anuncios)→se resuelve en 3.1. | cada `admin-*.html` | el `<h1>` coincide con la entrada del menú |
| 1.3 ✅ | **Rótulo (eyebrow) correcto por marca.** Las 9 pantallas de `home-isadecor/*` dicen «Contenido del sitio»: deben decir «Home ISADECOR». Las de `sitio/*` quedan en «Contenido ISANORTE». | `site-content.config.ts` | cada rótulo nombra su marca |
| 1.4 ✅ | **Componente `AdminPageHeader`** (rótulo, título, descripción, acciones) y migrar las pantallas. | `features/admin/shared/` | una sola fuente del encabezado; sin duplicados |
| 1.5 ✅ | **Un verbo de alta.** Regla: «Nuevo/Nueva + sustantivo» para entidades (producto, categoría, proyecto, servicio) y «Añadir + sustantivo» para elementos dentro de otra cosa (foto, testimonio, pregunta). Sustituir «Agregar» y «Crear contenido». | `*.html`, `site-content.config.ts` | ningún «Agregar» suelto |
| 1.6 ✅ | **Aviso de cambios sin guardar en los paneles.** Añadir al `Drawer` una entrada `dirty` y la confirmación al cerrar, y conectarla en las 12 pantallas. | `shared/components/drawer`, formularios | cerrar con cambios pide confirmar |
| 1.7 ✅ | **Móvil:** arreglar el desborde de Proyectos y Empresa; objetivos táctiles ≥ 40 px en Landing, Proyectos y Empresa. | `admin-projects`, `admin-company`, `admin-landing` | `scrollWidth ≤ 375` y sin botones < 40 px |
| 1.8 ✅ | **«Desactivar» de Unidades de negocio** (apaga toda la tienda): confirmación que exige escribir el nombre de la unidad. | `business-units` | no se desactiva con un solo clic |

## Fase 2 · Menú y duplicados con la vista previa — ✅ hecha

Objetivo: menos entradas, sin perder función. Tamaño: **M**.

| # | Tarea | Hecho cuando |
|---|---|---|
| 2.1 ✅ | **«Contenido de la web»**: una entrada del menú con una página de 6 tarjetas (Preguntas frecuentes, Equipo, Credenciales, Testimonios, Garantías, Pasos del proceso), cada una con su cantidad de elementos y botón. Las rutas actuales `/admin/sitio/*` siguen funcionando. | el menú de ISANORTE queda en: Landing, Proyectos, Servicios, Contenido de la web |
| 2.2 ✅ | **Quitar «Galería de proyectos»** del menú (ya está en la ficha de cada proyecto) y redirigir su ruta a Proyectos. | sin entrada ni ruta huérfana |
| 2.3 ✅ | **«Políticas»** pasa al grupo «Sitio y empresa». | menú actualizado |
| 2.4 ✅ | **Empresa:** la tarjeta «Filosofía» se sustituye por un enlace «Se edita en la vista previa de Nosotros». Identidad y contacto se quedan. | sin duplicado de misión, visión y valores |
| 2.5 ✅ | **Páginas y SEO:** la tabla de páginas editoriales queda en solo lectura con un enlace a la vista previa, salvo Contacto; SEO se queda. | un solo lugar para editar cada texto |
| 2.6 ✅ | **Configuración del sitio:** comprobar si `Branding` y `Colores` los usa la web; si no, ocultarlos. | decisión documentada |

**Cómo quedó (cambios respecto a lo planeado)**
- **2.5 → SEO automático y fuera «Páginas y SEO».** El cliente no pidió SEO ni lo entiende, así que no se administra: títulos fijos con palabras clave en el código, descripción que sigue al texto de la página, imagen de la página o una foto del sitio por defecto, siempre indexable. Los textos de Contacto y la foto de Nosotros pasaron a la vista previa.
- **2.4:** de Empresa se quitó el bloque de misión, visión y valores (se edita en la vista previa de Nosotros) pero **se conservó el resumen institucional**, que alimenta el pie de página y no se puede tocar en la vista previa.
- **2.6:** se ocultaron **solo los colores** (`colorPrimario` y `colorSecundario`: nada en la web los usa) y se conservan sus valores al guardar. El logo, el logo blanco y el favicon sí los usa la web y se quedan.

Unidades de negocio **se deja como está** (decisión ya tomada), salvo 1.8.

## Fase 3 · Home de ISADECOR y Anuncios (riesgo medio, la más grande)

> **3.1 se resolvió quitando Anuncios por completo** (en lugar de simplificarlo): se eliminó el panel lateral público, su pantalla del admin y el servicio y modelos del frontend. El backend y la tabla `anuncios` (vacía) no se tocaron. Motivo: el cliente no pidió anuncios y el flujo del admin creaba por defecto una ubicación que el panel nunca leía.

Tamaño: **L**. Se hace después de las fases 1 y 2.

| # | Tarea | Hecho cuando |
|---|---|---|
| 3.1 ✅ | **Anuncios:** como la tienda no los consume y la tabla está vacía, dejarlo solo para la **cinta superior de ISANORTE**: título «Cinta de anuncios», destino fijo ISANORTE, **con entrada en el menú** (grupo «Web»), y quitar de la interfaz las pestañas de ISADECOR (Promociones, Anuncios, Productos destacados, Categorías superiores). El backend no se toca. | una sola cinta administrable, sin duplicados con `home-isadecor/*` |
| 3.2 ✅ | **Una pantalla «Home de ISADECOR»** con secciones plegables que reutilizan los editores actuales (Hero, Cinta de avisos, Promociones, Campaña, Bloque de servicio + puntos, Secciones de productos, Reseñas, Videos de redes). Las 9 rutas antiguas redirigen al apartado correspondiente. | el menú de ISADECOR Home pasa de 9 entradas a 1 |
| 3.3 | *(Opcional, después)* Vista previa editable del Home de ISADECOR, como la de ISANORTE. Es un proyecto aparte. | — |

## Fase 4 · Dashboard útil (riesgo bajo) — ✅ hecha

Tamaño: **S–M**.

- Sustituir los contadores de volumen por **pendientes de atender**: cotizaciones nuevas, pedidos por gestionar, productos agotados, proyectos sin foto, servicios desactivados.
- «Accesos rápidos» con lo que realmente se usa (Landing, Productos, Cotizaciones, Pedidos).
- Revisar primero qué endpoints ya entregan esos conteos; si falta alguno, se añade al backend.

## Fase 5 · Cierre

- Tests de lo tocado, `npm run lint:tokens` y suite del frontend.
- Pasada en navegador a 1440 px y 375 px de las pantallas modificadas.
- Actualizar `docs/isadecor/admin-panel.md`.
- Commits por tema: limpieza · coherencia · menú · Home ISADECOR · dashboard · docs.

## Orden y dependencias

```
Fase 1 ──► Fase 2 ──► Fase 3
   │                    
   └──────► Fase 4 (independiente; puede ir en cualquier momento)
```

- 1.4 (encabezado compartido) conviene antes que 1.2, 1.3 y 1.5, porque cambia las mismas plantillas.
- 3.2 depende de 1.3 y 1.5 (rótulos y verbos ya unificados).

## Riesgos

- **Pantallas que se vuelven redirecciones:** conservar las rutas antiguas con `redirectTo` para no romper enlaces guardados.
- **Menos entradas, más clics:** el hub de «Contenido de la web» debe mostrar cantidades y accesos directos para compensarlo.
- **Anuncios:** si algún día ISADECOR vuelve a necesitar anuncios propios, el backend y su API siguen intactos.
- **Tests existentes que fallan de antes** (Anuncios API, layout público, admin de proyectos, servicios-form, site-config-form): no se mezclan con este trabajo; se anotan si se tocan.

## Decisiones pendientes

1. ¿Aceptas la regla de verbos de **1.5** («Nuevo/Nueva» para entidades, «Añadir» para elementos internos)?
2. ¿**3.1** tal cual (Anuncios solo para la cinta de ISANORTE) o prefieres quitarlo del todo?
3. ¿**2.5** (páginas editoriales solo lectura) o se mantiene la tabla editable?
4. ¿Se aborda **3.3** (vista previa de ISADECOR) más adelante?
