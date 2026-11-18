---
name: frontend-architecture
description: Decide file placement and refactor the ISANORTE Angular frontend across core, shared, data, layouts, features, facades, and API services. Use for structural changes, file moves, new features, facade/API-service decisions, or architecture reviews; not for isolated visual tweaks.
---

# Frontend Architecture

## Cuándo utilizarla

Úsala al crear o reorganizar features, mover archivos, diseñar facades o ApiServices, decidir dónde vive código nuevo o revisar dependencias entre capas.

No la actives para un ajuste visual aislado que no cambia responsabilidades ni estructura.

## Objetivo

Mantener la arquitectura Feature-Based de ISANORTE clara para un equipo con integrantes que aún están aprendiendo Angular. El diseño objetivo es:

```text
Component → Facade → ApiService → Spring Boot
```

La arquitectura debe crecer por necesidad real, no por anticipación.

## Procedimiento

1. Lee `AGENTS.md` e inspecciona la estructura real de `src/app/`.
2. Inspecciona el feature, sus imports, rutas y consumidores antes de mover o crear archivos.
3. Clasifica cada responsabilidad:

   | Ubicación | Responsabilidad |
   | --- | --- |
   | `features/` | Página o funcionalidad de ISANORTE, ISADECOR o administración |
   | `layouts/` | Navbar, footer, sidebar, outlets y estructura visual común |
   | `shared/` | UI y utilidades reutilizables sin conocimiento del negocio |
   | `core/` | Infraestructura global; actualmente contiene `ThemeService` |
   | `data/models/` | Contratos TypeScript derivados de API real |
   | `data/services/` | Comunicación HTTP con endpoints reales |

4. Decide si el feature necesita facade. Créalo solo si coordina servicios, carga, errores, filtros, formularios complejos o una colección mutable. Un Signal local basta para estado visual pequeño, como el acordeón actual de About.
5. Si hay HTTP, confirma primero el contrato en `docs/openapi.yaml`; crea modelos y ApiService mínimos para la operación real.
6. Mantén la dependencia en una sola dirección: feature/component → facade → ApiService → backend. Shared no debe importar features.
7. Actualiza rutas e imports. Conserva las URLs públicas en español aunque las carpetas internas actuales estén en inglés.
8. Busca imports antiguos y elimina carpetas vacías únicamente después de comprobar consumidores.
9. Verifica SSR, prerender, hidratación y build.

## Reglas

- No crear facade para Button, Card, Navbar, Footer, un hero puramente visual o una pantalla sin lógica suficiente.
- No crear `BaseFacade`, facades genéricos, Repository Pattern frontend, Use Cases, Ports/Adapters ni NgRx.
- No crear `data/`, `admin/` ni estructuras futuras vacías.
- No mover componentes compartidos al feature si siguen siendo agnósticos del negocio.
- No convertir tipos locales puramente visuales en modelos API.
- No introducir aliases de imports salvo que reduzcan complejidad real y se configuren de forma coherente.
- Preservar componentes standalone y evitar NgModules.
- Antes de modificar una API pública de shared, buscar todos sus consumidores.
- Si documentación y código discrepan, usar el código como verdad del frontend y registrar la discrepancia.

## Checklist final

- [ ] Cada archivo tiene una responsabilidad y una ubicación justificables.
- [ ] El componente no contiene HTTP ni coordinación compleja.
- [ ] Solo existe facade si aporta valor real.
- [ ] ApiServices y models corresponden a contratos verificados.
- [ ] No hay dependencias inversas desde shared/core/data hacia features.
- [ ] No quedaron imports antiguos, duplicados o carpetas vacías.
- [ ] Rutas públicas y comportamiento se conservaron.
- [ ] `npm run build` finaliza correctamente.
