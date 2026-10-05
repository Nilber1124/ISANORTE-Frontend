---
name: api-integration
description: Integrate the ISANORTE Angular frontend with the documented Spring Boot API. Use when adding HttpClient, API models, ApiServices, facades, or server-backed loading and errors; not for static UI or invented mock contracts.
---

# API Integration

## Cuándo utilizarla

Úsala cuando una feature necesite leer o modificar datos reales de Spring Boot, o cuando se creen modelos del contrato, un ApiService o el estado asíncrono de un facade.

No la uses para contenido puramente local ni para diseñar una API que todavía no existe.

## Objetivo

Integrar Angular con el contrato real del backend sin inventar endpoints, DTO, enums, permisos ni códigos de respuesta. El flujo obligatorio es `Feature → Facade → ApiService → Backend`.

## Procedimiento

1. Lee `AGENTS.md`, la feature afectada y `docs/openapi.yaml` completo en las operaciones relacionadas.
2. Comprueba para cada operación: `operationId`, método, path, parámetros, request body, response, campos requeridos/nulables, enum, códigos HTTP y `x-access-intent`.
3. Si hay una fuente backend más reciente y autorizada, contrasta el OpenAPI. Si hay contradicción, detén la integración y documenta cuál contrato necesita aclaración.
4. Verifica la infraestructura actual. El proyecto todavía no registra `provideHttpClient()` ni contiene `data/`, modelos API o ApiServices; añade únicamente lo necesario para la primera integración real.
5. Modela el contrato bajo `data/models/<dominio>/` cuando exista uso real:
   - `*Request` para creación;
   - `*UpdateRequest` cuando el contrato lo diferencie;
   - `*Response` para respuestas;
   - enums con los valores exactos del OpenAPI;
   - error común conforme a `ApiErrorResponse`.
6. Trata los UUID como `string` salvo que el contrato real cambie. Representa de forma explícita campos requeridos, opcionales y `null`.
7. Crea el ApiService bajo `data/services/`. Debe limitarse a `HttpClient`, URL, parámetros y verbos HTTP documentados.
8. Crea o amplía el facade del feature para coordinar el ApiService y exponer Signals de datos, loading y error, más `computed()` cuando haya estado derivado.
9. Mantén el componente en presentación, bindings y llamadas simples al facade; nunca inyectes `HttpClient` allí.
10. Implementa estados de éxito, lista vacía, respuesta nula cuando sea válida, 400, 404, 409 y error inesperado. Conserva información útil sin exponer detalles sensibles.
11. Comprueba si la carga debe ocurrir durante SSR/prerender y evita peticiones duplicadas o estado inicial distinto durante hidratación.
12. Añade pruebas del contrato consumido y ejecuta el build.

## Reglas

- Nunca inventar endpoints, DTO, enums, paginación, filtros, DELETE, autenticación ni permisos.
- `docs/openapi.yaml` es el contrato disponible: actualmente documenta 48 paths, 66 operaciones y ningún DELETE.
- `x-access-intent` describe la intención pública o administrativa, pero el mismo OpenAPI indica que Security/JWT todavía no está implementado. No presentar una ruta como protegida solo por esa etiqueta.
- No exponer operaciones administrativas desde UI pública sin una decisión explícita y protección backend real.
- ApiService no contiene estado visual, mensajes de UI, filtros de pantalla ni coordinación entre dominios.
- Facade no construye URLs ni conoce detalles de transporte que correspondan al ApiService.
- No crear un mapeo DTO-modelo duplicado si ambos tipos serían idénticos. Separarlos solo cuando el modelo de UI difiera realmente.
- Codificar correctamente parámetros de path/query y respetar el verbo HTTP exacto.
- No silenciar errores con valores vacíos indistinguibles de una respuesta válida.
- Si falta una operación backend, documentar la limitación y no simularla como contrato definitivo.

## Checklist final

- [ ] Endpoint, verbo, parámetros y códigos están verificados en OpenAPI.
- [ ] Request, Response, enum, UUID y nulabilidad coinciden con el contrato.
- [ ] Se distinguió intención pública/administrativa de seguridad realmente implementada.
- [ ] El componente no usa `HttpClient` ni contiene detalles HTTP.
- [ ] ApiService, facade y models tienen responsabilidades separadas.
- [ ] Loading, vacío, null, 400, 404, 409 y error inesperado tienen comportamiento definido.
- [ ] La integración es segura para SSR e hidratación.
- [ ] No se inventó ninguna capacidad backend.
- [ ] `npm run build` pasa.

