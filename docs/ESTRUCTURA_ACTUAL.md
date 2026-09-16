# Estructura actual del frontend ISANORTE

**Fecha de revisión:** 16 de septiembre de 2026
**Fuente de verdad:** código presente en este repositorio durante la revisión.

## Propósito del documento

Esta guía explica cómo está organizado el frontend, dónde debe trabajar cada integrante y cómo debe crecer el proyecto sin introducir capas innecesarias. Está pensada tanto para personas con experiencia como para quienes están empezando con Angular.

Cuando este documento, `AGENTS.md`, una Skill o cualquier otra guía contradiga el código, primero debe verificarse el código actual. No se debe completar una contradicción inventando archivos, endpoints o funcionalidades.

## Información general

El repositorio contiene una aplicación Angular que reúne dos experiencias públicas:

- **ISANORTE:** sitio corporativo de arquitectura, construcción, servicios y proyectos.
- **ISADECOR:** experiencia comercial prevista para catálogo y productos. Actualmente solo tiene una ruta y una página placeholder.
- **ADMIN:** será el área de administración de contenido y recursos. No existe todavía en `src/app/`.

### Stack detectado

| Tecnología | Estado y versión instalada |
| --- | --- |
| Angular | 22.1.6; componentes standalone y sin NgModules |
| Angular CLI / build | 22.1.7 |
| TypeScript | 6.0.3 |
| RxJS | 7.8.2 |
| Tailwind CSS | 4.3.3, configuración CSS-first mediante PostCSS |
| GSAP | 3.15.0 |
| Express | 5.2.1 para el servidor SSR |
| Vitest | 4.1.11 mediante `@angular/build:unit-test` |
| Gestor de paquetes | npm 12.0.2 declarado en `package.json` |

Las versiones declaradas en `package.json` permiten actualizaciones compatibles, por ejemplo Angular `^22.0.0` y TypeScript `~6.0.2`; la tabla muestra las versiones realmente instaladas al revisar el proyecto.

### Estado general

- La separación por features, layouts, código compartido e infraestructura global ya está implementada.
- La aplicación usa componentes standalone y control flow moderno (`@if`, `@for`, `@switch`).
- Angular Signals ya se usa para estado local, estado global de tema e inputs derivados.
- SSR, prerender de rutas e hidratación están configurados.
- Home y Nosotros de ISANORTE tienen UI real, pero su contenido comercial continúa definido en TypeScript/HTML.
- Servicios, Proyectos, Contacto e ISADECOR Home son placeholders.
- La capa `data/` ya contiene contratos TypeScript y ApiServices para los 10 recursos reales del backend.
- `HttpClient` está registrado con `provideHttpClient(withFetch())`, pero ninguna pantalla ni facade consume todavía los ApiServices.
- Existe un contrato backend estático en `docs/openapi.yaml`, contrastado con los controllers, DTO y enums actuales de Spring Boot.

## Arquitectura del frontend

La arquitectura adoptada es:

```text
Feature-Based Architecture
        +
Facade Pattern
        +
API Service Layer
        +
Angular Signals
```

El flujo objetivo para una pantalla que consuma datos es:

```text
Component
   ↓
Facade
   ↓
ApiService
   ↓
Spring Boot
   ↓
PostgreSQL
```

PostgreSQL pertenece a la persistencia del backend; este repositorio frontend no contiene su configuración.

### Implementado actualmente

```text
Ruta
  ↓
Componente de feature
  ↓
Datos estáticos tipados o Signal local
  ↓
Template
```

La organización Feature-Based, `core/`, `shared/`, `layouts/` y `data/` ya existe. Signals también están en uso. Los ApiServices y modelos están preparados, pero el tramo Component → Facade todavía no se implementa porque ninguna pantalla se conectó en esta etapa.

### Component

Un componente se encarga principalmente de:

- mostrar información;
- manejar eventos visuales;
- definir bindings con el template;
- recibir interacción del usuario;
- llamar operaciones simples del facade cuando exista.

No debe inyectar `HttpClient` ni coordinar por sí mismo loading, errores y varias peticiones.

### Facade

Un facade reúne la lógica y el estado propios de una pantalla o feature:

- `signal()` y `computed()`;
- loading y errores;
- filtros y transformaciones;
- formularios con lógica relevante;
- coordinación de uno o varios servicios;
- acciones de la funcionalidad.

No todos los componentes necesitan facade. Actualmente el proyecto no contiene ninguno.

### ApiService

Un ApiService encapsula la comunicación HTTP:

- `HttpClient`;
- URLs y parámetros;
- `GET`, `POST`, `PUT` y `PATCH` documentados;
- tipos Request y Response del contrato.

No contiene decisiones visuales ni estado de una pantalla. Actualmente existe un ApiService por cada uno de los 10 recursos documentados del backend.

### Models

Los modelos API representan el contrato con Spring Boot:

- `Request`;
- `UpdateRequest`;
- `Response`;
- enums;
- tipos compartidos por el contrato.

Los contratos viven bajo `data/models/`, separados por dominio, request, update request, response y enum cuando corresponde. Las interfaces de Home, About, Navbar, Footer y componentes shared siguen siendo tipos locales de presentación, no DTO del backend.

## Matriz de responsabilidades de la arquitectura

Esta matriz describe el reparto objetivo cuando una feature integre la capa preparada. Actualmente existen ApiServices y modelos API, pero no facades ni pantallas consumidoras.

| Responsabilidad | Component | Facade | ApiService | Models | Backend |
| --- | :---: | :---: | :---: | :---: | :---: |
| Mostrar información y enlazar el template | ✅ | ❌ | ❌ | ❌ | ❌ |
| Recibir clicks, inputs y otros eventos de UI | ✅ | ❌ | ❌ | ❌ | ❌ |
| Mantener estado visual local y pequeño | ✅ | ❌ | ❌ | ❌ | ❌ |
| Solicitar una acción simple al facade | ✅ | ❌ | ❌ | ❌ | ❌ |
| Mantener estado relevante de la pantalla con Signals | ❌ | ✅ | ❌ | ❌ | ❌ |
| Calcular estado derivado con `computed()` | ❌ | ✅ | ❌ | ❌ | ❌ |
| Gestionar loading y error de la pantalla | ❌ | ✅ | ❌ | ❌ | ❌ |
| Aplicar filtros y transformaciones para la vista | ❌ | ✅ | ❌ | ❌ | ❌ |
| Coordinar uno o varios servicios | ❌ | ✅ | ❌ | ❌ | ❌ |
| Ejecutar una petición con `HttpClient` | ❌ | ❌ | ✅ | ❌ | ❌ |
| Construir la URL, parámetros y verbo HTTP documentados | ❌ | ❌ | ✅ | ❌ | ❌ |
| Representar Request, Response, UpdateRequest y enums | ❌ | ❌ | ❌ | ✅ | ❌ |
| Definir e implementar el endpoint real | ❌ | ❌ | ❌ | ❌ | ✅ |
| Validar reglas de negocio críticas | ❌ | ❌ | ❌ | ❌ | ✅ |
| Autorizar y proteger operaciones | ❌ | ❌ | ❌ | ❌ | ✅ |
| Persistir información | ❌ | ❌ | ❌ | ❌ | ✅ |

`❌` significa “no es responsable de esa tarea”; una capa sí puede solicitar una operación a la siguiente. Por ejemplo, el Component solicita al Facade que cargue, pero no realiza la petición.

Hay dos precisiones importantes:

- Un estado visual pequeño puede quedarse en el Component. El acordeón actual de About es un ejemplo real.
- El ApiService referencia una URL documentada, pero no inventa ni crea el endpoint: el contrato y su implementación pertenecen al backend.

### Decisiones rápidas

Los nombres de catálogo y facade son conceptuales; `ProductApiService` y sus modelos sí existen, pero todavía no tienen consumidores.

| Necesidad | Responsable y ubicación |
| --- | --- |
| “Necesito cargar productos” | `ProductApiService` ejecuta la petición documentada; `CatalogFacade` decide cuándo cargarla. |
| “Necesito guardar los productos cargados en estado” | `CatalogFacade`, mediante un Signal. |
| “Necesito mostrar esos productos” | Componente `Catalog` y su template dentro de `features/isadecor/catalog/`. |
| “Necesito validar una regla comercial” | Spring Boot; Angular puede mostrar feedback, pero no sustituir la validación backend. |
| “Necesito representar la respuesta de productos” | Modelo verificado bajo `data/models/product/`. |
| “Necesito reutilizar un botón” | `shared/components/button/`; el componente `Button` ya existe. |
| “Necesito un ProductCard solo para el catálogo” | `features/isadecor/catalog/components/product-card/`. |
| “Necesito Navbar o Footer” | `layouts/`; actualmente pertenecen a `PublicLayout`. |
| “Necesito estado global de tema” | `core/services/`; actualmente lo gestiona `ThemeService`. |

La regla práctica es seguir la responsabilidad, no el nombre del archivo: UI en Component, estado de pantalla en Facade, transporte HTTP en ApiService, contrato TypeScript en Models y negocio/persistencia en Backend.

## Árbol real de `src/app/`

El siguiente árbol refleja únicamente carpetas y archivos existentes:

```text
src/app/
├── app.config.server.ts
├── app.config.ts
├── app.css
├── app.html
├── app.routes.server.ts
├── app.routes.ts
├── app.spec.ts
├── app.ts
├── core/
│   ├── config/
│   │   └── api.config.ts
│   └── services/
│       └── theme.service.ts
├── data/
│   ├── models/
│   │   ├── administrator/
│   │   ├── business-unit/
│   │   ├── category/
│   │   ├── common/
│   │   ├── company/
│   │   ├── landing-section/
│   │   ├── product/
│   │   ├── project/
│   │   ├── quote/
│   │   ├── service/
│   │   └── site-config/
│   └── services/
│       ├── administrator-api.service.ts
│       ├── business-unit-api.service.ts
│       ├── category-api.service.ts
│       ├── company-api.service.ts
│       ├── landing-section-api.service.ts
│       ├── product-api.service.ts
│       ├── project-api.service.ts
│       ├── quote-api.service.ts
│       ├── service-api.service.ts
│       └── site-config-api.service.ts
├── features/
│   ├── isadecor/
│   │   └── home/
│   │       ├── home.css
│   │       ├── home.html
│   │       └── home.ts
│   └── isanorte/
│       ├── about/
│       │   ├── about.css
│       │   ├── about.html
│       │   └── about.ts
│       ├── contact/
│       │   ├── contact.css
│       │   ├── contact.html
│       │   └── contact.ts
│       ├── home/
│       │   ├── home.css
│       │   ├── home.html
│       │   └── home.ts
│       ├── projects/
│       │   ├── projects.css
│       │   ├── projects.html
│       │   └── projects.ts
│       └── services/
│           ├── services.css
│           ├── services.html
│           └── services.ts
├── layouts/
│   └── public-layout/
│       ├── footer/
│       │   ├── footer.html
│       │   └── footer.ts
│       ├── navbar/
│       │   ├── navbar.html
│       │   └── navbar.ts
│       ├── public-layout.css
│       ├── public-layout.html
│       └── public-layout.ts
└── shared/
    └── components/
        ├── alert/
        ├── badge/
        ├── button/
        ├── card/
        ├── carousel/
        ├── cinematic-tour/
        ├── empty-state/
        ├── input-field/
        ├── loading/
        ├── modal/
        ├── reveal-stagger/
        ├── section-title/
        ├── select-field/
        └── textarea-field/
```

No existen actualmente `src/app/features/admin/`, guards, interceptors ni facades. La capa HTTP existe, pero aún no tiene consumidores en features.

## `core/`

`core/` contiene infraestructura global que puede ser usada por toda la aplicación. No debe acumular lógica propia de una pantalla.

### Contenido actual

`core/services/theme.service.ts` contiene `ThemeService`:

- mantiene el tema con un Signal privado;
- expone `theme` como Signal de solo lectura;
- permite seleccionar, alternar y aplicar light/dark;
- usa `DOCUMENT`, `Renderer2` e `isPlatformBrowser()` para no romper SSR;
- no persiste todavía la preferencia;
- actualmente no está inyectado por ninguna pantalla.

`core/config/api.config.ts` declara el token inyectable `API_BASE_URL`. Su valor predeterminado es el servidor de desarrollo documentado por OpenAPI (`http://localhost:8080`) y puede sobrescribirse con un provider por entorno sin modificar los ApiServices.

No existen guards, interceptors ni helpers HTTP adicionales dentro de `core/`.

## `shared/`

`shared/` contiene UI reutilizable sin conocimiento de ISANORTE, ISADECOR, productos o proyectos. Un componente shared recibe datos y emite eventos; no decide reglas de negocio.

### Componentes compartidos actuales

| Componente | Propósito |
| --- | --- |
| `Alert` | Feedback neutral, informativo, exitoso, de advertencia o error; puede emitir cierre. |
| `Badge` | Etiqueta corta para categoría o estado. |
| `Button` | Botón o enlace con variantes, tamaños, loading y disabled. |
| `Card` | Contenedor genérico estático o enlazable mediante proyección de contenido. |
| `Carousel` | Carrusel reutilizable en variantes coverflow y marquee, animado con GSAP. |
| `CinematicTour` | Secuencia visual de imágenes arquitectónicas para fondos/hero. |
| `EmptyState` | Comunica ausencia de datos y permite proyectar una acción. |
| `InputField` | Input accesible con label, ayuda, error y loading. |
| `Loading` | Indicador spinner o dots para regiones en espera. |
| `Modal` | Diálogo accesible con control de foco, cierre y loading. |
| `RevealStagger` | Orquesta apariciones escalonadas del contenido proyectado. |
| `SectionTitle` | Encabezado reutilizable con eyebrow, título y descripción. |
| `SelectField` | Select nativo tipado con estados de ayuda, error y loading. |
| `TextareaField` | Campo multilínea accesible con ayuda, error y loading. |

Hay 14 componentes compartidos. Todos son standalone y usan `ChangeDetectionStrategy.OnPush`. Algunos incluyen un README propio con su API y ejemplos.

## `data/`

`data/` contiene la capa de transporte preparada para futuras facades:

```text
data/
├── models/      # Contratos TypeScript derivados de OpenAPI, DTO y enums reales
└── services/    # Un ApiService con HttpClient por recurso backend
```

Los dominios modelados son administradores, categorías, configuración del sitio, cotizaciones, empresa, productos, proyectos, secciones landing, servicios y unidades de negocio. Los tipos comunes centralizan `ActivoRequest`, errores y resúmenes reutilizados por el contrato.

No hay wrappers inventados, carpetas vacías, estado de UI ni mensajes visuales en esta capa. Los ApiServices conservan los errores HTTP para que los futuros facades decidan su presentación.

## `layouts/`

Un layout define la estructura visual que rodea a varias páginas. Actualmente existe un único layout público:

```text
PublicLayout
├── Navbar
├── RouterOutlet  ← aquí Angular muestra la página activa
└── Footer
```

`PublicLayout` envuelve todas las rutas actuales, incluidas ISANORTE e ISADECOR. Navbar y Footer contienen todavía navegación, contacto y copy definidos como objetos estáticos en sus componentes.

No existen layouts separados para ISADECOR ni Admin.

## `features/`

Una feature representa una pantalla o funcionalidad que usa una persona. El proyecto separa las experiencias por área de negocio.

### Resumen real

| Feature | Página | Facade | ApiService | Estado |
| --- | --- | --- | --- | --- |
| `isanorte/home` | Home corporativa | No | No | UI completa con contenido estático y componentes compartidos |
| `isanorte/about` | Nosotros | No | No | UI desarrollada, contenido estático y acordeón con Signal local |
| `isanorte/services` | Servicios | No | No | Placeholder |
| `isanorte/projects` | Proyectos | No | No | Placeholder |
| `isanorte/contact` | Contacto | No | No | Placeholder |
| `isadecor/home` | Landing ISADECOR | No | No | Placeholder |

No hay componentes internos bajo `components/` dentro de estas features; Home y About componen directamente UI compartida.

## ¿Cuándo necesita un Feature un Facade?

No se crea un facade automáticamente para cada componente.

Un feature probablemente necesita facade cuando tiene una o varias de estas responsabilidades:

- peticiones API;
- loading y errores;
- filtros o búsqueda;
- formularios complejos;
- coordinación entre varios ApiServices;
- colecciones que cambian durante la interacción;
- estado relevante para toda la pantalla;
- transformación de respuestas para la vista.

Ejemplos orientativos:

| Caso | ¿Facade? | Motivo |
| --- | --- | --- |
| Catálogo conectado al backend | Sí | Carga productos, filtros, empty/error/loading. |
| Administración de productos | Sí | Coordina listado, edición, estados y errores. |
| Detalle de producto | Sí | Carga por slug y maneja estados de la pantalla. |
| Button | No | Es una primitiva visual reutilizable. |
| Card | No | Solo presenta contenido. |
| Hero puramente visual | No | No coordina datos ni lógica relevante. |
| Acordeón actual de About | No | Un Signal local resuelve su estado sencillo. |

No se debe crear `BaseFacade`, un facade genérico ni una capa adicional solo por simetría.

## Ejemplo: flujo de una funcionalidad

Actualmente no existe una funcionalidad completa que conecte Component, Facade y ApiService. El siguiente es un **ejemplo conceptual de crecimiento**, no una descripción de archivos existentes. Usa un endpoint que sí está definido en `docs/openapi.yaml`:

```text
Catalog (página futura)
       ↓
CatalogFacade
       ↓
ProductApiService
       ↓
GET /api/productos/publicados
       ↓
Spring Boot
       ↓
PostgreSQL
```

Flujo explicado paso a paso:

1. La persona entra al catálogo.
2. El componente solicita `facade.load()`.
3. El facade activa su Signal de loading y limpia el error anterior.
4. El facade llama a `ProductApiService`.
5. El ApiService ejecuta el `GET` documentado.
6. Spring Boot obtiene y devuelve la información.
7. El facade actualiza el Signal de productos y desactiva loading.
8. Angular detecta el cambio del Signal y actualiza la vista.

Si el contrato no contiene la operación necesaria, se documenta la limitación; no se inventa el endpoint.

## ¿Dónde crear cada cosa?

| Necesito crear... | Ubicación |
| --- | --- |
| Nueva página de ISANORTE | `src/app/features/isanorte/<feature>/` |
| Nueva página de ISADECOR | `src/app/features/isadecor/<feature>/` |
| Componente exclusivo de una feature | `src/app/features/<area>/<feature>/components/` |
| Componente reutilizable y sin negocio | `src/app/shared/components/` |
| Estado y lógica relevante de pantalla | `<feature>/<feature>.facade.ts` |
| Petición HTTP | `src/app/data/services/`; reutilizar o ampliar el ApiService verificado del recurso |
| Request, Response o enum de API | `src/app/data/models/<dominio>/`; ampliar solo cuando cambie el contrato real |
| Tipo exclusivamente visual | Junto al componente o feature que lo usa |
| Navbar, Footer o estructura común | `src/app/layouts/` |
| Servicio global | `src/app/core/services/` |
| Guard o interceptor | Bajo `src/app/core/`, solo cuando exista una necesidad real |
| Configuración global Angular | `app.config.ts` o `core/`, según responsabilidad |
| Imagen pública | `public/images/` |

Las rutas de guards, interceptors y Admin son ubicaciones previstas; esas carpetas no existen todavía y no deben crearse vacías. `data/` sí está implementada.

## Guía para crear una nueva feature

Ejemplo: una futura `features/isadecor/catalog/`.

1. Leer `AGENTS.md` y las Skills relevantes.
2. Revisar `features/isadecor/` y `app.routes.ts`.
3. Revisar `shared/components/` y `docs/DESIGN_SYSTEM.md` antes de crear UI.
4. Crear la página con la convención actual: `catalog.ts`, `catalog.html` y `catalog.css`.
5. Crear componentes internos solo si separan una responsabilidad real.
6. Identificar los datos y estados necesarios: contenido, loading, error y vacío.
7. Si habrá backend, revisar `docs/openapi.yaml` antes de escribir tipos o URLs.
8. Crear/reutilizar modelos y ApiService solo para operaciones verificadas.
9. Crear facade si la feature tiene suficiente estado o coordinación.
10. Conectar el componente con operaciones simples del facade.
11. Registrar la ruta en `app.routes.ts`; decidir lazy loading solo mediante un cambio consciente, porque las rutas actuales son eager.
12. Revisar responsive, teclado, foco, headings, labels, imágenes y contraste.
13. Comprobar SSR, prerender e hidratación, especialmente si hay browser APIs.
14. Añadir tests de comportamiento cuando correspondan.
15. Ejecutar `npm run build` y los tests relevantes.

## Estructura interna recomendada de un feature

Esta estructura es un ejemplo para una feature futura con lógica suficiente; `catalog/` no existe actualmente:

```text
catalog/
├── catalog.ts
├── catalog.html
├── catalog.css
├── catalog.facade.ts      # solo si es necesario
└── components/            # solo si hay UI exclusiva que separar
    ├── product-card/
    ├── filters/
    └── product-grid/
```

- `catalog.ts`: componente standalone y eventos de presentación.
- `catalog.html`: template de la página.
- `catalog.css`: estilos exclusivos que no pertenecen al Design System.
- `catalog.facade.ts`: estado y lógica del catálogo; no se crea si la página es simple.
- `components/`: piezas que pertenecen exclusivamente al catálogo.

El proyecto usa nombres breves de clase y archivo (`Home`, `About`, `home.ts`) sin sufijo `Component`.

## Shared vs. componente de feature

La decisión depende del uso real, no de una posible reutilización futura:

```text
Solo lo usa Catalog
→ features/isadecor/catalog/components/

Ya lo usan Catalog + Admin Products + Home
y no conoce reglas de negocio
→ shared/components/
```

No se mueve automáticamente un componente a `shared/` porque “quizás” pueda reutilizarse algún día.

## Data y comunicación con Spring Boot

Regla de dependencias:

```text
Component  ❌ HttpClient

Component
   ↓
Facade
   ↓
ApiService
   ↓
HttpClient
```

### Estado actual

- `app.config.ts` registra `provideHttpClient(withFetch())`, compatible con browser y SSR.
- `HttpClient` se usa únicamente dentro de `data/services/`.
- `data/models/` representa request, update request, response, cambios de estado y enums reales.
- `data/services/` cubre las 66 operaciones de los 10 controllers documentados.
- Ninguna pantalla ni facade invoca todavía estos servicios, por lo que la aplicación aún no realiza peticiones a Spring Boot durante ejecución o prerender.
- La URL base se obtiene mediante `API_BASE_URL`; el valor de desarrollo documentado es `http://localhost:8080`.
- No hay proxy de desarrollo configurado. El backend no contiene una configuración CORS explícita, por lo que las pruebas browser desde el dev server de Angular requerirán definir proxy o CORS antes de conectar una feature.

### Contrato disponible

`docs/openapi.yaml` es un contrato estático derivado del backend. Documenta 48 paths y 66 operaciones en áreas como productos, categorías, proyectos, servicios, landing, empresa, cotizaciones, configuración, unidades de negocio y administradores.

El contrato declara expresamente que Security/JWT no está implementado. `x-access-intent` diferencia intención pública o administrativa, pero no representa protección efectiva.

Para productos, por ejemplo, sí constan operaciones como:

- `GET /api/productos/publicados`;
- `GET /api/productos/publicados/slug/{slug}`;
- operaciones administrativas bajo `/api/productos` y `/api/productos/{id}`.

Estos endpoints están representados en `ProductApiService`, pero aún no tienen un facade ni una pantalla consumidora.

## Base API Service

No existe `BaseApiService` ni una abstracción HTTP genérica. Aunque varios recursos comparten CRUD, las rutas públicas, búsquedas por slug/SKU/código y cambios de estado difieren. Mantener llamadas explícitas deja visible el contrato completo y evita una jerarquía genérica que hoy no reduce complejidad suficiente.

## Angular Signals

Signals permite que Angular actualice la vista cuando cambia un valor, sin administrar manualmente el refresco del template.

- `signal()` guarda estado mutable.
- `computed()` calcula un valor derivado de otros Signals.
- `effect()` ejecuta un efecto secundario cuando cambian dependencias; no reemplaza a `computed()`.

### Ejemplos reales

- `ThemeService` usa `signal<AppTheme>('light')` y expone `theme` con `asReadonly()`.
- About usa `signal<string | null>('mision')` para el acordeón Misión/Visión/Valores.
- Carousel usa un Signal privado para el índice actual.
- Button, Badge, Loading, formularios y otros componentes usan inputs basados en Signals y `computed()` para clases o estado derivado.
- InputField, SelectField, TextareaField y Modal usan `model()` para binding bidireccional.
- Modal usa `effect()` para administrar el foco al abrir y cerrar.

Un facade futuro debe conservar Signals mutables como privados cuando sea posible y exponer estado de solo lectura al componente.

## Rutas actuales

Todas las rutas se declaran en `src/app/app.routes.ts`, se cargan de forma eager y usan `PublicLayout`.

| Ruta | Feature | Layout | Estado |
| --- | --- | --- | --- |
| `/` | `features/isanorte/home` | `PublicLayout` | UI desarrollada; contenido estático |
| `/nosotros` | `features/isanorte/about` | `PublicLayout` | UI desarrollada; contenido estático y Signal local |
| `/servicios` | `features/isanorte/services` | `PublicLayout` | Placeholder |
| `/proyectos` | `features/isanorte/projects` | `PublicLayout` | Placeholder |
| `/contacto` | `features/isanorte/contact` | `PublicLayout` | Placeholder |
| `/isadecor` | `features/isadecor/home` | `PublicLayout` | Placeholder |

No existe lazy loading, ruta cliente wildcard ni página 404.

## Área ISANORTE

### Home

Es la pantalla más completa. Incluye hero cinematográfico, franja de marcas, servicios, promoción de ISADECOR, proyectos y CTA final. Reutiliza Button, Badge, Card, Carousel y CinematicTour.

Los textos, tarjetas, imágenes, enlaces, servicios y proyectos están definidos como constantes tipadas en `home.ts`. No hay backend ni facade.

### Nosotros

Incluye sección de identidad, estadísticas y acordeón de misión, visión y valores. Usa RevealStagger y un Signal local para abrir/cerrar filas.

El contenido está definido en `about.ts` y parte del encabezado también aparece directamente en el HTML. `heroData` y `valuesHeader` están declarados pero actualmente no se consumen en el template.

### Servicios, Proyectos y Contacto

Las tres rutas y componentes existen, pero sus templates solo muestran mensajes `works!`. No deben tratarse como funcionalidades terminadas.

## Área ISADECOR

El nombre oficial usado por rutas, carpetas, selectores y enlaces del frontend es `isadecor`.

### Implementado

- carpeta `features/isadecor/home/`;
- ruta pública `/isadecor`;
- enlace desde Navbar, Footer y Home de ISANORTE.

### Estado

La página solo contiene `<p>landing works!</p>`. No existen catálogo, detalle de producto, calculadora ni cotización en Angular.

No se encontraron referencias activas a `isadecord`. El título de `docs/openapi.yaml` usa `ISADECO`, que no coincide con `ISADECOR` en el frontend.

## Área Admin

No existe `features/admin/`, layout administrativo, ruta admin ni autenticación frontend.

El OpenAPI documenta operaciones con intención administrativa, pero también indica que Security/JWT aún no está implementado. Admin es una dirección futura, no una funcionalidad disponible.

## Contenido dinámico

Principio del proyecto:

```text
Angular controla CÓMO se presenta.
Backend controla QUÉ contenido se presenta.
```

El objetivo es que el contenido comercial pueda administrarse desde backend/base de datos sin reconstruir las páginas.

### Contenido estático actual

- toda la información de Home de ISANORTE;
- identidad, estadísticas, misión, visión y valores de Nosotros;
- enlaces y CTA de Navbar;
- empresa, navegación, servicios, contacto, redes y copyright de Footer;
- rutas e imágenes públicas;
- textos placeholder de Servicios, Proyectos, Contacto e ISADECOR.

### Contenido que ya viene de API

Ninguno. El contrato OpenAPI está disponible, pero Angular todavía no realiza peticiones HTTP.

## Design System

La guía visual principal es `docs/DESIGN_SYSTEM.md`. Antes de crear UI nueva debe consultarse junto con el código existente.

Estructura real:

```text
src/styles.css                 # Tailwind, imports de temas y base global
src/styles/theme.css           # tokens, utilidades, tipografía y motion
src/styles/themes/light.css    # valores cromáticos light y fallback :root
src/styles/themes/dark.css     # valores cromáticos dark
```

El sistema usa Tailwind CSS 4 con `@theme`, `@utility` y PostCSS. Incluye tokens semánticos de color, tipografía, radios, sombras, spacing y duración, además de utilidades como `app-container`, `reading-container`, `section-space` y controles de formulario.

El tema inicial se declara como light en `src/index.html`. Las secciones pueden aplicar `data-theme="dark"`. Los detalles de API visual pertenecen a `docs/DESIGN_SYSTEM.md` y a los README de componentes, no a este documento.

## Animaciones

GSAP 3.15.0 está instalado y se usa realmente en:

- `Carousel` para coverflow y marquee;
- `CinematicTour` para secuencias, zoom, fundidos y parallax;
- `RevealStagger` para apariciones escalonadas.

Estos componentes importan GSAP dinámicamente dentro de `afterNextRender()`, usan `DestroyRef` para cleanup y consultan `prefers-reduced-motion`. RevealStagger usa `IntersectionObserver` cuando su trigger es `view`.

También existen animaciones CSS en `theme.css` y estilos específicos de About.

**ScrollTrigger no está importado ni utilizado actualmente.** Es una opción prevista por las reglas del proyecto para animación ligada al scroll, no una implementación existente.

## SSR, prerender e hidratación

### SSR

Server-Side Rendering genera HTML en el servidor antes de que el navegador ejecute Angular.

- `src/main.server.ts` inicia `bootstrapApplication()` con contexto de servidor.
- `src/app/app.config.server.ts` combina la configuración normal con `provideServerRendering()`.
- `src/server.ts` crea Express, sirve archivos estáticos y delega el render a `AngularNodeAppEngine`.
- `angular.json` usa `outputMode: "server"` y define `src/server.ts` como entrada SSR.

### Prerender

Prerender genera HTML por adelantado durante el build. `app.routes.server.ts` aplica `RenderMode.Prerender` a `**`, por lo que todas las rutas Angular actuales entran en esta estrategia.

La validación de esta revisión ejecutó `npm run build` correctamente y Angular informó **6 rutas estáticas prerenderizadas**.

### Hidratación

La hidratación conecta en el navegador el HTML generado por servidor con la aplicación interactiva. `app.config.ts` registra `provideClientHydration()`.

### Advertencia para principiantes

Durante SSR no existen de la misma forma APIs exclusivas del navegador:

- `window`;
- `document` global;
- `localStorage` y `sessionStorage`;
- `navigator`;
- `IntersectionObserver` y `ResizeObserver`;
- mediciones del DOM;
- librerías que accedan al navegador al importarse.

El código actual muestra dos patrones seguros: `isPlatformBrowser()` en ThemeService y `afterNextRender()` más import dinámico en los componentes GSAP. El contenido esencial nunca debe depender de que una animación se ejecute.

## Cómo trabajar en equipo

La organización por features permite repartir trabajo con pocos cruces:

```text
Persona A → features/isanorte/about/
Persona B → features/isadecor/catalog/    (cuando exista)
Persona C → features/isanorte/projects/
```

Cada tarea debe concentrarse dentro de su feature cuando sea posible. Solo se modifican rutas, configuración, layouts, estilos globales o shared si la necesidad realmente afecta a más de una pantalla.

Antes de cambiar una API de un componente shared, se deben buscar todos sus consumidores.

## Archivos globales que requieren cuidado

| Archivo o carpeta | Por qué requiere coordinación |
| --- | --- |
| `src/app/app.routes.ts` | Toda alta o cambio de ruta pasa por este arreglo compartido. |
| `src/app/app.config.ts` | Registra providers globales e hidratación. |
| `src/app/app.config.server.ts` | Configura el render de servidor. |
| `src/app/app.routes.server.ts` | Define la estrategia de render/prerender. |
| `src/styles.css` | Carga Tailwind, temas y estilos base de toda la app. |
| `src/styles/theme.css` | Define tokens y utilidades globales. |
| `src/styles/themes/` | Cambia valores cromáticos para toda la aplicación. |
| `src/app/layouts/public-layout/` | Afecta todas las rutas actuales. |
| `src/app/shared/components/` | Un cambio de API puede romper varios consumidores. |
| `angular.json` | Controla build, assets, SSR, budgets y tests. |

## AGENTS y Skills

- `AGENTS.md` contiene reglas globales permanentes.
- `.agents/skills/` contiene procedimientos especializados que se seleccionan según la tarea.

Skills reales disponibles:

| Skill | Propósito |
| --- | --- |
| `frontend-architecture` | Ubicar archivos y mantener responsabilidades/dependencias. |
| `angular-feature` | Crear o ampliar una pantalla o funcionalidad Angular. |
| `api-integration` | Integrar Angular con contratos reales de Spring Boot. |
| `design-system` | Crear UI coherente con tokens y componentes existentes. |
| `dynamic-content` | Separar presentación de contenido administrable. |
| `gsap-animations` | Implementar movimiento GSAP accesible y seguro. |
| `ssr-safety` | Proteger SSR, prerender e hidratación. |
| `frontend-review` | Auditar y validar un cambio antes de entregarlo. |

Una tarea puede requerir varias Skills. Deben leerse desde su ubicación real, `.agents/skills/`.

## Comandos del proyecto

Todos proceden de `package.json`:

| Comando | Función |
| --- | --- |
| `npm start` | Inicia el servidor de desarrollo Angular. |
| `npm run build` | Ejecuta el build de producción con browser, SSR y prerender. |
| `npm run watch` | Mantiene un build de desarrollo observando cambios. |
| `npm test` | Ejecuta las pruebas mediante el builder de Angular/Vitest. |
| `npm run ng -- <comando>` | Ejecuta Angular CLI a través del script local. |
| `npm run serve:ssr:ISANORTE-FRONTEND` | Sirve el resultado SSR ya generado en `dist/`. |

El comando SSR necesita que exista previamente un build compatible en `dist/`.

## Tests existentes

Existe un único archivo de pruebas: `src/app/app.spec.ts`, con tres casos:

1. crea el componente raíz;
2. comprueba el `router-outlet`;
3. verifica la lista exacta de rutas públicas.

No hay specs para features, layouts, servicios o componentes compartidos.

Durante esta revisión, `npm test -- --watch=false` finalizó con **1 archivo y 3 tests aprobados**.

## Checklist para un integrante nuevo

Antes de empezar una tarea:

1. Lee `AGENTS.md`.
2. Elige y lee las Skills relevantes en `.agents/skills/`.
3. Ubica el feature y revisa rutas/consumidores.
4. Revisa `shared/components/` antes de crear UI duplicada.
5. Consulta `docs/DESIGN_SYSTEM.md` si tocarás presentación.
6. Consulta `docs/openapi.yaml` si consumirás backend; no inventes endpoints.
7. Añade facade solo cuando la lógica lo justifique.
8. Mantén SSR, accesibilidad y responsive.
9. Ejecuta `npm run build` y tests relevantes antes de terminar.

## Inconsistencias y observaciones verificadas

- `AGENTS.md` señala `.codex/skills/`, pero las ocho Skills reales están en `.agents/skills/`.
- El OpenAPI titula la API como “ISANORTE / ISADECO”, mientras el frontend usa consistentemente `ISADECOR` y `/isadecor`.
- No existe `isadecord` en rutas, carpetas ni código activo; solo se menciona en la Skill de revisión como nombre incorrecto a detectar.
- `docs/DESIGN_SYSTEM.md` llama “futuros” al Navbar y Footer en una recomendación, pero ambos ya existen dentro de `PublicLayout`.
- La sección principal de Card en Design System enumera padding small/medium/large, mientras el componente actual también admite `none`.
- `docs/openapi.yaml` documenta intención administrativa, pero declara Security/JWT como no implementado; no debe interpretarse como autorización efectiva.
- About declara `heroData` y `valuesHeader`, pero el template actual no los consume.

Estas observaciones no se corrigieron porque esta tarea es únicamente documental.

## Estado actual del frontend

| Área | Estado verificado |
| --- | --- |
| Arquitectura | Feature-Based implementada; Facade Pattern y API Service Layer previstos, todavía sin clases concretas |
| Angular | 22.1.6, standalone, sin NgModules |
| TypeScript | 6.0.3 |
| Tailwind | 4.3.3, CSS-first con PostCSS |
| SSR | Configurado con Express y `AngularNodeAppEngine` |
| Prerender | Wildcard `**` con `RenderMode.Prerender` |
| Hidratación | `provideClientHydration()` activo |
| Features | 6 páginas: 5 ISANORTE y 1 ISADECOR |
| Layouts | 1: `PublicLayout` con Navbar, RouterOutlet y Footer |
| Shared Components | 14 |
| Servicios globales | 1: `ThemeService` |
| Facades | 0 |
| ApiServices | 10; uno por recurso backend documentado |
| Modelos API | Contratos de los 10 recursos, tipos comunes y 7 enums exactos |
| Backend conectado | Capa HTTP preparada; ninguna pantalla/facade la consume todavía |
| Admin | No implementado |
| Animaciones | CSS + GSAP en Carousel, CinematicTour y RevealStagger; sin ScrollTrigger |
| Contenido dinámico desde API | Ninguno |
| Tests | 1 archivo spec con 3 casos |
| Carga de rutas | Eager; no existe lazy loading |
| Build verificado | Correcto; bundles browser/server y 6 rutas prerenderizadas tras crear `data/` |

La siguiente evolución no requiere reorganizar otra vez el proyecto: una feature real puede añadir su facade, inyectar el ApiService del recurso y gestionar datos, loading y errores sin colocar HTTP en componentes.
