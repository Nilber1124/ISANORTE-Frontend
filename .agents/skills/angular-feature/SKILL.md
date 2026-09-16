---
name: angular-feature
description: Implement or extend a user-facing Angular page or feature in ISANORTE, ISADECOR, or the future admin area. Use for screens such as About, catalog, projects, product detail, quotes, or admin workflows; not for shared primitives or API-only work.
---

# Angular Feature

## Cuándo utilizarla

Úsala al crear o ampliar una página o funcionalidad que una persona utiliza: home, Nosotros, servicios, proyectos, contacto, catálogo ISADECOR, producto, cotización o una futura pantalla administrativa.

Para una reorganización transversal usa `frontend-architecture`; para integrar endpoints usa además `api-integration`.

## Objetivo

Entregar una feature Angular moderna, tipada, responsive, accesible y compatible con SSR, integrada con la estructura real del proyecto sin añadir capas innecesarias.

## Procedimiento

1. Lee `AGENTS.md` y revisa la carpeta objetivo en `src/app/features/`.
2. Revisa `src/app/app.routes.ts` y conserva las URLs públicas existentes. Hoy existen `/`, `/nosotros`, `/servicios`, `/proyectos`, `/contacto` y `/isadecor` bajo `PublicLayout`.
3. Revisa `shared/components` y `docs/DESIGN_SYSTEM.md` antes de diseñar UI.
4. Identifica los estados de pantalla: contenido, loading, error, vacío, permisos y acciones.
5. Identifica la fuente real de datos:
   - contenido local existente;
   - inputs o estado visual;
   - API documentada en `docs/openapi.yaml`.
6. Decide la complejidad mínima:
   - feature visual/simple: componente con estado local;
   - coordinación de datos/errores/filtros/formulario complejo: facade;
   - HTTP real: modelos + ApiService + facade.
7. Implementa con componente standalone, tipado fuerte, `OnPush`, control flow moderno y Signals cuando haya estado.
8. Mantén el template centrado en presentación y eventos simples. Extrae subcomponentes solo cuando tengan una responsabilidad o reutilización clara.
9. Comprueba responsive en móvil, tablet y escritorio, y estados de teclado/foco.
10. Revisa seguridad SSR antes de usar browser APIs o animaciones.
11. Actualiza o añade pruebas solo para comportamiento relevante; no escribas pruebas artificiales de cobertura.
12. Ejecuta build y tests pertinentes.

## Reglas

- No crear facade para una pantalla puramente visual ni para envolver constantes.
- Usar `signal()` para estado mutable local y `computed()` para estado derivado; no duplicar ambos.
- Evitar `subscribe()` en componentes. La coordinación asíncrona pertenece al facade y debe tener ciclo de vida seguro.
- Preferir `inject()` cuando exista una dependencia real.
- Usar `@if`, `@for` y `@switch` de forma consistente con el código actual.
- Preferir `ChangeDetectionStrategy.OnPush` para componentes nuevos.
- Evitar `any`; representar nulabilidad y estados vacíos explícitamente.
- No convertir una página en client-only por una animación.
- No inventar contenido final, rutas, permisos o datos backend.
- ISANORTE Home y About ya contienen UI real; Services, Projects, Contact e ISADECOR Home siguen siendo placeholders. No tratarlos como funcionalidades terminadas.

## Checklist final

- [ ] La feature vive bajo la unidad de negocio correcta.
- [ ] La ruta y `PublicLayout` funcionan como antes.
- [ ] Shared existente fue reutilizado cuando correspondía.
- [ ] Facade y ApiService solo existen si fueron necesarios.
- [ ] Hay estados loading/error/empty cuando hay datos asíncronos.
- [ ] La UI es responsive y usable con teclado.
- [ ] Browser APIs están protegidas para SSR.
- [ ] No se perdió contenido esencial en el HTML prerenderizado.
- [ ] `npm run build` pasa.
- [ ] Tests relevantes pasan con `npm test -- --watch=false`.
