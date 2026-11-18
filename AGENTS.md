# ISANORTE Frontend

## 1. Contexto del proyecto

- Angular 22 con componentes standalone, TypeScript 6, RxJS 7.8 y npm.
- Tailwind CSS 4.3.3 mediante PostCSS y configuración CSS-first.
- Angular SSR con Express, prerender para todas las rutas e hidratación del cliente.
- GSAP 3.15 para animaciones; Vitest y `@angular/build:unit-test` para pruebas.
- Spring Boot es el backend documentado en `docs/openapi.yaml`; todavía no existe integración HTTP en Angular.
- La aplicación pública separa ISANORTE e ISADECOR. Varias pantallas siguen siendo placeholders y Home/About conservan contenido estático.
- Antes de cambiar estructura, API o UI, revisar el código real y `docs/openapi.yaml` o `docs/DESIGN_SYSTEM.md` según corresponda.

## 2. Prioridad de instrucciones

1. Respetar las reglas globales de este `AGENTS.md`.
2. Aplicar las Skills relevantes para la tarea.
3. Revisar siempre el código real antes de asumir una implementación.
4. Revisar documentación y contratos reales cuando la tarea dependa de ellos.
5. Si una Skill contradice el código actual, OpenAPI, backend o Design System, verificar la causa antes de modificar.
6. No inventar contratos, endpoints ni funcionalidades para resolver una contradicción.

## 3. Descubrimiento antes de actuar

Antes de un cambio importante, inspeccionar el feature afectado, sus dependencias, consumidores y rutas. Revisar componentes compartidos y Design System si afecta UI; OpenAPI/documentación si afecta API; y configuración SSR si utiliza browser APIs. Primero comprender el código existente, después modificarlo.

## 4. Arquitectura

La dirección del proyecto es Feature-Based Architecture + Facade Pattern + API Service Layer + Angular Signals:

```text
Component → Facade → ApiService → Spring Boot
```

Mantenerla sencilla. No introducir por defecto Clean Architecture estricta, Use Cases, Ports/Adapters, Repository Pattern frontend, BaseFacade, NgRx o Redux.

### Responsabilidades esenciales

- **Component:** presentación, eventos, bindings e interacción visual.
- **Facade:** estado con signals/computed, loading, errores, filtros, coordinación de servicios y lógica específica del feature.
- **ApiService:** `HttpClient`, URLs y operaciones HTTP (`GET`, `POST`, `PUT`, `PATCH`).
- **Models:** tipos exactos del contrato API: request, update request, response, enums y errores.
- **Shared:** UI y utilidades reutilizables sin conocimiento del negocio.
- **Layouts:** navbar, footer, sidebar, `router-outlet` y estructura visual común.
- **Core:** infraestructura global. Actualmente contiene `ThemeService`.
- **Features:** páginas y funcionalidades de ISANORTE, ISADECOR y, cuando exista, administración.

No todo componente necesita facade. Usarlo cuando exista estado relevante, coordinación de servicios, filtros, loading, errores o lógica de pantalla. No crear `BaseFacade`, carpetas o abstracciones vacías; `data/` se crea cuando exista integración HTTP real.

## 5. Skills del proyecto

Las instrucciones especializadas viven en `.codex/skills/`. El agente debe abrir y aplicar las Skills que correspondan al alcance real de la tarea:

- **`frontend-architecture`:** usar al crear, mover o reorganizar features, facades, ApiServices, models o carpetas; mantiene simples las responsabilidades y dependencias.
- **`angular-feature`:** usar al crear o ampliar una página o funcionalidad; guía su implementación Angular, responsive, accesible y tipada.
- **`api-integration`:** usar al consumir Spring Boot, crear models/ApiServices o manejar estado asíncrono; exige respetar el contrato real.
- **`design-system`:** usar para UI, estilos, formularios, themes o responsive; conserva tokens, componentes compartidos y lenguaje visual.
- **`dynamic-content`:** usar para contenido comercial administrable; separa la presentación Angular del contenido definido por backend.
- **`gsap-animations`:** usar para entrances, reveals, parallax, timelines o ScrollTrigger; mantiene movimiento accesible y con cleanup.
- **`ssr-safety`:** usar con browser APIs, DOM, storage, observers, GSAP o datos renderizados en servidor; protege SSR, prerender e hidratación.
- **`frontend-review`:** usar para auditoría, regresiones y validación final de cambios significativos.

Una tarea puede requerir varias Skills. Por ejemplo:

- Catálogo conectado al backend: `frontend-architecture`, `angular-feature`, `api-integration`, `design-system`, `ssr-safety` y `frontend-review`.
- Animaciones para ISADECOR: `angular-feature`, `design-system`, `gsap-animations`, `ssr-safety` y `frontend-review`.
- Migración de contenido estático a backend: `dynamic-content`, `api-integration`, `frontend-architecture` y `frontend-review`.

## 6. Reglas Angular

- Mantener componentes standalone; no crear NgModules.
- Preferir `inject()`, signals, `computed()`, `@if`, `@for` y `ChangeDetectionStrategy.OnPush` cuando aporten valor.
- Usar tipado fuerte y evitar `any`.
- Mantener el estado derivado en `computed()` y evitar duplicarlo.
- No colocar suscripciones, estado de carga o coordinación HTTP en componentes.
- No migrar código existente solo para cambiar sintaxis si no mejora la tarea actual.

## 7. Backend y contenido dinámico

- Nunca inventar endpoints, DTO, campos, enums, códigos HTTP o reglas de negocio. Revisar primero `docs/openapi.yaml` y documentación vigente.
- HTTP vive en ApiServices, nunca en componentes. No inyectar `HttpClient` directamente en componentes.
- Diferenciar operaciones públicas y administrativas; una intención documentada no sustituye seguridad implementada.
- Si falta una operación backend, documentar la limitación y no simularla como contrato real.
- El contenido comercial de ISANORTE e ISADECOR debe poder evolucionar hacia contenido administrable: Angular define principalmente **cómo** se presenta y backend **qué** contenido se presenta.

Los procedimientos detallados pertenecen a `api-integration` y `dynamic-content`.

## 8. Design System

Antes de crear UI, revisar `docs/DESIGN_SYSTEM.md`, los tokens y `shared/components`. Reutilizar componentes existentes y evitar valores visuales arbitrarios cuando haya un token semántico. Aplicar `design-system` para el procedimiento completo.

No modificar las APIs públicas de componentes compartidos sin revisar todos sus consumidores.

## 9. SSR y animaciones

Toda funcionalidad debe conservar SSR, prerender e hidratación. Las browser APIs deben aislarse correctamente y el contenido esencial no puede depender de una animación.

Las animaciones deben respetar accesibilidad y `prefers-reduced-motion`. Aplicar `gsap-animations` para GSAP/ScrollTrigger y `ssr-safety` cuando intervengan DOM, browser APIs o renderizado de servidor.

## 10. Calidad

Después de cambios significativos, aplicar `frontend-review` y ejecutar al menos:

```bash
npm run build
```

Si existen tests relevantes y están configurados, ejecutar `npm test`. No crear ni ejecutar pruebas artificiales solo para aumentar cobertura. No finalizar una tarea que rompa TypeScript, Angular, SSR, prerender, hidratación o rutas existentes.

## 11. Git

- No hacer commit ni push salvo solicitud explícita.
- No sobrescribir cambios ajenos o sin commit.
- No modificar backend desde una tarea frontend salvo solicitud explícita.

## 12. Principio general

Priorizar, en este orden: claridad, comprensión por el equipo, reutilización, tipado, separación de responsabilidades, accesibilidad, rendimiento y mantenibilidad. Evitar sobrearquitectura.
