# Estructura actual del frontend

Este documento describe la estructura real del frontend de ISANORTE. No incluye carpetas o módulos futuros como si ya estuvieran implementados.

## Árbol real de `src/app`

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
│   └── services/
│       └── theme.service.ts
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
        │   ├── README.md
        │   ├── alert.html
        │   └── alert.ts
        ├── badge/
        │   ├── README.md
        │   ├── badge.html
        │   └── badge.ts
        ├── button/
        │   ├── README.md
        │   ├── button.html
        │   └── button.ts
        ├── card/
        │   ├── README.md
        │   ├── card.html
        │   └── card.ts
        ├── carousel/
        │   ├── carousel.css
        │   ├── carousel.html
        │   └── carousel.ts
        ├── cinematic-tour/
        │   ├── cinematic-tour.css
        │   ├── cinematic-tour.html
        │   └── cinematic-tour.ts
        ├── empty-state/
        │   ├── README.md
        │   ├── empty-state.html
        │   └── empty-state.ts
        ├── input-field/
        │   ├── README.md
        │   ├── input-field.html
        │   └── input-field.ts
        ├── loading/
        │   ├── README.md
        │   ├── loading.html
        │   └── loading.ts
        ├── modal/
        │   ├── README.md
        │   ├── modal.html
        │   └── modal.ts
        ├── reveal-stagger/
        │   ├── reveal-stagger.css
        │   ├── reveal-stagger.html
        │   └── reveal-stagger.ts
        ├── section-title/
        │   ├── README.md
        │   ├── section-title.html
        │   └── section-title.ts
        ├── select-field/
        │   ├── README.md
        │   ├── select-field.html
        │   └── select-field.ts
        └── textarea-field/
            ├── README.md
            ├── textarea-field.html
            └── textarea-field.ts
```

No existen actualmente `data/`, `features/admin/`, facades ni API services. Se crearán cuando aparezca una integración o lógica real que los necesite; no se mantienen carpetas vacías.

## Arquitectura del frontend

La aplicación sigue una arquitectura sencilla basada en funcionalidades y preparada para crecer con Facade Pattern, API Service Layer y Angular Signals.

### `core`

Contiene infraestructura global que existe una sola vez para toda la aplicación. Actualmente solo contiene `ThemeService`, responsable del tema claro/oscuro y compatible con SSR.

### `shared`

Contiene componentes visuales reutilizables que no conocen el negocio de ISANORTE o ISADECOR. Aquí viven controles del Design System y componentes genéricos de animación/composición como Carousel, CinematicTour y RevealStagger. Sus APIs públicas se conservan sin cambios.

### `layouts`

Contiene la estructura visual global. `PublicLayout` compone `Navbar`, el `router-outlet` y `Footer`. Navbar y Footer conservan su contenido y presentación, pero ya no están mezclados con componentes compartidos genéricos.

### `features`

Una feature representa una pantalla o funcionalidad que utiliza la persona usuaria:

- `features/isanorte/home` atiende `/`.
- `features/isanorte/about` atiende `/nosotros`.
- `features/isanorte/services` atiende `/servicios`.
- `features/isanorte/projects` atiende `/proyectos`.
- `features/isanorte/contact` atiende `/contacto`.
- `features/isadecor/home` atiende `/isadecor`.

Las URLs públicas en español se mantienen aunque los nombres internos de carpetas sean consistentes en inglés.

### `data` y API Service Layer

La capa `data` se añadirá cuando exista comunicación HTTP real con Spring Boot. Un API service tendrá una sola responsabilidad: usar `HttpClient` para ejecutar operaciones contra endpoints reales y trabajar con modelos reales. Actualmente no se crea esta carpeta porque no hay endpoints, DTO ni modelos implementados.

### Facade Pattern

Un facade se añadirá solo cuando una feature necesite coordinar servicios, loading, errores, filtros, formularios complejos o colecciones. El flujo previsto es:

```text
Component → Facade → ApiService → Spring Boot
```

Las pantallas actuales usan contenido estático y lógica visual local pequeña. Por eso todavía no necesitan facade. No se crean facades para Button, Card, Navbar ni animaciones visuales.

### Angular Signals

Signals es la herramienta de estado local y de feature. Actualmente se usa en `ThemeService`, el acordeón de About, el estado interno de Carousel y las APIs reactivas de los componentes compartidos. Los futuros facades expondrán estado de datos, loading y errores como signals de solo lectura.

## Rutas, SSR, prerender e hidratación

`app.routes.ts` declara las seis rutas públicas dentro de `PublicLayout`. `app.routes.server.ts` aplica `RenderMode.Prerender` a `**`, por lo que todas las rutas conocidas se prerenderizan durante el build.

El servidor usa `AngularNodeAppEngine` y Express desde `src/server.ts`. `app.config.server.ts` combina la configuración del navegador con `provideServerRendering(withRoutes(serverRoutes))`. La hidratación del HTML prerenderizado se habilita en `app.config.ts` mediante `provideClientHydration()`.

Carousel, CinematicTour y RevealStagger cargan GSAP dentro de `afterNextRender()`. De esta forma las APIs de navegador y las animaciones se inicializan después del render del cliente y no durante SSR.

## Estilos y Design System

Tailwind CSS 4 se procesa mediante `@tailwindcss/postcss` configurado en `.postcssrc.json`. `src/styles.css` importa Tailwind y los tres archivos del sistema visual:

```text
src/styles/
├── theme.css
└── themes/
    ├── dark.css
    └── light.css
```

`theme.css` define tokens y utilidades CSS-first. Los archivos de tema contienen únicamente valores cromáticos. Las reglas detalladas de uso están en `docs/DESIGN_SYSTEM.md`.

## Crecimiento futuro

Cuando el contenido deje de ser estático, cada feature podrá incorporar su facade sin volver a mover la pantalla. Los modelos y API services reales podrán añadirse bajo `data/models` y `data/services`; por ejemplo, una futura home dinámica podrá coordinar servicios de landing, empresa, servicios, proyectos y unidades de negocio desde un único `HomeFacade`.
